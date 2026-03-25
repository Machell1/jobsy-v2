import { z } from "zod";

export const BookingSchema = z.object({
  id: z.string().uuid(),
  serviceId: z.string().uuid(),
  customerId: z.string().uuid(),
  providerId: z.string().uuid(),
  status: z.enum([
    "PENDING",
    "ACCEPTED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "DECLINED",
    "DISPUTED",
    "REVIEWED",
  ]),
  scheduledDate: z.coerce.date(),
  scheduledTime: z.string().optional(),
  duration: z.number().optional(),
  notes: z.string().optional(),
  locationAddress: z.string().optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  totalAmount: z.number().optional(),
  platformFee: z.number().optional(),
  providerPayout: z.number().optional(),
  cancellationReason: z.string().optional(),
  cancelledBy: z.string().uuid().optional(),
  completedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateBookingSchema = z.object({
  serviceId: z.string().uuid(),
  scheduledDate: z.coerce.date(),
  scheduledTime: z.string().optional(),
  duration: z.number().positive().optional(),
  notes: z.string().optional(),
  locationAddress: z.string().optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
});

export const BookingStatusUpdateSchema = z.object({
  status: z.enum([
    "ACCEPTED",
    "DECLINED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ]),
});

export const CancelBookingSchema = z.object({
  reason: z.string().optional(),
});

export type Booking = z.infer<typeof BookingSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type BookingStatusUpdateInput = z.infer<typeof BookingStatusUpdateSchema>;
export type CancelBookingInput = z.infer<typeof CancelBookingSchema>;
