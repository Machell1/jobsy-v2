import { z } from "zod";
export declare const ReviewSchema: z.ZodObject<{
    id: z.ZodString;
    bookingId: z.ZodString;
    serviceId: z.ZodString;
    reviewerId: z.ZodString;
    subjectId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodString;
    isReported: z.ZodBoolean;
    reportReason: z.ZodOptional<z.ZodString>;
    isVisible: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    rating: number;
    serviceId: string;
    bookingId: string;
    reviewerId: string;
    subjectId: string;
    comment: string;
    isReported: boolean;
    isVisible: boolean;
    reportReason?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    rating: number;
    serviceId: string;
    bookingId: string;
    reviewerId: string;
    subjectId: string;
    comment: string;
    isReported: boolean;
    isVisible: boolean;
    reportReason?: string | undefined;
}>;
export declare const CreateReviewSchema: z.ZodObject<{
    bookingId: z.ZodString;
    serviceId: z.ZodString;
    subjectId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodString;
}, "strip", z.ZodTypeAny, {
    rating: number;
    serviceId: string;
    bookingId: string;
    subjectId: string;
    comment: string;
}, {
    rating: number;
    serviceId: string;
    bookingId: string;
    subjectId: string;
    comment: string;
}>;
export declare const UpdateReviewSchema: z.ZodObject<{
    rating: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rating?: number | undefined;
    comment?: string | undefined;
}, {
    rating?: number | undefined;
    comment?: string | undefined;
}>;
export declare const ReportReviewSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
}, {
    reason: string;
}>;
export type Review = z.infer<typeof ReviewSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;
export type ReportReviewInput = z.infer<typeof ReportReviewSchema>;
//# sourceMappingURL=review.d.ts.map