import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@jobsy/database', () => ({
  prisma: {
    booking: { findUnique: vi.fn(), update: vi.fn() },
    review: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
    service: { update: vi.fn() },
  },
}));

import { prisma } from '@jobsy/database';
import * as service from './reviews.service';

beforeEach(() => {
  vi.clearAllMocks();
  // Default aggregate mock
  vi.mocked(prisma.review.aggregate).mockResolvedValue({
    _avg: { rating: 4.5 },
    _count: { id: 10 },
  } as any);
});

describe('Reviews Service', () => {
  describe('createReview', () => {
    it('should create a review for a completed booking', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue({
        id: 'booking-1',
        status: 'COMPLETED',
        customerId: 'author-1',
        providerId: 'provider-1',
      } as any);
      vi.mocked(prisma.review.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.review.create).mockResolvedValue({
        id: 'review-1',
        rating: 5,
        comment: 'Great service!',
        author: { id: 'author-1', name: 'Test', avatarUrl: null },
      } as any);
      vi.mocked(prisma.booking.update).mockResolvedValue({} as any);

      const result = await service.createReview('author-1', {
        bookingId: 'booking-1',
        serviceId: 'service-1',
        subjectId: 'provider-1',
        rating: 5,
        comment: 'Great service!',
      });

      expect(result.rating).toBe(5);
      expect(prisma.review.create).toHaveBeenCalled();
    });

    it('should throw if booking not completed', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue({
        id: 'booking-1',
        status: 'PENDING',
        customerId: 'author-1',
        providerId: 'provider-1',
      } as any);

      await expect(
        service.createReview('author-1', {
          bookingId: 'booking-1',
          serviceId: 'service-1',
          subjectId: 'provider-1',
          rating: 5,
          comment: 'Great service!',
        }),
      ).rejects.toThrow('completed bookings');
    });

    it('should throw if already reviewed', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue({
        id: 'booking-1',
        status: 'COMPLETED',
        customerId: 'author-1',
        providerId: 'provider-1',
      } as any);
      vi.mocked(prisma.review.findUnique).mockResolvedValue({ id: 'existing' } as any);

      await expect(
        service.createReview('author-1', {
          bookingId: 'booking-1',
          serviceId: 'service-1',
          subjectId: 'provider-1',
          rating: 5,
          comment: 'Great service!',
        }),
      ).rejects.toThrow('already reviewed');
    });
  });

  describe('getServiceReviews', () => {
    it('should return paginated reviews for a service', async () => {
      vi.mocked(prisma.review.count).mockResolvedValue(2);
      vi.mocked(prisma.review.findMany).mockResolvedValue([
        { id: 'r1' },
        { id: 'r2' },
      ] as any);

      const result = await service.getServiceReviews('service-1', 1, 20);
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe('getUserReviews', () => {
    it('should return reviews where user is the subject', async () => {
      vi.mocked(prisma.review.count).mockResolvedValue(1);
      vi.mocked(prisma.review.findMany).mockResolvedValue([{ id: 'r1' }] as any);

      const result = await service.getUserReviews('user-1', 1, 20);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('updateReview', () => {
    it('should update a review within 48h window', async () => {
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: 'review-1',
        authorId: 'author-1',
        serviceId: 'service-1',
        createdAt: new Date(), // just created
      } as any);
      vi.mocked(prisma.review.update).mockResolvedValue({
        id: 'review-1',
        rating: 4,
        comment: 'Updated',
      } as any);

      const result = await service.updateReview('review-1', 'author-1', {
        rating: 4,
        comment: 'Updated comment here',
      });
      expect(result.rating).toBe(4);
    });

    it('should throw if not the author', async () => {
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: 'review-1',
        authorId: 'other-author',
        createdAt: new Date(),
      } as any);

      await expect(
        service.updateReview('review-1', 'author-1', { rating: 3 }),
      ).rejects.toThrow('own reviews');
    });

    it('should throw if past 48h edit window', async () => {
      const oldDate = new Date(Date.now() - 49 * 60 * 60 * 1000);
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: 'review-1',
        authorId: 'author-1',
        serviceId: 'service-1',
        createdAt: oldDate,
      } as any);

      await expect(
        service.updateReview('review-1', 'author-1', { rating: 3 }),
      ).rejects.toThrow('48 hours');
    });
  });

  describe('deleteReview', () => {
    it('should soft delete by setting isHidden', async () => {
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: 'review-1',
        serviceId: 'service-1',
      } as any);
      vi.mocked(prisma.review.update).mockResolvedValue({
        id: 'review-1',
        isHidden: true,
      } as any);

      const result = await service.deleteReview('review-1');
      expect(result.isHidden).toBe(true);
    });
  });

  describe('reportReview', () => {
    it('should flag a review as reported', async () => {
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: 'review-1',
        authorId: 'other-user',
      } as any);
      vi.mocked(prisma.review.update).mockResolvedValue({
        id: 'review-1',
        isReported: true,
      } as any);

      const result = await service.reportReview('review-1', 'reporter-1', 'Inappropriate');
      expect(result.isReported).toBe(true);
    });

    it('should throw if reporting own review', async () => {
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: 'review-1',
        authorId: 'author-1',
      } as any);

      await expect(
        service.reportReview('review-1', 'author-1', 'Inappropriate'),
      ).rejects.toThrow('own review');
    });
  });
});
