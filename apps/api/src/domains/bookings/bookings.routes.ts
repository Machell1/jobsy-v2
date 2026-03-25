import { Router } from 'express';
import {
  CreateBookingSchema,
  BookingStatusUpdateSchema,
  CancelBookingSchema,
} from '@jobsy/shared';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as handlers from './bookings.handlers';

const router = Router();

router.post('/', requireAuth, validate(CreateBookingSchema), handlers.createBooking);
router.get('/', requireAuth, handlers.listBookings);
router.get('/:id', requireAuth, handlers.getBooking);
router.patch('/:id/status', requireAuth, validate(BookingStatusUpdateSchema), handlers.updateStatus);
router.patch('/:id/cancel', requireAuth, validate(CancelBookingSchema), handlers.cancelBooking);

export default router;
