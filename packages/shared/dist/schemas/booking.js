"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelBookingSchema = exports.BookingStatusUpdateSchema = exports.CreateBookingSchema = exports.BookingSchema = void 0;
const zod_1 = require("zod");
exports.BookingSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    serviceId: zod_1.z.string().uuid(),
    customerId: zod_1.z.string().uuid(),
    providerId: zod_1.z.string().uuid(),
    status: zod_1.z.enum([
        "PENDING",
        "ACCEPTED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "DECLINED",
        "DISPUTED",
        "REVIEWED",
    ]),
    scheduledDate: zod_1.z.coerce.date(),
    scheduledTime: zod_1.z.string().optional(),
    duration: zod_1.z.number().optional(),
    notes: zod_1.z.string().optional(),
    locationAddress: zod_1.z.string().optional(),
    locationLat: zod_1.z.number().optional(),
    locationLng: zod_1.z.number().optional(),
    totalAmount: zod_1.z.number().optional(),
    platformFee: zod_1.z.number().optional(),
    providerPayout: zod_1.z.number().optional(),
    cancellationReason: zod_1.z.string().optional(),
    cancelledBy: zod_1.z.string().uuid().optional(),
    completedAt: zod_1.z.coerce.date().optional(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
});
exports.CreateBookingSchema = zod_1.z.object({
    serviceId: zod_1.z.string().uuid(),
    scheduledDate: zod_1.z.coerce.date(),
    scheduledTime: zod_1.z.string().optional(),
    duration: zod_1.z.number().positive().optional(),
    notes: zod_1.z.string().optional(),
    locationAddress: zod_1.z.string().optional(),
    locationLat: zod_1.z.number().optional(),
    locationLng: zod_1.z.number().optional(),
});
exports.BookingStatusUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "ACCEPTED",
        "DECLINED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
    ]),
});
exports.CancelBookingSchema = zod_1.z.object({
    reason: zod_1.z.string().optional(),
});
//# sourceMappingURL=booking.js.map