import { z } from "zod";
export declare const PaymentSchema: z.ZodObject<{
    id: z.ZodString;
    bookingId: z.ZodString;
    customerId: z.ZodString;
    providerId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodString;
    status: z.ZodEnum<["PENDING", "PROCESSING", "SUCCEEDED", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]>;
    stripePaymentIntentId: z.ZodOptional<z.ZodString>;
    stripeTransferId: z.ZodOptional<z.ZodString>;
    platformFee: z.ZodOptional<z.ZodNumber>;
    providerPayout: z.ZodOptional<z.ZodNumber>;
    refundAmount: z.ZodOptional<z.ZodNumber>;
    refundReason: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
    createdAt: Date;
    updatedAt: Date;
    providerId: string;
    customerId: string;
    bookingId: string;
    amount: number;
    currency: string;
    platformFee?: number | undefined;
    providerPayout?: number | undefined;
    stripePaymentIntentId?: string | undefined;
    stripeTransferId?: string | undefined;
    refundAmount?: number | undefined;
    refundReason?: string | undefined;
}, {
    id: string;
    status: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
    createdAt: Date;
    updatedAt: Date;
    providerId: string;
    customerId: string;
    bookingId: string;
    amount: number;
    currency: string;
    platformFee?: number | undefined;
    providerPayout?: number | undefined;
    stripePaymentIntentId?: string | undefined;
    stripeTransferId?: string | undefined;
    refundAmount?: number | undefined;
    refundReason?: string | undefined;
}>;
export declare const CreatePaymentIntentSchema: z.ZodObject<{
    bookingId: z.ZodString;
    amount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    bookingId: string;
    amount: number;
}, {
    bookingId: string;
    amount: number;
}>;
export declare const ConnectOnboardSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type Payment = z.infer<typeof PaymentSchema>;
export type CreatePaymentIntentInput = z.infer<typeof CreatePaymentIntentSchema>;
export type ConnectOnboardInput = z.infer<typeof ConnectOnboardSchema>;
//# sourceMappingURL=payment.d.ts.map