"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSchema = exports.NotificationType = void 0;
const zod_1 = require("zod");
exports.NotificationType = {
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
};
const notificationTypeValues = Object.values(exports.NotificationType);
exports.NotificationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(notificationTypeValues),
    title: zod_1.z.string(),
    body: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    isRead: zod_1.z.boolean(),
    createdAt: zod_1.z.coerce.date(),
});
//# sourceMappingURL=notification.js.map