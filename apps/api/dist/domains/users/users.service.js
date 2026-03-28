"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.getPublicProfile = getPublicProfile;
exports.getUserServices = getUserServices;
exports.getUserReviews = getUserReviews;
exports.updateAvatar = updateAvatar;
exports.updateSettings = updateSettings;
exports.submitVerification = submitVerification;
exports.getDashboard = getDashboard;
const database_1 = require("@jobsy/database");
const shared_1 = require("@jobsy/shared");
const error_handler_1 = require("../../middleware/error-handler");
const userSelectWithoutPassword = {
    id: true,
    email: true,
    name: true,
    role: true,
    phone: true,
    avatarUrl: true,
    bio: true,
    isEmailVerified: true,
    isActive: true,
    verificationStatus: true,
    parish: true,
    latitude: true,
    longitude: true,
    address: true,
    stripeCustomerId: true,
    stripeAccountId: true,
    stripeOnboarded: true,
    createdAt: true,
    updatedAt: true,
};
const publicUserSelect = {
    id: true,
    name: true,
    role: true,
    avatarUrl: true,
    bio: true,
    isEmailVerified: true,
    verificationStatus: true,
    parish: true,
    createdAt: true,
};
async function getProfile(userId) {
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        select: userSelectWithoutPassword,
    });
    if (!user) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'User not found');
    }
    return user;
}
async function updateProfile(userId, data) {
    const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'User not found');
    }
    const updated = await database_1.prisma.user.update({
        where: { id: userId },
        data,
        select: userSelectWithoutPassword,
    });
    return updated;
}
async function getPublicProfile(id) {
    const user = await database_1.prisma.user.findUnique({
        where: { id },
        select: publicUserSelect,
    });
    if (!user) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'User not found');
    }
    return user;
}
async function getUserServices(userId, page = 1, limit = 10) {
    const total = await database_1.prisma.service.count({
        where: { providerId: userId, isActive: true, deletedAt: null },
    });
    const { skip, take, pagination } = (0, shared_1.calculatePagination)(page, limit, total);
    const services = await database_1.prisma.service.findMany({
        where: { providerId: userId, isActive: true, deletedAt: null },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
            images: { orderBy: { sortOrder: 'asc' } },
            category: true,
        },
    });
    return { data: services, pagination };
}
async function getUserReviews(userId, page = 1, limit = 10) {
    const total = await database_1.prisma.review.count({
        where: { subjectId: userId, isHidden: false },
    });
    const { skip, take, pagination } = (0, shared_1.calculatePagination)(page, limit, total);
    const reviews = await database_1.prisma.review.findMany({
        where: { subjectId: userId, isHidden: false },
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
async function updateAvatar(userId, avatarUrl) {
    const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'User not found');
    }
    const updated = await database_1.prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
        select: userSelectWithoutPassword,
    });
    return updated;
}
async function updateSettings(userId, data) {
    const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'User not found');
    }
    // Settings updates apply to whitelisted user fields only
    const allowedKeys = ['phone', 'parish', 'address'];
    const filtered = {};
    for (const key of allowedKeys) {
        if (key in data) {
            filtered[key] = data[key];
        }
    }
    const updated = await database_1.prisma.user.update({
        where: { id: userId },
        data: filtered,
        select: userSelectWithoutPassword,
    });
    return updated;
}
async function submitVerification(userId, docs) {
    const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'User not found');
    }
    if (user.role !== 'PROVIDER') {
        throw new error_handler_1.AppError('FORBIDDEN', 403, 'Only providers can submit verification');
    }
    const verificationDocs = await database_1.prisma.$transaction(docs.map((doc) => database_1.prisma.verificationDoc.create({
        data: {
            userId,
            type: doc.type,
            url: doc.url,
            publicId: doc.publicId,
        },
    })));
    // Set status to PENDING so admins can review
    await database_1.prisma.user.update({
        where: { id: userId },
        data: { verificationStatus: 'PENDING' },
    });
    return verificationDocs;
}
async function getDashboard(userId, role) {
    if (role === 'PROVIDER') {
        const [serviceCount, bookingStats, earnings] = await Promise.all([
            database_1.prisma.service.count({ where: { providerId: userId, isActive: true, deletedAt: null } }),
            database_1.prisma.booking.groupBy({
                by: ['status'],
                where: { providerId: userId },
                _count: true,
            }),
            database_1.prisma.payment.aggregate({
                where: {
                    booking: { providerId: userId },
                    status: 'SUCCEEDED',
                },
                _sum: { providerAmount: true },
                _count: true,
            }),
        ]);
        const bookings = {};
        for (const stat of bookingStats) {
            bookings[stat.status] = stat._count;
        }
        return {
            role: 'PROVIDER',
            serviceCount,
            bookings,
            totalEarnings: earnings._sum.providerAmount ?? 0,
            completedPayments: earnings._count,
        };
    }
    // CUSTOMER dashboard
    const [bookingStats, reviewsGiven] = await Promise.all([
        database_1.prisma.booking.groupBy({
            by: ['status'],
            where: { customerId: userId },
            _count: true,
        }),
        database_1.prisma.review.count({ where: { authorId: userId } }),
    ]);
    const bookings = {};
    for (const stat of bookingStats) {
        bookings[stat.status] = stat._count;
    }
    return {
        role: 'CUSTOMER',
        bookings,
        reviewsGiven,
    };
}
//# sourceMappingURL=users.service.js.map