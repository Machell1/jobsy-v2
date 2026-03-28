"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.createOrGetChannel = createOrGetChannel;
exports.listChannels = listChannels;
exports.syncUser = syncUser;
const stream_1 = require("../../lib/stream");
const error_handler_1 = require("../../middleware/error-handler");
function generateToken(userId) {
    return stream_1.streamClient.createToken(userId);
}
async function createOrGetChannel(userId, otherUserId, serviceId) {
    if (userId === otherUserId) {
        throw new error_handler_1.AppError('BAD_REQUEST', 400, 'Cannot create a channel with yourself');
    }
    // Deterministic channel ID so the same pair always maps to the same channel
    const sortedIds = [userId, otherUserId].sort();
    const channelId = serviceId
        ? `${sortedIds[0]}_${sortedIds[1]}_${serviceId}`
        : `${sortedIds[0]}_${sortedIds[1]}`;
    const channel = stream_1.streamClient.channel('messaging', channelId, {
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
async function listChannels(userId) {
    const filter = { type: 'messaging', members: { $in: [userId] } };
    const sort = [{ last_message_at: -1 }];
    const channels = await stream_1.streamClient.queryChannels(filter, sort, {
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
async function syncUser(user) {
    await stream_1.streamClient.upsertUser({
        id: user.id,
        name: user.name,
        image: user.image,
    });
}
//# sourceMappingURL=chat.service.js.map