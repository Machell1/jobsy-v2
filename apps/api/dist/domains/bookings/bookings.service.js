"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooking = createBooking;
exports.listBookings = listBookings;
exports.getBooking = getBooking;
exports.updateStatus = updateStatus;
exports.cancelBooking = cancelBooking;
const database_1 = require("@jobsy/database");
const error_handler_1 = require("../../middleware/error-handler");
const VALID_TRANSITIONS = {
    PENDING: ['ACCEPTED', 'DECLINED'],
    ACCEPTED: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED'],
    COMPLETED: ['REVIEWED'],
};
async function createBooking(customerId, data) {
    const service = await database_1.prisma.service.findFirst({
        where: { id: data.serviceId, deletedAt: null, isActive: true },
    });
    if (!service) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'Service not found');
    }
    if (service.providerId === customerId) {
        throw new error_handler_1.AppError('BAD_REQUEST', 400, 'You cannot book your own service');
    }
    const booking = await database_1.prisma.booking.create({
        data: {
            serviceId: data.serviceId,
            customerId,
            providerId: service.providerId,
            status: 'PENDING',
            scheduledDate: new Date(data.scheduledDate),
            scheduledTime: data.scheduledTime,
            duration: data.duration,
            price: service.priceMin,
            currency: service.priceCurrency,
            notes: data.notes,
            locationAddress: data.locationAddress,
            locationLat: data.locationLat,
            locationLng: data.locationLng,
        },
        include: {
            service: {
                include: {
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                },
            },
            customer: { select: { id: true, name: true, avatarUrl: true } },
            provider: { select: { id: true, name: true, avatarUrl: true } },
        },
    });
    // Auto-create BOOKING_REQUEST notification for the provider
    database_1.prisma.notification.create({
        data: {
            userId: service.providerId,
            type: 'BOOKING_REQUEST',
            title: 'New Booking Request',
            body: `You have a new booking request for ${service.title}`,
            data: { bookingId: booking.id, serviceId: service.id },
        },
    }).catch(() => { });
    return booking;
}
async function listBookings(userId, role, page = 1, limit = 20, status) {
    const where = {};
    if (role === 'CUSTOMER') {
        where.customerId = userId;
    }
    else if (role === 'PROVIDER') {
        where.providerId = userId;
    }
    else {
        // ADMIN can see all, but scope to participant for safety
        where.OR = [{ customerId: userId }, { providerId: userId }];
    }
    if (status) {
        where.status = status;
    }
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
        database_1.prisma.booking.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                service: {
                    include: {
                        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                        category: true,
                    },
                },
                customer: { select: { id: true, name: true, avatarUrl: true } },
                provider: { select: { id: true, name: true, avatarUrl: true } },
            },
        }),
        database_1.prisma.booking.count({ where }),
    ]);
    return {
        data: bookings,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
async function getBooking(id, userId) {
    const booking = await database_1.prisma.booking.findUnique({
        where: { id },
        include: {
            service: {
                include: {
                    images: { orderBy: { sortOrder: 'asc' } },
                    category: true,
                    provider: { select: { id: true, name: true, avatarUrl: true, phone: true } },
                },
            },
            customer: {
                select: { id: true, name: true, avatarUrl: true, phone: true },
            },
            provider: {
                select: { id: true, name: true, avatarUrl: true, phone: true },
            },
            payment: true,
            reviews: true,
        },
    });
    if (!booking) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'Booking not found');
    }
    if (booking.customerId !== userId && booking.providerId !== userId) {
        throw new error_handler_1.AppError('FORBIDDEN', 403, 'You are not a participant of this booking');
    }
    return booking;
}
async function updateStatus(id, providerId, newStatus) {
    const booking = await database_1.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'Booking not found');
    }
    if (booking.providerId !== providerId) {
        throw new error_handler_1.AppError('FORBIDDEN', 403, 'Only the provider can update booking status');
    }
    const allowedTransitions = VALID_TRANSITIONS[booking.status];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
        throw new error_handler_1.AppError('BAD_REQUEST', 400, `Cannot transition from ${booking.status} to ${newStatus}`);
    }
    const updateData = { status: newStatus };
    if (newStatus === 'COMPLETED') {
        updateData.completedAt = new Date();
    }
    const updated = await database_1.prisma.booking.update({
        where: { id },
        data: updateData,
        include: {
            service: {
                include: {
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                },
            },
            customer: { select: { id: true, name: true, avatarUrl: true } },
            provider: { select: { id: true, name: true, avatarUrl: true } },
        },
    });
    // Auto-create BOOKING_ACCEPTED notification for the customer
    if (newStatus === 'ACCEPTED') {
        database_1.prisma.notification.create({
            data: {
                userId: booking.customerId,
                type: 'BOOKING_ACCEPTED',
                title: 'Booking Accepted',
                body: `Your booking has been accepted by ${updated.provider?.name ?? 'the provider'}`,
                data: { bookingId: booking.id, serviceId: booking.serviceId },
            },
        }).catch(() => { });
    }
    return updated;
}
async function cancelBooking(id, userId, reason) {
    const booking = await database_1.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'Booking not found');
    }
    if (booking.customerId !== userId && booking.providerId !== userId) {
        throw new error_handler_1.AppError('FORBIDDEN', 403, 'You are not a participant of this booking');
    }
    if (!['PENDING', 'ACCEPTED'].includes(booking.status)) {
        throw new error_handler_1.AppError('BAD_REQUEST', 400, `Cannot cancel booking with status ${booking.status}`);
    }
    const updated = await database_1.prisma.booking.update({
        where: { id },
        data: {
            status: 'CANCELLED',
            cancelledBy: userId,
            cancelReason: reason,
        },
        include: {
            service: {
                include: {
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                },
            },
            customer: { select: { id: true, name: true, avatarUrl: true } },
            provider: { select: { id: true, name: true, avatarUrl: true } },
        },
    });
    return updated;
}
//# sourceMappingURL=bookings.service.js.map