"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceSearchSchema = exports.UpdateServiceSchema = exports.CreateServiceSchema = exports.ServiceSchema = exports.ServiceImageSchema = void 0;
const zod_1 = require("zod");
exports.ServiceImageSchema = zod_1.z.object({
    id: zod_1.z.string(),
    url: zod_1.z.string().url(),
    publicId: zod_1.z.string(),
    sortOrder: zod_1.z.number(),
});
exports.ServiceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    providerId: zod_1.z.string().uuid(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    categoryId: zod_1.z.string().uuid(),
    priceMin: zod_1.z.number(),
    priceMax: zod_1.z.number().optional(),
    priceCurrency: zod_1.z.string(),
    priceUnit: zod_1.z.string(),
    parish: zod_1.z.string(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    address: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()),
    images: zod_1.z.array(exports.ServiceImageSchema),
    averageRating: zod_1.z.number().optional(),
    totalReviews: zod_1.z.number(),
    isActive: zod_1.z.boolean(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
});
exports.CreateServiceSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    categoryId: zod_1.z.string().uuid(),
    priceMin: zod_1.z.number().positive(),
    priceMax: zod_1.z.number().positive().optional(),
    priceCurrency: zod_1.z.string().default("JMD"),
    priceUnit: zod_1.z.string().default("per_service"),
    parish: zod_1.z.string(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    address: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.UpdateServiceSchema = exports.CreateServiceSchema.partial();
exports.ServiceSearchSchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    parish: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().optional(),
    maxPrice: zod_1.z.coerce.number().optional(),
    rating: zod_1.z.coerce.number().min(1).max(5).optional(),
    lat: zod_1.z.coerce.number().optional(),
    lng: zod_1.z.coerce.number().optional(),
    radius: zod_1.z.coerce.number().default(25),
    sort: zod_1.z
        .enum(["relevance", "price_low", "price_high", "rating", "newest"])
        .default("relevance"),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().default(20),
});
//# sourceMappingURL=service.js.map