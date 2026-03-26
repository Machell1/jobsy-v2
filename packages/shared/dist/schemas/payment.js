"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectOnboardSchema = exports.CreatePaymentIntentSchema = exports.PaymentSchema = void 0;
const zod_1 = require("zod");
exports.PaymentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    bookingId: zod_1.z.string().uuid(),
    customerId: zod_1.z.string().uuid(),
    providerId: zod_1.z.string().uuid(),
    amount: zod_1.z.number(),
    currency: zod_1.z.string(),
    status: zod_1.z.enum([
        "PENDING",
        "PROCESSING",
        "SUCCEEDED",
        "FAILED",
        "REFUNDED",
        "PARTIALLY_REFUNDED",
    ]),
    stripePaymentIntentId: zod_1.z.string().optional(),
    stripeTransferId: zod_1.z.string().optional(),
    platformFee: zod_1.z.number().optional(),
    providerPayout: zod_1.z.number().optional(),
    refundAmount: zod_1.z.number().optional(),
    refundReason: zod_1.z.string().optional(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
});
exports.CreatePaymentIntentSchema = zod_1.z.object({
    bookingId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().positive().optional(),
});
exports.ConnectOnboardSchema = zod_1.z.object({});
//# sourceMappingURL=payment.js.map