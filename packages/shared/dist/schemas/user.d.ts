import { z } from "zod";
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<["CUSTOMER", "PROVIDER", "ADMIN"]>;
    phone: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    isEmailVerified: z.ZodBoolean;
    isActive: z.ZodBoolean;
    verificationStatus: z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>;
    parish: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    address: z.ZodOptional<z.ZodString>;
    stripeCustomerId: z.ZodOptional<z.ZodString>;
    stripeAccountId: z.ZodOptional<z.ZodString>;
    stripeOnboarded: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    name: string;
    role: "CUSTOMER" | "PROVIDER" | "ADMIN";
    isEmailVerified: boolean;
    isActive: boolean;
    verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
    stripeOnboarded: boolean;
    createdAt: Date;
    updatedAt: Date;
    phone?: string | undefined;
    avatarUrl?: string | undefined;
    bio?: string | undefined;
    parish?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    address?: string | undefined;
    stripeCustomerId?: string | undefined;
    stripeAccountId?: string | undefined;
}, {
    id: string;
    email: string;
    name: string;
    role: "CUSTOMER" | "PROVIDER" | "ADMIN";
    isEmailVerified: boolean;
    isActive: boolean;
    verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
    stripeOnboarded: boolean;
    createdAt: Date;
    updatedAt: Date;
    phone?: string | undefined;
    avatarUrl?: string | undefined;
    bio?: string | undefined;
    parish?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    address?: string | undefined;
    stripeCustomerId?: string | undefined;
    stripeAccountId?: string | undefined;
}>;
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<["CUSTOMER", "PROVIDER"]>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    role: "CUSTOMER" | "PROVIDER";
    password: string;
    phone?: string | undefined;
}, {
    email: string;
    name: string;
    role: "CUSTOMER" | "PROVIDER";
    password: string;
    phone?: string | undefined;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const UpdateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    parish: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    phone?: string | undefined;
    bio?: string | undefined;
    parish?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    address?: string | undefined;
}, {
    name?: string | undefined;
    phone?: string | undefined;
    bio?: string | undefined;
    parish?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    address?: string | undefined;
}>;
export declare const ForgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const ResetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
}, {
    password: string;
    token: string;
}>;
export declare const VerifyEmailSchema: z.ZodObject<{
    userId: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    userId: string;
}, {
    code: string;
    userId: string;
}>;
export type User = z.infer<typeof UserSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
//# sourceMappingURL=user.d.ts.map