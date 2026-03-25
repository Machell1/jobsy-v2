"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyEmailSchema = exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.UpdateProfileSchema = exports.LoginSchema = exports.RegisterSchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string(),
    role: zod_1.z.enum(["CUSTOMER", "PROVIDER", "ADMIN"]),
    phone: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().url().optional(),
    bio: zod_1.z.string().optional(),
    isEmailVerified: zod_1.z.boolean(),
    isActive: zod_1.z.boolean(),
    verificationStatus: zod_1.z.enum(["PENDING", "APPROVED", "REJECTED"]),
    parish: zod_1.z.string().optional(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    address: zod_1.z.string().optional(),
    stripeCustomerId: zod_1.z.string().optional(),
    stripeAccountId: zod_1.z.string().optional(),
    stripeOnboarded: zod_1.z.boolean(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
});
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(128),
    name: zod_1.z.string().min(1).max(100),
    role: zod_1.z.enum(["CUSTOMER", "PROVIDER"]),
    phone: zod_1.z.string().optional(),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.UpdateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    phone: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    parish: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
});
exports.ForgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string(),
    password: zod_1.z.string().min(8),
});
exports.VerifyEmailSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    code: zod_1.z.string().length(6),
});
//# sourceMappingURL=user.js.map