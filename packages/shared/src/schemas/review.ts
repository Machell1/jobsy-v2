import { z } from "zod";

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  serviceId: z.string().uuid(),
  reviewerId: z.string().uuid(),
  subjectId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
  isReported: z.boolean(),
  reportReason: z.string().optional(),
  isVisible: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateReviewSchema = z.object({
  bookingId: z.string().uuid(),
  serviceId: z.string().uuid(),
  subjectId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

export const UpdateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(10).max(1000).optional(),
});

export const ReportReviewSchema = z.object({
  reason: z.string().min(10),
});

export type Review = z.infer<typeof ReviewSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;
export type ReportReviewInput = z.infer<typeof ReportReviewSchema>;
