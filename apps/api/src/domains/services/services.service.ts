import { prisma } from '@jobsy/database';
import { AppError } from '../../middleware/error-handler';

interface ListServicesFilters {
  category?: string;
  parish?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function listServices(filters: ListServicesFilters) {
  const {
    category,
    parish,
    minPrice,
    maxPrice,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = filters;

  const where: any = {
    deletedAt: null,
    isActive: true,
  };

  if (category) {
    // If the category param looks like a UUID, use it directly; otherwise look up by slug
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(category)) {
      where.categoryId = category;
    } else {
      const cat = await prisma.category.findUnique({ where: { slug: category } });
      if (cat) {
        where.categoryId = cat.id;
      } else {
        // No matching category — return empty results
        where.categoryId = 'no-match';
      }
    }
  }

  if (parish) {
    where.parish = parish;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.priceMin = {};
    if (minPrice !== undefined) where.priceMin.gte = minPrice;
    if (maxPrice !== undefined) where.priceMin.lte = maxPrice;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        provider: {
          select: { id: true, name: true, avatarUrl: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
    }),
    prisma.service.count({ where }),
  ]);

  // Fetch active promoted service IDs for boosting
  const now = new Date();
  const promotedIds = new Set(
    (
      await prisma.promotedListing.findMany({
        where: { isActive: true, expiresAt: { gt: now } },
        select: { serviceId: true },
      })
    ).map((p) => p.serviceId),
  );

  const mapped = services.map((service) => {
    const { reviews, ...rest } = service;
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;
    return {
      ...rest,
      averageRating: avgRating,
      reviewCount: reviews.length,
      isPromoted: promotedIds.has(service.id),
    };
  });

  // Promoted listings always float to the top
  const data = [
    ...mapped.filter((s) => s.isPromoted),
    ...mapped.filter((s) => !s.isPromoted),
  ];

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getService(id: string) {
  const service = await prisma.service.findFirst({
    where: { id, deletedAt: null },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      provider: {
        select: { id: true, name: true, avatarUrl: true, bio: true, parish: true },
      },
      reviews: {
        where: { isHidden: false },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!service) {
    throw new AppError('NOT_FOUND', 404, 'Service not found');
  }

  // Increment view count in the background
  prisma.service
    .update({ where: { id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const avgRating =
    service.reviews.length > 0
      ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
      : null;

  return {
    ...service,
    averageRating: avgRating,
    reviewCount: service.reviews.length,
  };
}

export async function createService(
  providerId: string,
  data: {
    title: string;
    description: string;
    categoryId: string;
    priceMin: number;
    priceMax?: number;
    priceCurrency?: string;
    priceUnit?: string;
    parish: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    tags?: string[];
  },
) {
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new AppError('NOT_FOUND', 404, 'Category not found');
  }

  const service = await prisma.service.create({
    data: {
      ...data,
      providerId,
      images: { create: [] },
    },
    include: {
      category: true,
      images: true,
      provider: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  return service;
}

export async function updateService(
  id: string,
  userId: string,
  data: Record<string, any>,
) {
  const service = await prisma.service.findFirst({
    where: { id, deletedAt: null },
  });

  if (!service) {
    throw new AppError('NOT_FOUND', 404, 'Service not found');
  }

  if (service.providerId !== userId) {
    throw new AppError('FORBIDDEN', 403, 'You do not own this service');
  }

  const updated = await prisma.service.update({
    where: { id },
    data,
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      provider: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  return updated;
}

export async function deleteService(id: string, userId: string) {
  const service = await prisma.service.findFirst({
    where: { id, deletedAt: null },
  });

  if (!service) {
    throw new AppError('NOT_FOUND', 404, 'Service not found');
  }

  if (service.providerId !== userId) {
    throw new AppError('FORBIDDEN', 403, 'You do not own this service');
  }

  await prisma.service.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getFeatured(limit: number = 8) {
  const services = await prisma.service.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      isFeatured: true,
    },
    take: limit,
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      provider: {
        select: { id: true, name: true, avatarUrl: true },
      },
      reviews: {
        select: { rating: true },
      },
    },
    orderBy: { viewCount: 'desc' },
  });

  return services.map((service) => {
    const { reviews, ...rest } = service;
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;
    return { ...rest, averageRating: avgRating, reviewCount: reviews.length };
  });
}

export async function getNearby(
  lat: number,
  lng: number,
  radiusKm: number = 25,
  limit: number = 20,
) {
  // Approximate lat/lng degree ranges for pre-filtering
  const latDelta = radiusKm / 111.0;
  const lngDelta = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));

  const services = await prisma.$queryRaw<any[]>`
    SELECT
      s.id,
      s.title,
      s.description,
      s."priceMin",
      s."priceMax",
      s."priceCurrency",
      s."priceUnit",
      s.parish,
      s.latitude,
      s.longitude,
      s.address,
      s."viewCount",
      s."isFeatured",
      s."createdAt",
      s."providerId",
      (
        6371 * acos(
          cos(radians(${lat})) * cos(radians(s.latitude)) *
          cos(radians(s.longitude) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(s.latitude))
        )
      ) AS distance
    FROM services s
    WHERE s."deletedAt" IS NULL
      AND s."isActive" = true
      AND s.latitude IS NOT NULL
      AND s.longitude IS NOT NULL
      AND s.latitude BETWEEN ${lat - latDelta} AND ${lat + latDelta}
      AND s.longitude BETWEEN ${lng - lngDelta} AND ${lng + lngDelta}
    HAVING (
      6371 * acos(
        cos(radians(${lat})) * cos(radians(s.latitude)) *
        cos(radians(s.longitude) - radians(${lng})) +
        sin(radians(${lat})) * sin(radians(s.latitude))
      )
    ) <= ${radiusKm}
    ORDER BY distance ASC
    LIMIT ${limit}
  `;

  return services;
}
