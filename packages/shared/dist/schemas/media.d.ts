import { z } from "zod";
export declare const UploadResultSchema: z.ZodObject<{
    url: z.ZodString;
    publicId: z.ZodString;
    width: z.ZodNumber;
    height: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    url: string;
    publicId: string;
    width: number;
    height: number;
}, {
    url: string;
    publicId: string;
    width: number;
    height: number;
}>;
export declare const ImageTransformSchema: z.ZodObject<{
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    crop: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    width?: number | undefined;
    height?: number | undefined;
    crop?: string | undefined;
}, {
    width?: number | undefined;
    height?: number | undefined;
    crop?: string | undefined;
}>;
export type UploadResult = z.infer<typeof UploadResultSchema>;
export type ImageTransform = z.infer<typeof ImageTransformSchema>;
//# sourceMappingURL=media.d.ts.map