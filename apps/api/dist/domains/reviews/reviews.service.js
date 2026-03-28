"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = createReview;
exports.getServiceReviews = getServiceReviews;
exports.getUserReviews = getUserReviews;
exports.updateReview = updateReview;
exports.deleteReview = deleteReview;
exports.reportReview = reportReview;
const database_1 = require("@jobsy/database");
const error_handler_1 = require("../../middleware/error-handler");
const shared_1 = require("@jobsy/shared");
const EDIT_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours
async function createReview(authorId, data) {
    const booking = await database_1.prisma.booking.findUnique({
        where: { id: data.bookingId },
        select: { id: true, status: true, customerId: true, providerId: true },
    });
    if (!booking) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'Booking not found');
    }
    if (booking.status !== 'COMPLETED' && booking.status !== 'REVIEWED') {
        throw new error_handler_1.AppError('BAD_REQUEST', 400, 'Reviews can only be left for completed bookings');
    }
    if (booking.customerId !== authorId && booking.providerId !== authorId) {
        throw new error_handler_1.AppError('FORBIDDEN', 403, 'You are not part of this booking');
    }
    // Check unique constraint: one review per booking per author
    const existing = await database_1.prisma.review.findUnique({
        where: {
            bookingId_authorId: {
                bookingId: data.bookingId,
                authorId,
            },
        },
    });
    if (existing) {
        throw new error_handler_1.AppError('CONFLICT', 409, 'You have already reviewed this booking');
    }
    const review = await database_1.prisma.review.create({
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
    await database_1.prisma.booking.update({
        where: { id: data.bookingId },
        data: { status: 'REVIEWED' },
    });
    return review;
}
async function getServiceReviews(serviceId, page, limit) {
    const where = {
        serviceId,
        isHidden: false,
    };
    const total = await database_1.prisma.review.count({ where });
    const { skip, take, pagination } = (0, shared_1.calculatePagination)(page, limit, total);
    const reviews = await database_1.prisma.review.findMany({
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
async function getUserReviews(userId, page, limit) {
    const where = {
        subjectId: userId,
        isHidden: false,
    };
    const total = await database_1.prisma.review.count({ where });
    const { skip, take, pagination } = (0, shared_1.calculatePagination)(page, limit, total);
    const reviews = await database_1.prisma.review.findMany({
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
async function updateReview(id, authorId, data) {
    const review = await database_1.prisma.review.findUnique({ where: { id } });
    if (!review) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'Review not found');
    }
    if (review.authorId !== authorId) {
        throw new error_handler_1.AppError('FORBIDDEN', 403, 'You can only edit your own reviews');
    }
    const elapsed = Date.now() - review.createdAt.getTime();
    if (elapsed > EDIT_WINDOW_MS) {
        throw new error_handler_1.AppError('BAD_REQUEST', 400, 'Reviews can only be edited within 48 hours of creation');
    }
    const updated = await database_1.prisma.review.update({
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
async function deleteReview(id) {
    const review = await database_1.prisma.review.findUnique({ where: { id } });
    if (!review) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'Review not found');
    }
    const updated = await database_1.prisma.review.update({
        where: { id },
        data: { isHidden: true },
    });
    await updateServiceRating(review.serviceId);
    return updated;
}
async function reportReview(id, reporterId, reason) {
    const review = await database_1.prisma.review.findUnique({ where: { id } });
    if (!review) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'Review not found');
    }
    if (review.authorId === reporterId) {
        throw new error_handler_1.AppError('BAD_REQUEST', 400, 'You cannot report your own review');
    }
    const updated = await database_1.prisma.review.update({
        where: { id },
        data: { isReported: true },
    });
    return updated;
}
/**
 * Recalculate and persist the average rating for a service
 * based on all visible (non-hidden) reviews.
 */
async function updateServiceRating(serviceId) {
    const aggregate = await database_1.prisma.review.aggregate({
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
//# sourceMappingURL=reviews.service.js.map