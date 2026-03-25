import { z } from "zod";

export const ServiceImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  publicId: z.string(),
  sortOrder: z.number(),
});

export const ServiceSchema = z.object({
  id: z.string().uuid(),
  providerId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  categoryId: z.string().uuid(),
  priceMin: z.number(),
  priceMax: z.number().optional(),
  priceCurrency: z.string(),
  priceUnit: z.string(),
  parish: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  tags: z.array(z.string()),
  images: z.array(ServiceImageSchema),
  averageRating: z.number().optional(),
  totalReviews: z.number(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateServiceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string().uuid(),
  priceMin: z.number().positive(),
  priceMax: z.number().positive().optional(),
  priceCurrency: z.string().default("JMD"),
  priceUnit: z.string().default("per_service"),
  parish: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateServiceSchema = CreateServiceSchema.partial();

export const ServiceSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  parish: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().default(25),
  sort: z
    .enum(["relevance", "price_low", "price_high", "rating", "newest"])
    .default("relevance"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
});

export type Service = z.infer<typeof ServiceSchema>;
export type ServiceImage = z.infer<typeof ServiceImageSchema>;
export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>;
export type ServiceSearchInput = z.infer<typeof ServiceSearchSchema>;
