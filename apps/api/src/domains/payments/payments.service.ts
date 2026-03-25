import { prisma } from '@jobsy/database';
import { stripe } from '../../lib/stripe';
import { AppError } from '../../middleware/error-handler';
import { calculatePagination } from '@jobsy/shared';
import type Stripe from 'stripe';

const PLATFORM_COMMISSION_RATE = parseFloat(
  process.env.PLATFORM_COMMISSION_RATE || '0.10',
);

export async function createPaymentIntent(bookingId: string, customerId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      payment: true,
      provider: { select: { id: true, stripeAccountId: true } },
    },
  });

  if (!booking) {
    throw new AppError('NOT_FOUND', 404, 'Booking not found');
  }

  if (booking.customerId !== customerId) {
    throw new AppError('FORBIDDEN', 403, 'You are not the customer for this booking');
  }

  if (booking.payment?.status === 'SUCCEEDED') {
    throw new AppError('CONFLICT', 409, 'Booking has already been paid');
  }

  const amount = Math.round(booking.price * 100); // cents
  const platformFee = Math.round(amount * PLATFORM_COMMISSION_RATE);
  const providerAmount = amount - platformFee;

  const intentParams: Stripe.PaymentIntentCreateParams = {
    amount,
    currency: booking.currency.toLowerCase(),
    metadata: {
      bookingId: booking.id,
      customerId,
      providerId: booking.providerId,
    },
  };

  if (booking.provider.stripeAccountId) {
    intentParams.transfer_data = {
      destination: booking.provider.stripeAccountId,
      amount: providerAmount,
    };
  }

  const paymentIntent = await stripe.paymentIntents.create(intentParams);

  const payment = await prisma.payment.upsert({
    where: { bookingId },
    update: {
      stripePaymentIntentId: paymentIntent.id,
      amount: booking.price,
      platformFee: platformFee / 100,
      providerAmount: providerAmount / 100,
      currency: booking.currency,
      status: 'PROCESSING',
    },
    create: {
      bookingId,
      stripePaymentIntentId: paymentIntent.id,
      amount: booking.price,
      platformFee: platformFee / 100,
      providerAmount: providerAmount / 100,
      currency: booking.currency,
      status: 'PROCESSING',
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentId: payment.id,
    amount: payment.amount,
    currency: payment.currency,
  };
}

export async function confirmPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

  if (!payment) {
    throw new AppError('NOT_FOUND', 404, 'Payment not found');
  }

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'SUCCEEDED',
      paidAt: new Date(),
    },
  });

  return updated;
}

export async function getPaymentHistory(
  userId: string,
  role: string,
  page: number,
  limit: number,
) {
  const where =
    role === 'PROVIDER'
      ? { booking: { providerId: userId } }
      : role === 'ADMIN'
        ? {}
        : { booking: { customerId: userId } };

  const total = await prisma.payment.count({ where });
  const { skip, take, pagination } = calculatePagination(page, limit, total);

  const payments = await prisma.payment.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      booking: {
        select: {
          id: true,
          service: { select: { id: true, title: true } },
          customer: { select: { id: true, name: true } },
          provider: { select: { id: true, name: true } },
          scheduledDate: true,
        },
      },
    },
  });

  return { data: payments, pagination };
}

export async function connectOnboard(userId: string, email: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('NOT_FOUND', 404, 'User not found');
  }

  let stripeAccountId = user.stripeAccountId;

  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: 'standard',
      email,
      metadata: { userId },
    });
    stripeAccountId = account.id;

    await prisma.user.update({
      where: { id: userId },
      data: { stripeAccountId },
    });
  }

  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${process.env.APP_URL}/payments/connect/refresh`,
    return_url: `${process.env.APP_URL}/payments/connect/return`,
    type: 'account_onboarding',
  });

  return { url: accountLink.url, stripeAccountId };
}

export async function getConnectStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeAccountId: true, stripeOnboarded: true },
  });

  if (!user) {
    throw new AppError('NOT_FOUND', 404, 'User not found');
  }

  if (!user.stripeAccountId) {
    return { hasAccount: false, onboarded: false, chargesEnabled: false, payoutsEnabled: false };
  }

  const account = await stripe.accounts.retrieve(user.stripeAccountId);

  const onboarded = account.charges_enabled && account.payouts_enabled;

  if (onboarded && !user.stripeOnboarded) {
    await prisma.user.update({
      where: { id: userId },
      data: { stripeOnboarded: true },
    });
  }

  return {
    hasAccount: true,
    onboarded,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
  };
}

export async function processRefund(bookingId: string) {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (!payment) {
    throw new AppError('NOT_FOUND', 404, 'Payment not found for this booking');
  }

  if (payment.status !== 'SUCCEEDED') {
    throw new AppError('BAD_REQUEST', 400, 'Only succeeded payments can be refunded');
  }

  if (!payment.stripePaymentIntentId) {
    throw new AppError('BAD_REQUEST', 400, 'No Stripe payment intent associated');
  }

  const refund = await stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId,
  });

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'REFUNDED',
      refundedAmount: payment.amount,
      refundedAt: new Date(),
    },
  });

  return { refund, payment: updated };
}

export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata.bookingId;
      if (bookingId) {
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: intent.id },
          data: { status: 'SUCCEEDED', paidAt: new Date() },
        });
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'ACCEPTED' },
        });
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: intent.id },
        data: { status: 'FAILED' },
      });
      break;
    }

    case 'account.updated': {
      const account = event.data.object as Stripe.Account;
      if (account.charges_enabled && account.payouts_enabled) {
        await prisma.user.updateMany({
          where: { stripeAccountId: account.id },
          data: { stripeOnboarded: true },
        });
      }
      break;
    }

    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
  }
}

export async function getEarnings(providerId: string) {
  const result = await prisma.payment.aggregate({
    where: {
      booking: { providerId },
      status: 'SUCCEEDED',
    },
    _sum: {
      providerAmount: true,
    },
    _count: {
      id: true,
    },
  });

  const pendingResult = await prisma.payment.aggregate({
    where: {
      booking: { providerId },
      status: 'PROCESSING',
    },
    _sum: {
      providerAmount: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    totalEarnings: result._sum.providerAmount ?? 0,
    completedPayments: result._count.id,
    pendingEarnings: pendingResult._sum.providerAmount ?? 0,
    pendingPayments: pendingResult._count.id,
  };
}
