import { z } from "zod";
export declare const CategorySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodNumber;
    isActive: z.ZodBoolean;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    sortOrder: number;
    slug: string;
    description?: string | undefined;
    icon?: string | undefined;
}, {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    sortOrder: number;
    slug: string;
    description?: string | undefined;
    icon?: string | undefined;
}>;
export type Category = z.infer<typeof CategorySchema>;
//# sourceMappingURL=category.d.ts.map