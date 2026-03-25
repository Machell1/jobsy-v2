import { Router } from 'express';
import { UpdateProfileSchema } from '@jobsy/shared';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as handlers from './users.handlers';

const router = Router();

router.get('/profile', requireAuth, handlers.getProfile);
router.patch('/profile', requireAuth, validate(UpdateProfileSchema), handlers.updateProfile);
router.get('/dashboard', requireAuth, handlers.getDashboard);
router.patch('/avatar', requireAuth, handlers.updateAvatar);
router.patch('/settings', requireAuth, handlers.updateSettings);
router.post('/provider-verification', requireAuth, requireRole('PROVIDER'), handlers.submitVerification);

// Parameterized routes last to avoid conflicts
router.get('/:id', handlers.getPublicProfile);
router.get('/:id/services', handlers.getUserServices);
router.get('/:id/reviews', handlers.getUserReviews);

export default router;
