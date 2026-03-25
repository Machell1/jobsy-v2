import { z } from "zod";

export const ChatTokenSchema = z.object({
  token: z.string(),
  userId: z.string(),
});

export const ChatChannelSchema = z.object({
  channelId: z.string(),
  members: z.array(z.string()),
});

export const CreateChannelSchema = z.object({
  userId: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
});

export type ChatToken = z.infer<typeof ChatTokenSchema>;
export type ChatChannel = z.infer<typeof ChatChannelSchema>;
export type CreateChannelInput = z.infer<typeof CreateChannelSchema>;
