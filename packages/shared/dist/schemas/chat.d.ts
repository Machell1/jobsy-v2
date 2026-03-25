import { z } from "zod";
export declare const ChatTokenSchema: z.ZodObject<{
    token: z.ZodString;
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    userId: string;
}, {
    token: string;
    userId: string;
}>;
export declare const ChatChannelSchema: z.ZodObject<{
    channelId: z.ZodString;
    members: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    channelId: string;
    members: string[];
}, {
    channelId: string;
    members: string[];
}>;
export declare const CreateChannelSchema: z.ZodObject<{
    userId: z.ZodString;
    serviceId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    serviceId?: string | undefined;
}, {
    userId: string;
    serviceId?: string | undefined;
}>;
export type ChatToken = z.infer<typeof ChatTokenSchema>;
export type ChatChannel = z.infer<typeof ChatChannelSchema>;
export type CreateChannelInput = z.infer<typeof CreateChannelSchema>;
//# sourceMappingURL=chat.d.ts.map