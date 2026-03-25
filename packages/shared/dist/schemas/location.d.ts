import { z } from "zod";
export declare const GeocodingResultSchema: z.ZodObject<{
    placeName: z.ZodString;
    coordinates: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>;
    relevance: z.ZodNumber;
    context: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    relevance: number;
    placeName: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    context?: any;
}, {
    relevance: number;
    placeName: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    context?: any;
}>;
export declare const ParishSchema: z.ZodObject<{
    name: z.ZodString;
    bounds: z.ZodOptional<z.ZodObject<{
        north: z.ZodNumber;
        south: z.ZodNumber;
        east: z.ZodNumber;
        west: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        north: number;
        south: number;
        east: number;
        west: number;
    }, {
        north: number;
        south: number;
        east: number;
        west: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    bounds?: {
        north: number;
        south: number;
        east: number;
        west: number;
    } | undefined;
}, {
    name: string;
    bounds?: {
        north: number;
        south: number;
        east: number;
        west: number;
    } | undefined;
}>;
export declare const GeocodeQuerySchema: z.ZodObject<{
    address: z.ZodString;
}, "strip", z.ZodTypeAny, {
    address: string;
}, {
    address: string;
}>;
export declare const ReverseGeocodeQuerySchema: z.ZodObject<{
    lat: z.ZodNumber;
    lng: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    lat: number;
    lng: number;
}, {
    lat: number;
    lng: number;
}>;
export declare const AutocompleteQuerySchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    query: string;
}, {
    query: string;
    limit?: number | undefined;
}>;
export type GeocodingResult = z.infer<typeof GeocodingResultSchema>;
export type ParishInfo = z.infer<typeof ParishSchema>;
export type GeocodeQuery = z.infer<typeof GeocodeQuerySchema>;
export type ReverseGeocodeQuery = z.infer<typeof ReverseGeocodeQuerySchema>;
export type AutocompleteQuery = z.infer<typeof AutocompleteQuerySchema>;
//# sourceMappingURL=location.d.ts.map