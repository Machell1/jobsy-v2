import { z } from "zod";

export const GeocodingResultSchema = z.object({
  placeName: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  relevance: z.number(),
  context: z.any().optional(),
});

export const ParishSchema = z.object({
  name: z.string(),
  bounds: z
    .object({
      north: z.number(),
      south: z.number(),
      east: z.number(),
      west: z.number(),
    })
    .optional(),
});

export const GeocodeQuerySchema = z.object({
  address: z.string().min(3),
});

export const ReverseGeocodeQuerySchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const AutocompleteQuerySchema = z.object({
  query: z.string().min(2),
  limit: z.coerce.number().int().positive().default(5),
});

export type GeocodingResult = z.infer<typeof GeocodingResultSchema>;
export type ParishInfo = z.infer<typeof ParishSchema>;
export type GeocodeQuery = z.infer<typeof GeocodeQuerySchema>;
export type ReverseGeocodeQuery = z.infer<typeof ReverseGeocodeQuerySchema>;
export type AutocompleteQuery = z.infer<typeof AutocompleteQuerySchema>;
