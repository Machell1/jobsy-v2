import { z } from "zod";

export const UploadResultSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  width: z.number(),
  height: z.number(),
});

export const ImageTransformSchema = z.object({
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  crop: z.string().optional(),
});

export type UploadResult = z.infer<typeof UploadResultSchema>;
export type ImageTransform = z.infer<typeof ImageTransformSchema>;
