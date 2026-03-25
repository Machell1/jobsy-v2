"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorySchema = void 0;
const zod_1 = require("zod");
exports.CategorySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    slug: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    sortOrder: zod_1.z.number(),
    isActive: zod_1.z.boolean(),
    createdAt: zod_1.z.coerce.date(),
});
//# sourceMappingURL=category.js.map