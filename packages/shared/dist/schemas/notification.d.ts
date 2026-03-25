import { z } from "zod";
export declare const NotificationType: {
    readonly BOOKING_CREATED: "BOOKING_CREATED";
    readonly BOOKING_ACCEPTED: "BOOKING_ACCEPTED";
    readonly BOOKING_DECLINED: "BOOKING_DECLINED";
    readonly BOOKING_CANCELLED: "BOOKING_CANCELLED";
    readonly BOOKING_COMPLETED: "BOOKING_COMPLETED";
    readonly BOOKING_REMINDER: "BOOKING_REMINDER";
    readonly PAYMENT_RECEIVED: "PAYMENT_RECEIVED";
    readonly PAYMENT_FAILED: "PAYMENT_FAILED";
    readonly PAYOUT_SENT: "PAYOUT_SENT";
    readonly REVIEW_RECEIVED: "REVIEW_RECEIVED";
    readonly REVIEW_REPORTED: "REVIEW_REPORTED";
    readonly MESSAGE_RECEIVED: "MESSAGE_RECEIVED";
    readonly VERIFICATION_APPROVED: "VERIFICATION_APPROVED";
    readonly VERIFICATION_REJECTED: "VERIFICATION_REJECTED";
    readonly ACCOUNT_DEACTIVATED: "ACCOUNT_DEACTIVATED";
    readonly SYSTEM_ANNOUNCEMENT: "SYSTEM_ANNOUNCEMENT";
};
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
export declare const NotificationSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    type: z.ZodEnum<[string, ...string[]]>;
    title: z.ZodString;
    body: z.ZodString;
    data: z.ZodOptional<z.ZodAny>;
    isRead: z.ZodBoolean;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: string;
    createdAt: Date;
    userId: string;
    title: string;
    body: string;
    isRead: boolean;
    data?: any;
}, {
    id: string;
    type: string;
    createdAt: Date;
    userId: string;
    title: string;
    body: string;
    isRead: boolean;
    data?: any;
}>;
export type Notification = z.infer<typeof NotificationSchema>;
//# sourceMappingURL=notification.d.ts.map