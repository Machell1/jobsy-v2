import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as handlers from './admin.handlers';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(requireAuth, requireRole('ADMIN'));

router.get('/dashboard', handlers.getDashboard);
router.get('/users', handlers.listUsers);
router.patch('/users/:id', handlers.updateUser);
router.get('/services', handlers.listServices);
router.patch('/services/:id', handlers.updateService);
router.get('/bookings', handlers.listBookings);
router.get('/payments', handlers.getPaymentReport);
router.get('/reviews/reported', handlers.getReportedReviews);
router.patch('/reviews/:id', handlers.updateReview);
router.get('/analytics', handlers.getAnalytics);

export default router;
