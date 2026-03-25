"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateChannelSchema = exports.ChatChannelSchema = exports.ChatTokenSchema = void 0;
const zod_1 = require("zod");
exports.ChatTokenSchema = zod_1.z.object({
    token: zod_1.z.string(),
    userId: zod_1.z.string(),
});
exports.ChatChannelSchema = zod_1.z.object({
    channelId: zod_1.z.string(),
    members: zod_1.z.array(zod_1.z.string()),
});
exports.CreateChannelSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    serviceId: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=chat.js.map