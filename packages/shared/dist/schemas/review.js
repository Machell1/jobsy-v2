"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportReviewSchema = exports.UpdateReviewSchema = exports.CreateReviewSchema = exports.ReviewSchema = void 0;
const zod_1 = require("zod");
exports.ReviewSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    bookingId: zod_1.z.string().uuid(),
    serviceId: zod_1.z.string().uuid(),
    reviewerId: zod_1.z.string().uuid(),
    subjectId: zod_1.z.string().uuid(),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string(),
    isReported: zod_1.z.boolean(),
    reportReason: zod_1.z.string().optional(),
    isVisible: zod_1.z.boolean(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
});
exports.CreateReviewSchema = zod_1.z.object({
    bookingId: zod_1.z.string().uuid(),
    serviceId: zod_1.z.string().uuid(),
    subjectId: zod_1.z.string().uuid(),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().min(10).max(1000),
});
exports.UpdateReviewSchema = zod_1.z.object({
    rating: zod_1.z.number().int().min(1).max(5).optional(),
    comment: zod_1.z.string().min(10).max(1000).optional(),
});
exports.ReportReviewSchema = zod_1.z.object({
    reason: zod_1.z.string().min(10),
});
//# sourceMappingURL=review.js.map