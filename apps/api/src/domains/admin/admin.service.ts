import { prisma } from '@jobsy/database';
import { AppError } from '../../middleware/error-handler';

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboard() {
  const [
    totalUsers,
    totalProviders,
    totalCustomers,
    totalServices,
    activeBookings,
    completedBookings,
    revenueResult,
    recentBookings,
    recentSignups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'PROVIDER' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.service.count({ where: { deletedAt: null } }),
    prisma.booking.count({
      where: { status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } },
    }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.payment.aggregate({
      _sum: { platformFee: true },
      where: { status: 'SUCCEEDED' },
    }),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true } },
        provider: { select: { id: true, name: true } },
        service: { select: { id: true, title: true } },
      },
    }),
    prisma.user.findMany({
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

export async function listUsers(
  page: number = 1,
  limit: number = 20,
  role?: string,
  search?: string,
) {
  const skip = (page - 1) * limit;

  const where: any = {};

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
    prisma.user.findMany({
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
    prisma.user.count({ where }),
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

export async function updateUser(id: string, data: Record<string, any>) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError('NOT_FOUND', 404, 'User not found');
  }

  return prisma.user.update({
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

export async function listServices(
  page: number = 1,
  limit: number = 20,
  featured?: boolean,
  active?: boolean,
) {
  const skip = (page - 1) * limit;

  const where: any = { deletedAt: null };

  if (featured !== undefined) {
    where.isFeatured = featured;
  }

  if (active !== undefined) {
    where.isActive = active;
  }

  const [services, total] = await Promise.all([
    prisma.service.findMany({
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
    prisma.service.count({ where }),
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

export async function updateService(id: string, data: Record<string, any>) {
  const service = await prisma.service.findFirst({ where: { id, deletedAt: null } });
  if (!service) {
    throw new AppError('NOT_FOUND', 404, 'Service not found');
  }

  return prisma.service.update({
    where: { id },
    data,
    include: {
      category: true,
      provider: { select: { id: true, name: true } },
    },
  });
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export async function listBookings(
  page: number = 1,
  limit: number = 20,
  status?: string,
) {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) {
    where.status = status;
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
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
    prisma.booking.count({ where }),
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

export async function getPaymentReport(startDate?: string, endDate?: string) {
  const where: any = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [totals, byStatus] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true, platformFee: true, providerAmount: true },
      _count: true,
      where,
    }),
    prisma.payment.groupBy({
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

export async function getReportedReviews(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const where = { isReported: true };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
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
    prisma.review.count({ where }),
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

export async function updateReview(id: string, data: Record<string, any>) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    throw new AppError('NOT_FOUND', 404, 'Review not found');
  }

  return prisma.review.update({
    where: { id },
    data,
    include: {
      author: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true } },
    },
  });
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function getAnalytics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersThisMonth,
    newUsersThisWeek,
    totalBookings,
    bookingsThisMonth,
    bookingsThisWeek,
    totalServices,
    totalRevenue,
    revenueThisMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.booking.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.service.count({ where: { deletedAt: null } }),
    prisma.payment.aggregate({
      _sum: { platformFee: true },
      where: { status: 'SUCCEEDED' },
    }),
    prisma.payment.aggregate({
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
