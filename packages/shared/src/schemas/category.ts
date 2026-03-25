import { z } from "zod";

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
});

export type Category = z.infer<typeof CategorySchema>;
