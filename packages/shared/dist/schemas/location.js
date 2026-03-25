"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutocompleteQuerySchema = exports.ReverseGeocodeQuerySchema = exports.GeocodeQuerySchema = exports.ParishSchema = exports.GeocodingResultSchema = void 0;
const zod_1 = require("zod");
exports.GeocodingResultSchema = zod_1.z.object({
    placeName: zod_1.z.string(),
    coordinates: zod_1.z.object({
        lat: zod_1.z.number(),
        lng: zod_1.z.number(),
    }),
    relevance: zod_1.z.number(),
    context: zod_1.z.any().optional(),
});
exports.ParishSchema = zod_1.z.object({
    name: zod_1.z.string(),
    bounds: zod_1.z
        .object({
        north: zod_1.z.number(),
        south: zod_1.z.number(),
        east: zod_1.z.number(),
        west: zod_1.z.number(),
    })
        .optional(),
});
exports.GeocodeQuerySchema = zod_1.z.object({
    address: zod_1.z.string().min(3),
});
exports.ReverseGeocodeQuerySchema = zod_1.z.object({
    lat: zod_1.z.number(),
    lng: zod_1.z.number(),
});
exports.AutocompleteQuerySchema = zod_1.z.object({
    query: zod_1.z.string().min(2),
    limit: zod_1.z.coerce.number().int().positive().default(5),
});
//# sourceMappingURL=location.js.map