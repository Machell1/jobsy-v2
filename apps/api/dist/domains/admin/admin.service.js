"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = getDashboard;
exports.listUsers = listUsers;
exports.updateUser = updateUser;
exports.listServices = listServices;
exports.updateService = updateService;
exports.listBookings = listBookings;
exports.getPaymentReport = getPaymentReport;
exports.getReportedReviews = getReportedReviews;
exports.updateReview = updateReview;
exports.getAnalytics = getAnalytics;
const database_1 = require("@jobsy/database");
const error_handler_1 = require("../../middleware/error-handler");
// ─── Dashboard ───────────────────────────────────────────────────────────────
async function getDashboard() {
    const [totalUsers, totalProviders, totalCustomers, totalServices, activeBookings, completedBookings, revenueResult, recentBookings, recentSignups,] = await Promise.all([
        database_1.prisma.user.count(),
        database_1.prisma.user.count({ where: { role: 'PROVIDER' } }),
        database_1.prisma.user.count({ where: { role: 'CUSTOMER' } }),
        database_1.prisma.service.count({ where: { deletedAt: null } }),
        database_1.prisma.booking.count({
            where: { status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } },
        }),
        database_1.prisma.booking.count({ where: { status: 'COMPLETED' } }),
        database_1.prisma.payment.aggregate({
            _sum: { platformFee: true },
            where: { status: 'SUCCEEDED' },
        }),
        database_1.prisma.booking.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: { select: { id: true, name: true } },
                provider: { select: { id: true, name: true } },
                service: { select: { id: true, title: true } },
            },
        }),
        database_1.prisma.user.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        }),
    ]);
    return {
        totalUsers,
        totalProviders,
        totalCustomers,
        totalServices,
        activeBookings,
        completedBookings,
        totalRevenue: revenueResult._sum.platformFee ?? 0,
        recentBookings,
        recentSignups,
    };
}
// ─── Users ───────────────────────────────────────────────────────────────────
async function listUsers(page = 1, limit = 20, role, search) {
    const skip = (page - 1) * limit;
    const where = {};
    if (role) {
        where.role = role;
    }
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }
    const [users, total] = await Promise.all([
        database_1.prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                avatarUrl: true,
                isActive: true,
                isEmailVerified: true,
                verificationStatus: true,
                parish: true,
                createdAt: true,
            },
        }),
        database_1.prisma.user.count({ where }),
    ]);
    return {
        data: users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
async function updateUser(id, data) {
    const user = await database_1.prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'User not found');
    }
    return database_1.prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            verificationStatus: true,
            updatedAt: true,
        },
    });
}
// ─── Services ────────────────────────────────────────────────────────────────
async function listServices(page = 1, limit = 20, featured, active) {
    const skip = (page - 1) * limit;
    const where = { deletedAt: null };
    if (featured !== undefined) {
        where.isFeatured = featured;
    }
    if (active !== undefined) {
        where.isActive = active;
    }
    const [services, total] = await Promise.all([
        database_1.prisma.service.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                category: true,
                provider: { select: { id: true, name: true, email: true } },
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            },
        }),
        database_1.prisma.service.count({ where }),
    ]);
    return {
        data: services,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
async function updateService(id, data) {
    const service = await database_1.prisma.service.findFirst({ where: { id, deletedAt: null } });
    if (!service) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'Service not found');
    }
    return database_1.prisma.service.update({
        where: { id },
        data,
        include: {
            category: true,
            provider: { select: { id: true, name: true } },
        },
    });
}
// ─── Bookings ────────────────────────────────────────────────────────────────
async function listBookings(page = 1, limit = 20, status) {
    const skip = (page - 1) * limit;
    const where = {};
    if (status) {
        where.status = status;
    }
    const [bookings, total] = await Promise.all([
        database_1.prisma.booking.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: { select: { id: true, name: true } },
                provider: { select: { id: true, name: true } },
                service: { select: { id: true, title: true } },
                payment: { select: { id: true, amount: true, status: true } },
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
// ─── Payment Report ──────────────────────────────────────────────────────────
async function getPaymentReport(startDate, endDate) {
    const where = {};
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate)
            where.createdAt.gte = new Date(startDate);
        if (endDate)
            where.createdAt.lte = new Date(endDate);
    }
    const [totals, byStatus] = await Promise.all([
        database_1.prisma.payment.aggregate({
            _sum: { amount: true, platformFee: true, providerAmount: true },
            _count: true,
            where,
        }),
        database_1.prisma.payment.groupBy({
            by: ['status'],
            _sum: { amount: true, platformFee: true },
            _count: true,
            where,
        }),
    ]);
    return {
        totalAmount: totals._sum.amount ?? 0,
        totalPlatformFees: totals._sum.platformFee ?? 0,
        totalProviderAmount: totals._sum.providerAmount ?? 0,
        totalPayments: totals._count,
        byStatus: byStatus.map((entry) => ({
            status: entry.status,
            count: entry._count,
            totalAmount: entry._sum.amount ?? 0,
            totalFees: entry._sum.platformFee ?? 0,
        })),
    };
}
// ─── Reviews ─────────────────────────────────────────────────────────────────
async function getReportedReviews(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { isReported: true };
    const [reviews, total] = await Promise.all([
        database_1.prisma.review.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { id: true, name: true, email: true } },
                subject: { select: { id: true, name: true } },
                service: { select: { id: true, title: true } },
            },
        }),
        database_1.prisma.review.count({ where }),
    ]);
    return {
        data: reviews,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
async function updateReview(id, data) {
    const review = await database_1.prisma.review.findUnique({ where: { id } });
    if (!review) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'Review not found');
    }
    return database_1.prisma.review.update({
        where: { id },
        data,
        include: {
            author: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } },
        },
    });
}
// ─── Analytics ───────────────────────────────────────────────────────────────
async function getAnalytics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const [totalUsers, newUsersThisMonth, newUsersThisWeek, totalBookings, bookingsThisMonth, bookingsThisWeek, totalServices, totalRevenue, revenueThisMonth,] = await Promise.all([
        database_1.prisma.user.count(),
        database_1.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        database_1.prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        database_1.prisma.booking.count(),
        database_1.prisma.booking.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        database_1.prisma.booking.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        database_1.prisma.service.count({ where: { deletedAt: null } }),
        database_1.prisma.payment.aggregate({
            _sum: { platformFee: true },
            where: { status: 'SUCCEEDED' },
        }),
        database_1.prisma.payment.aggregate({
            _sum: { platformFee: true },
            where: { status: 'SUCCEEDED', createdAt: { gte: thirtyDaysAgo } },
        }),
    ]);
    return {
        users: {
            total: totalUsers,
            newThisMonth: newUsersThisMonth,
            newThisWeek: newUsersThisWeek,
        },
        bookings: {
            total: totalBookings,
            thisMonth: bookingsThisMonth,
            thisWeek: bookingsThisWeek,
        },
        services: {
            total: totalServices,
        },
        revenue: {
            total: totalRevenue._sum.platformFee ?? 0,
            thisMonth: revenueThisMonth._sum.platformFee ?? 0,
        },
    };
}
//# sourceMappingURL=admin.service.js.map