import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { CreateReviewSchema, UpdateReviewSchema, ReportReviewSchema } from '@jobsy/shared';
import * as handlers from './reviews.handlers';

const router = Router();

router.post(
  '/',
  requireAuth,
  validate(CreateReviewSchema),
  handlers.createReview,
);

router.get('/service/:serviceId', handlers.getServiceReviews);

router.get('/user/:userId', handlers.getUserReviews);

router.patch(
  '/:id',
  requireAuth,
  validate(UpdateReviewSchema),
  handlers.updateReview,
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  handlers.deleteReview,
);

router.post(
  '/:id/report',
  requireAuth,
  validate(ReportReviewSchema),
  handlers.reportReview,
);

export default router;
