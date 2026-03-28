"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLATFORM_COMMISSION_RATE = void 0;
exports.getPaymentHistory = getPaymentHistory;
exports.getEarnings = getEarnings;
const database_1 = require("@jobsy/database");
const shared_1 = require("@jobsy/shared");
exports.PLATFORM_COMMISSION_RATE = 0;
async function getPaymentHistory(userId, role, page, limit) {
    const where = role === 'PROVIDER'
        ? { booking: { providerId: userId } }
        : role === 'ADMIN'
            ? {}
            : { booking: { customerId: userId } };
    const total = await database_1.prisma.payment.count({ where });
    const { skip, take, pagination } = (0, shared_1.calculatePagination)(page, limit, total);
    const payments = await database_1.prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
            booking: {
                select: {
                    id: true,
                    service: { select: { id: true, title: true } },
                    customer: { select: { id: true, name: true } },
                    provider: { select: { id: true, name: true } },
                    scheduledDate: true,
                },
            },
        },
    });
    return { data: payments, pagination };
}
async function getEarnings(providerId) {
    const result = await database_1.prisma.payment.aggregate({
        where: {
            booking: { providerId },
            status: 'SUCCEEDED',
        },
        _sum: {
            providerAmount: true,
        },
        _count: {
            id: true,
        },
    });
    const pendingResult = await database_1.prisma.payment.aggregate({
        where: {
            booking: { providerId },
            status: 'PROCESSING',
        },
        _sum: {
            providerAmount: true,
        },
        _count: {
            id: true,
        },
    });
    return {
        totalEarnings: result._sum.providerAmount ?? 0,
        completedPayments: result._count.id,
        pendingEarnings: pendingResult._sum.providerAmount ?? 0,
        pendingPayments: pendingResult._count.id,
    };
}
//# sourceMappingURL=payments.service.js.map