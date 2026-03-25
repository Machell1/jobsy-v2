import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@jobsy/database', () => ({
  prisma: {
    booking: { findUnique: vi.fn(), update: vi.fn() },
    payment: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
    user: { findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  },
}));

vi.mock('../../lib/stripe', () => ({
  stripe: {
    paymentIntents: { create: vi.fn() },
    accounts: { create: vi.fn(), retrieve: vi.fn() },
    accountLinks: { create: vi.fn() },
    refunds: { create: vi.fn() },
    webhooks: { constructEvent: vi.fn() },
  },
}));

import { prisma } from '@jobsy/database';
import { stripe } from '../../lib/stripe';
import * as service from './payments.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Payments Service', () => {
  describe('createPaymentIntent', () => {
    it('should create a payment intent for a valid booking', async () => {
      const mockBooking = {
        id: 'booking-1',
        customerId: 'customer-1',
        providerId: 'provider-1',
        price: 100,
        currency: 'JMD',
        payment: null,
        provider: { id: 'provider-1', stripeAccountId: 'acct_123' },
      };

      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as any);
      vi.mocked(stripe.paymentIntents.create).mockResolvedValue({
        id: 'pi_123',
        client_secret: 'secret_123',
      } as any);
      vi.mocked(prisma.payment.upsert).mockResolvedValue({
        id: 'pay-1',
        amount: 100,
        currency: 'JMD',
      } as any);

      const result = await service.createPaymentIntent('booking-1', 'customer-1');
      expect(result.clientSecret).toBe('secret_123');
      expect(stripe.paymentIntents.create).toHaveBeenCalled();
    });

    it('should throw if booking not found', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(null);
      await expect(
        service.createPaymentIntent('invalid', 'customer-1'),
      ).rejects.toThrow('Booking not found');
    });

    it('should throw if customer does not match', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue({
        id: 'booking-1',
        customerId: 'other-customer',
        payment: null,
        provider: { id: 'p1', stripeAccountId: null },
      } as any);
      await expect(
        service.createPaymentIntent('booking-1', 'customer-1'),
      ).rejects.toThrow('not the customer');
    });
  });

  describe('confirmPayment', () => {
    it('should update payment status to SUCCEEDED', async () => {
      vi.mocked(prisma.payment.findUnique).mockResolvedValue({ id: 'pay-1' } as any);
      vi.mocked(prisma.payment.update).mockResolvedValue({
        id: 'pay-1',
        status: 'SUCCEEDED',
      } as any);

      const result = await service.confirmPayment('pay-1');
      expect(result.status).toBe('SUCCEEDED');
    });

    it('should throw if payment not found', async () => {
      vi.mocked(prisma.payment.findUnique).mockResolvedValue(null);
      await expect(service.confirmPayment('invalid')).rejects.toThrow('Payment not found');
    });
  });

  describe('getPaymentHistory', () => {
    it('should return paginated payments for customer', async () => {
      vi.mocked(prisma.payment.count).mockResolvedValue(1);
      vi.mocked(prisma.payment.findMany).mockResolvedValue([{ id: 'pay-1' }] as any);

      const result = await service.getPaymentHistory('user-1', 'CUSTOMER', 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('connectOnboard', () => {
    it('should create a Stripe account and return onboarding URL', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        stripeAccountId: null,
      } as any);
      vi.mocked(stripe.accounts.create).mockResolvedValue({ id: 'acct_new' } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);
      vi.mocked(stripe.accountLinks.create).mockResolvedValue({
        url: 'https://connect.stripe.com/onboard',
      } as any);

      const result = await service.connectOnboard('user-1', 'test@example.com');
      expect(result.url).toBeDefined();
    });
  });

  describe('getConnectStatus', () => {
    it('should return status for provider with Stripe account', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        stripeAccountId: 'acct_123',
        stripeOnboarded: false,
      } as any);
      vi.mocked(stripe.accounts.retrieve).mockResolvedValue({
        charges_enabled: true,
        payouts_enabled: true,
      } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const result = await service.getConnectStatus('user-1');
      expect(result.onboarded).toBe(true);
    });
  });

  describe('processRefund', () => {
    it('should create a refund for a succeeded payment', async () => {
      vi.mocked(prisma.payment.findUnique).mockResolvedValue({
        id: 'pay-1',
        status: 'SUCCEEDED',
        stripePaymentIntentId: 'pi_123',
        amount: 100,
      } as any);
      vi.mocked(stripe.refunds.create).mockResolvedValue({ id: 're_123' } as any);
      vi.mocked(prisma.payment.update).mockResolvedValue({
        id: 'pay-1',
        status: 'REFUNDED',
      } as any);

      const result = await service.processRefund('booking-1');
      expect(result.payment.status).toBe('REFUNDED');
    });

    it('should throw if payment not succeeded', async () => {
      vi.mocked(prisma.payment.findUnique).mockResolvedValue({
        id: 'pay-1',
        status: 'PENDING',
      } as any);
      await expect(service.processRefund('booking-1')).rejects.toThrow(
        'Only succeeded payments',
      );
    });
  });

  describe('getEarnings', () => {
    it('should return aggregated earnings for provider', async () => {
      vi.mocked(prisma.payment.aggregate)
        .mockResolvedValueOnce({
          _sum: { providerAmount: 5000 },
          _count: { id: 10 },
        } as any)
        .mockResolvedValueOnce({
          _sum: { providerAmount: 500 },
          _count: { id: 2 },
        } as any);

      const result = await service.getEarnings('provider-1');
      expect(result.totalEarnings).toBe(5000);
      expect(result.completedPayments).toBe(10);
    });
  });
});
