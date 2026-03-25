import { Router } from 'express';
import express from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { CreatePaymentIntentSchema } from '@jobsy/shared';
import { z } from 'zod';
import * as handlers from './payments.handlers';

const router = Router();

const ConfirmPaymentSchema = z.object({
  paymentId: z.string().uuid(),
});

router.post(
  '/create-intent',
  requireAuth,
  validate(CreatePaymentIntentSchema),
  handlers.createPaymentIntent,
);

router.post(
  '/confirm',
  requireAuth,
  validate(ConfirmPaymentSchema),
  handlers.confirmPayment,
);

router.get('/history', requireAuth, handlers.getPaymentHistory);

router.post(
  '/connect/onboard',
  requireAuth,
  requireRole('PROVIDER'),
  handlers.connectOnboard,
);

router.get(
  '/connect/status',
  requireAuth,
  requireRole('PROVIDER'),
  handlers.connectStatus,
);

router.post(
  '/refund/:bookingId',
  requireAuth,
  requireRole('ADMIN'),
  handlers.processRefund,
);

// Webhook needs raw body for Stripe signature verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handlers.handleWebhook,
);

router.get(
  '/earnings',
  requireAuth,
  requireRole('PROVIDER'),
  handlers.getEarnings,
);

export default router;
