import { prisma } from '@jobsy/database';
import { calculatePagination } from '@jobsy/shared';

export const PLATFORM_COMMISSION_RATE = 0;

export async function getPaymentHistory(
  userId: string,
  role: string,
  page: number,
  limit: number,
) {
  const where =
    role === 'PROVIDER'
      ? { booking: { providerId: userId } }
      : role === 'ADMIN'
        ? {}
        : { booking: { customerId: userId } };

  const total = await prisma.payment.count({ where });
  const { skip, take, pagination } = calculatePagination(page, limit, total);

  const payments = await prisma.payment.findMany({
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

export async function getEarnings(providerId: string) {
  const result = await prisma.payment.aggregate({
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

  const pendingResult = await prisma.payment.aggregate({
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
