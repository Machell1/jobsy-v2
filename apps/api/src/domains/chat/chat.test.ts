import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockChannel = {
  id: 'channel-1',
  type: 'messaging',
  data: { member_count: 2, created_at: '2025-01-01T00:00:00Z' },
  state: { messages: [] },
  create: vi.fn(),
};

vi.mock('../../lib/stream', () => ({
  streamClient: {
    createToken: vi.fn().mockReturnValue('mock-token-123'),
    channel: vi.fn().mockReturnValue(mockChannel),
    queryChannels: vi.fn().mockResolvedValue([mockChannel]),
    upsertUser: vi.fn().mockResolvedValue({}),
  },
}));

import { streamClient } from '../../lib/stream';
import * as service from './chat.service';

beforeEach(() => {
  vi.clearAllMocks();
  mockChannel.create.mockResolvedValue({});
});

describe('Chat Service', () => {
  describe('generateToken', () => {
    it('should generate a Stream token for a user', () => {
      const token = service.generateToken('user-1');
      expect(token).toBe('mock-token-123');
      expect(streamClient.createToken).toHaveBeenCalledWith('user-1');
    });
  });

  describe('createOrGetChannel', () => {
    it('should create a messaging channel between two users', async () => {
      const result = await service.createOrGetChannel('user-a', 'user-b');

      expect(streamClient.channel).toHaveBeenCalledWith(
        'messaging',
        expect.any(String),
        expect.objectContaining({
          members: ['user-a', 'user-b'],
          created_by_id: 'user-a',
        }),
      );
      expect(mockChannel.create).toHaveBeenCalled();
      expect(result.channelId).toBe('channel-1');
    });

    it('should include serviceId in channel when provided', async () => {
      await service.createOrGetChannel('user-a', 'user-b', 'service-1');

      expect(streamClient.channel).toHaveBeenCalledWith(
        'messaging',
        expect.stringContaining('service-1'),
        expect.objectContaining({
          serviceId: 'service-1',
        }),
      );
    });

    it('should throw if creating channel with yourself', async () => {
      await expect(
        service.createOrGetChannel('user-a', 'user-a'),
      ).rejects.toThrow('yourself');
    });

    it('should produce the same channel ID regardless of user order', async () => {
      await service.createOrGetChannel('user-b', 'user-a');

      const callArgs = vi.mocked(streamClient.channel).mock.calls[0];
      const channelId = callArgs[1] as string;

      // Should start with user-a (sorted)
      expect(channelId).toMatch(/^user-a_user-b/);
    });
  });

  describe('listChannels', () => {
    it('should return user channels from Stream', async () => {
      const result = await service.listChannels('user-1');

      expect(streamClient.queryChannels).toHaveBeenCalledWith(
        { type: 'messaging', members: { $in: ['user-1'] } },
        expect.any(Array),
        expect.objectContaining({ limit: 30 }),
      );
      expect(result).toHaveLength(1);
      expect(result[0].channelId).toBe('channel-1');
    });
  });

  describe('syncUser', () => {
    it('should upsert user to Stream', async () => {
      await service.syncUser({ id: 'user-1', name: 'Test User', image: 'https://img.com/avatar.png' });

      expect(streamClient.upsertUser).toHaveBeenCalledWith({
        id: 'user-1',
        name: 'Test User',
        image: 'https://img.com/avatar.png',
      });
    });
  });
});
