import { Request, Response, NextFunction } from 'express';
import { stripe } from '../../lib/stripe';
import * as service from './payments.service';

export async function createPaymentIntent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { bookingId } = req.validated;
    const result = await service.createPaymentIntent(bookingId, req.user!.userId);

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function confirmPayment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { paymentId } = req.validated;
    const result = await service.confirmPayment(paymentId);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getPaymentHistory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const result = await service.getPaymentHistory(
      req.user!.userId,
      req.user!.role,
      page,
      limit,
    );

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function connectOnboard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.connectOnboard(
      req.user!.userId,
      req.body.email || '',
    );

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function connectStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.getConnectStatus(req.user!.userId);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function processRefund(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const bookingId = req.params.bookingId as string;
    const result = await service.processRefund(bookingId);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function handleWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    await service.handleWebhook(event);

    res.json({ received: true });
  } catch (err) {
    if (err instanceof Error && err.message.includes('signature')) {
      res.status(400).json({ success: false, error: { message: 'Invalid webhook signature' } });
      return;
    }
    next(err);
  }
}

export async function getEarnings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.getEarnings(req.user!.userId);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
