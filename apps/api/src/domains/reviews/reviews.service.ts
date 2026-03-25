import { prisma } from '@jobsy/database';
import { AppError } from '../../middleware/error-handler';
import { calculatePagination } from '@jobsy/shared';
import type { CreateReviewInput, UpdateReviewInput } from '@jobsy/shared';

const EDIT_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours

export async function createReview(authorId: string, data: CreateReviewInput) {
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    select: { id: true, status: true, customerId: true, providerId: true },
  });

  if (!booking) {
    throw new AppError('NOT_FOUND', 404, 'Booking not found');
  }

  if (booking.status !== 'COMPLETED' && booking.status !== 'REVIEWED') {
    throw new AppError(
      'BAD_REQUEST',
      400,
      'Reviews can only be left for completed bookings',
    );
  }

  if (booking.customerId !== authorId && booking.providerId !== authorId) {
    throw new AppError('FORBIDDEN', 403, 'You are not part of this booking');
  }

  // Check unique constraint: one review per booking per author
  const existing = await prisma.review.findUnique({
    where: {
      bookingId_authorId: {
        bookingId: data.bookingId,
        authorId,
      },
    },
  });

  if (existing) {
    throw new AppError('CONFLICT', 409, 'You have already reviewed this booking');
  }

  const review = await prisma.review.create({
    data: {
      bookingId: data.bookingId,
      serviceId: data.serviceId,
      authorId,
      subjectId: data.subjectId,
      rating: data.rating,
      comment: data.comment,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  // Update the service average rating
  await updateServiceRating(data.serviceId);

  // Update booking status to REVIEWED
  await prisma.booking.update({
    where: { id: data.bookingId },
    data: { status: 'REVIEWED' },
  });

  return review;
}

export async function getServiceReviews(
  serviceId: string,
  page: number,
  limit: number,
) {
  const where = {
    serviceId,
    isHidden: false,
  };

  const total = await prisma.review.count({ where });
  const { skip, take, pagination } = calculatePagination(page, limit, total);

  const reviews = await prisma.review.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return { data: reviews, pagination };
}

export async function getUserReviews(
  userId: string,
  page: number,
  limit: number,
) {
  const where = {
    subjectId: userId,
    isHidden: false,
  };

  const total = await prisma.review.count({ where });
  const { skip, take, pagination } = calculatePagination(page, limit, total);

  const reviews = await prisma.review.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      service: { select: { id: true, title: true } },
    },
  });

  return { data: reviews, pagination };
}

export async function updateReview(
  id: string,
  authorId: string,
  data: UpdateReviewInput,
) {
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) {
    throw new AppError('NOT_FOUND', 404, 'Review not found');
  }

  if (review.authorId !== authorId) {
    throw new AppError('FORBIDDEN', 403, 'You can only edit your own reviews');
  }

  const elapsed = Date.now() - review.createdAt.getTime();
  if (elapsed > EDIT_WINDOW_MS) {
    throw new AppError(
      'BAD_REQUEST',
      400,
      'Reviews can only be edited within 48 hours of creation',
    );
  }

  const updated = await prisma.review.update({
    where: { id },
    data: {
      ...(data.rating !== undefined && { rating: data.rating }),
      ...(data.comment !== undefined && { comment: data.comment }),
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  if (data.rating !== undefined) {
    await updateServiceRating(review.serviceId);
  }

  return updated;
}

export async function deleteReview(id: string) {
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) {
    throw new AppError('NOT_FOUND', 404, 'Review not found');
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { isHidden: true },
  });

  await updateServiceRating(review.serviceId);

  return updated;
}

export async function reportReview(id: string, reporterId: string, reason: string) {
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) {
    throw new AppError('NOT_FOUND', 404, 'Review not found');
  }

  if (review.authorId === reporterId) {
    throw new AppError('BAD_REQUEST', 400, 'You cannot report your own review');
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { isReported: true },
  });

  return updated;
}

/**
 * Recalculate and persist the average rating for a service
 * based on all visible (non-hidden) reviews.
 */
async function updateServiceRating(serviceId: string) {
  const aggregate = await prisma.review.aggregate({
    where: { serviceId, isHidden: false },
    _avg: { rating: true },
    _count: { id: true },
  });

  // The Service model doesn't have an avgRating column in the current schema,
  // but we still compute it. If/when the column is added, uncomment below:
  // await prisma.service.update({
  //   where: { id: serviceId },
  //   data: {
  //     avgRating: aggregate._avg.rating ?? 0,
  //     reviewCount: aggregate._count.id,
  //   },
  // });

  return {
    avgRating: aggregate._avg.rating ?? 0,
    reviewCount: aggregate._count.id,
  };
}
