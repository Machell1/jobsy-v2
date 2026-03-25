import { z } from "zod";
export declare const BookingSchema: z.ZodObject<{
    id: z.ZodString;
    serviceId: z.ZodString;
    customerId: z.ZodString;
    providerId: z.ZodString;
    status: z.ZodEnum<["PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DECLINED", "DISPUTED", "REVIEWED"]>;
    scheduledDate: z.ZodDate;
    scheduledTime: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    locationAddress: z.ZodOptional<z.ZodString>;
    locationLat: z.ZodOptional<z.ZodNumber>;
    locationLng: z.ZodOptional<z.ZodNumber>;
    totalAmount: z.ZodOptional<z.ZodNumber>;
    platformFee: z.ZodOptional<z.ZodNumber>;
    providerPayout: z.ZodOptional<z.ZodNumber>;
    cancellationReason: z.ZodOptional<z.ZodString>;
    cancelledBy: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DECLINED" | "DISPUTED" | "REVIEWED";
    createdAt: Date;
    updatedAt: Date;
    providerId: string;
    serviceId: string;
    customerId: string;
    scheduledDate: Date;
    scheduledTime?: string | undefined;
    duration?: number | undefined;
    notes?: string | undefined;
    locationAddress?: string | undefined;
    locationLat?: number | undefined;
    locationLng?: number | undefined;
    totalAmount?: number | undefined;
    platformFee?: number | undefined;
    providerPayout?: number | undefined;
    cancellationReason?: string | undefined;
    cancelledBy?: string | undefined;
    completedAt?: Date | undefined;
}, {
    id: string;
    status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DECLINED" | "DISPUTED" | "REVIEWED";
    createdAt: Date;
    updatedAt: Date;
    providerId: string;
    serviceId: string;
    customerId: string;
    scheduledDate: Date;
    scheduledTime?: string | undefined;
    duration?: number | undefined;
    notes?: string | undefined;
    locationAddress?: string | undefined;
    locationLat?: number | undefined;
    locationLng?: number | undefined;
    totalAmount?: number | undefined;
    platformFee?: number | undefined;
    providerPayout?: number | undefined;
    cancellationReason?: string | undefined;
    cancelledBy?: string | undefined;
    completedAt?: Date | undefined;
}>;
export declare const CreateBookingSchema: z.ZodObject<{
    serviceId: z.ZodString;
    scheduledDate: z.ZodDate;
    scheduledTime: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    locationAddress: z.ZodOptional<z.ZodString>;
    locationLat: z.ZodOptional<z.ZodNumber>;
    locationLng: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    serviceId: string;
    scheduledDate: Date;
    scheduledTime?: string | undefined;
    duration?: number | undefined;
    notes?: string | undefined;
    locationAddress?: string | undefined;
    locationLat?: number | undefined;
    locationLng?: number | undefined;
}, {
    serviceId: string;
    scheduledDate: Date;
    scheduledTime?: string | undefined;
    duration?: number | undefined;
    notes?: string | undefined;
    locationAddress?: string | undefined;
    locationLat?: number | undefined;
    locationLng?: number | undefined;
}>;
export declare const BookingStatusUpdateSchema: z.ZodObject<{
    status: z.ZodEnum<["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]>;
}, "strip", z.ZodTypeAny, {
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DECLINED";
}, {
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DECLINED";
}>;
export declare const CancelBookingSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
}, {
    reason?: string | undefined;
}>;
export type Booking = z.infer<typeof BookingSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type BookingStatusUpdateInput = z.infer<typeof BookingStatusUpdateSchema>;
export type CancelBookingInput = z.infer<typeof CancelBookingSchema>;
//# sourceMappingURL=booking.d.ts.map