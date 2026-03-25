import { z } from "zod";

export const NotificationType = {
  BOOKING_CREATED: "BOOKING_CREATED",
  BOOKING_ACCEPTED: "BOOKING_ACCEPTED",
  BOOKING_DECLINED: "BOOKING_DECLINED",
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
  BOOKING_COMPLETED: "BOOKING_COMPLETED",
  BOOKING_REMINDER: "BOOKING_REMINDER",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYOUT_SENT: "PAYOUT_SENT",
  REVIEW_RECEIVED: "REVIEW_RECEIVED",
  REVIEW_REPORTED: "REVIEW_REPORTED",
  MESSAGE_RECEIVED: "MESSAGE_RECEIVED",
  VERIFICATION_APPROVED: "VERIFICATION_APPROVED",
  VERIFICATION_REJECTED: "VERIFICATION_REJECTED",
  ACCOUNT_DEACTIVATED: "ACCOUNT_DEACTIVATED",
  SYSTEM_ANNOUNCEMENT: "SYSTEM_ANNOUNCEMENT",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

const notificationTypeValues = Object.values(NotificationType) as [
  string,
  ...string[],
];

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(notificationTypeValues),
  title: z.string(),
  body: z.string(),
  data: z.any().optional(),
  isRead: z.boolean(),
  createdAt: z.coerce.date(),
});

export type Notification = z.infer<typeof NotificationSchema>;
