import { streamClient } from '../../lib/stream';
import { AppError } from '../../middleware/error-handler';

export function generateToken(userId: string): string {
  return streamClient.createToken(userId);
}

export async function createOrGetChannel(
  userId: string,
  otherUserId: string,
  serviceId?: string,
) {
  if (userId === otherUserId) {
    throw new AppError('BAD_REQUEST', 400, 'Cannot create a channel with yourself');
  }

  // Deterministic channel ID so the same pair always maps to the same channel
  const sortedIds = [userId, otherUserId].sort();
  const channelId = serviceId
    ? `${sortedIds[0]}_${sortedIds[1]}_${serviceId}`
    : `${sortedIds[0]}_${sortedIds[1]}`;

  const channel = streamClient.channel('messaging', channelId, {
    members: [userId, otherUserId],
    created_by_id: userId,
    ...(serviceId && { serviceId }),
  });

  await channel.create();

  return {
    channelId: channel.id,
    type: channel.type,
    members: [userId, otherUserId],
  };
}

export async function listChannels(userId: string) {
  const filter = { type: 'messaging', members: { $in: [userId] } };
  const sort = [{ last_message_at: -1 as const }];

  const channels = await streamClient.queryChannels(filter, sort, {
    limit: 30,
    state: true,
    watch: false,
  });

  return channels.map((ch) => ({
    channelId: ch.id,
    type: ch.type,
    memberCount: ch.data?.member_count ?? 0,
    lastMessage: ch.state?.messages?.length
      ? ch.state.messages[ch.state.messages.length - 1]
      : null,
    createdAt: ch.data?.created_at,
  }));
}

export async function syncUser(user: { id: string; name: string; image?: string }) {
  await streamClient.upsertUser({
    id: user.id,
    name: user.name,
    image: user.image,
  });
}
