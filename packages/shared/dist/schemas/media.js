"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageTransformSchema = exports.UploadResultSchema = void 0;
const zod_1 = require("zod");
exports.UploadResultSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    publicId: zod_1.z.string(),
    width: zod_1.z.number(),
    height: zod_1.z.number(),
});
exports.ImageTransformSchema = zod_1.z.object({
    width: zod_1.z.number().positive().optional(),
    height: zod_1.z.number().positive().optional(),
    crop: zod_1.z.string().optional(),
});
//# sourceMappingURL=media.js.map