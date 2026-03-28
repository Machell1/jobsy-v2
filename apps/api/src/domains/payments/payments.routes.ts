import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as handlers from './payments.handlers';

const router = Router();

router.get('/history', requireAuth, handlers.getPaymentHistory);

router.get(
  '/earnings',
  requireAuth,
  requireRole('PROVIDER'),
  handlers.getEarnings,
);

export default router;
