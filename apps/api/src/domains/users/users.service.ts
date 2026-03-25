import { prisma } from '@jobsy/database';
import { calculatePagination } from '@jobsy/shared';
import type { UpdateProfileInput } from '@jobsy/shared';
import { AppError } from '../../middleware/error-handler';

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

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelectWithoutPassword,
  });

  if (!user) {
    throw new AppError('NOT_FOUND', 404, 'User not found');
  }

  return user;
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('NOT_FOUND', 404, 'User not found');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: userSelectWithoutPassword,
  });

  return updated;
}

export async function getPublicProfile(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError('NOT_FOUND', 404, 'User not found');
  }

  return user;
}

export async function getUserServices(userId: string, page = 1, limit = 10) {
  const total = await prisma.service.count({
    where: { providerId: userId, isActive: true, deletedAt: null },
  });

  const { skip, take, pagination } = calculatePagination(page, limit, total);

  const services = await prisma.service.findMany({
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

export async function getUserReviews(userId: string, page = 1, limit = 10) {
  const total = await prisma.review.count({
    where: { subjectId: userId, isHidden: false },
  });

  const { skip, take, pagination } = calculatePagination(page, limit, total);

  const reviews = await prisma.review.findMany({
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

export async function updateAvatar(userId: string, avatarUrl: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('NOT_FOUND', 404, 'User not found');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: userSelectWithoutPassword,
  });

  return updated;
}

export async function updateSettings(userId: string, data: Record<string, unknown>) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('NOT_FOUND', 404, 'User not found');
  }

  // Settings updates apply to whitelisted user fields only
  const allowedKeys = ['phone', 'parish', 'address'] as const;
  const filtered: Record<string, unknown> = {};
  for (const key of allowedKeys) {
    if (key in data) {
      filtered[key] = data[key];
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: filtered,
    select: userSelectWithoutPassword,
  });

  return updated;
}

export async function submitVerification(userId: string, docs: { type: string; url: string; publicId: string }[]) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('NOT_FOUND', 404, 'User not found');
  }

  if (user.role !== 'PROVIDER') {
    throw new AppError('FORBIDDEN', 403, 'Only providers can submit verification');
  }

  const verificationDocs = await prisma.$transaction(
    docs.map((doc) =>
      prisma.verificationDoc.create({
        data: {
          userId,
          type: doc.type,
          url: doc.url,
          publicId: doc.publicId,
        },
      }),
    ),
  );

  // Set status to PENDING so admins can review
  await prisma.user.update({
    where: { id: userId },
    data: { verificationStatus: 'PENDING' },
  });

  return verificationDocs;
}

export async function getDashboard(userId: string, role: string) {
  if (role === 'PROVIDER') {
    const [serviceCount, bookingStats, earnings] = await Promise.all([
      prisma.service.count({ where: { providerId: userId, isActive: true, deletedAt: null } }),
      prisma.booking.groupBy({
        by: ['status'],
        where: { providerId: userId },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: {
          booking: { providerId: userId },
          status: 'SUCCEEDED',
        },
        _sum: { providerAmount: true },
        _count: true,
      }),
    ]);

    const bookings: Record<string, number> = {};
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
    prisma.booking.groupBy({
      by: ['status'],
      where: { customerId: userId },
      _count: true,
    }),
    prisma.review.count({ where: { authorId: userId } }),
  ]);

  const bookings: Record<string, number> = {};
  for (const stat of bookingStats) {
    bookings[stat.status] = stat._count;
  }

  return {
    role: 'CUSTOMER',
    bookings,
    reviewsGiven,
  };
}
