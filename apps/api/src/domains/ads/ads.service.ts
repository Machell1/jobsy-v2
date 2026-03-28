import { prisma } from '@jobsy/database';
import { AppError } from '../../middleware/error-handler';

// ---------------------------------------------------------------------------
// Subscription plans (static — no DB needed)
// ---------------------------------------------------------------------------
export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    priceJMD: 0,
    period: 'forever',
    features: [
      'List up to 3 services',
      'Basic provider profile',
      'Standard placement in search',
      'Receive unlimited booking requests',
      'In-app messaging with customers',
      'Customer reviews & ratings',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceJMD: 1500,
    period: 'per month',
    features: [
      'Unlimited service listings',
      'Priority placement in search',
      'Pro badge on your profile',
      'Booking analytics dashboard',
      'Advanced profile customisation',
      'Priority customer support',
      'Everything in Free',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    priceJMD: 3500,
    period: 'per month',
    features: [
      'Promoted listings (homepage spotlight)',
      'Featured placement at top of search',
      'Verified badge on profile',
      'Full analytics & reporting',
      'Ad campaign dashboard',
      'Dedicated account manager',
      'Everything in Pro',
    ],
  },
];

// ---------------------------------------------------------------------------
// Promoted listings
// ---------------------------------------------------------------------------
export async function getPromotedListings() {
  const now = new Date();
  return prisma.promotedListing.findMany({
    where: { isActive: true, expiresAt: { gt: now } },
    include: {
      service: {
        include: {
          category: { select: { name: true, slug: true } },
          provider: { select: { id: true, name: true } },
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
        },
      },
    },
    orderBy: { tier: 'desc' },
  });
}

export async function createPromotedListing(
  providerId: string,
  serviceId: string,
  tier: string,
  durationDays: number,
  amountPaid: number,
  paymentRef?: string,
) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new AppError('NOT_FOUND', 404, 'Service not found');
  if (service.providerId !== providerId)
    throw new AppError('FORBIDDEN', 403, 'You do not own this service');

  const startsAt = new Date();
  const expiresAt = new Date(startsAt);
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  return prisma.promotedListing.create({
    data: { serviceId, providerId, tier, startsAt, expiresAt, amountPaid, paymentRef, isActive: true },
  });
}

// ---------------------------------------------------------------------------
// Provider subscriptions
// ---------------------------------------------------------------------------
export async function getSubscription(userId: string) {
  const sub = await prisma.providerSubscription.findUnique({ where: { userId } });
  return sub ?? { plan: 'free', isActive: true, expiresAt: null };
}

export async function upsertSubscription(
  userId: string,
  plan: string,
  amountPaid?: number,
  paymentRef?: string,
) {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  return prisma.providerSubscription.upsert({
    where: { userId },
    update: { plan, isActive: true, expiresAt, amountPaid, paymentRef },
    create: { userId, plan, isActive: true, expiresAt, amountPaid, paymentRef },
  });
}

// ---------------------------------------------------------------------------
// Ad banners (AdCampaign)
// ---------------------------------------------------------------------------
export async function getBanners(placement: string) {
  const now = new Date();
  return prisma.adCampaign.findMany({
    where: { placement, isActive: true, expiresAt: { gt: now }, startsAt: { lte: now } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function recordImpression(id: string) {
  return prisma.adCampaign.update({
    where: { id },
    data: { impressions: { increment: 1 } },
  });
}

export async function recordClick(id: string) {
  return prisma.adCampaign.update({
    where: { id },
    data: { clicks: { increment: 1 } },
  });
}

export async function createCampaign(data: {
  name: string;
  advertiser: string;
  imageUrl?: string;
  linkUrl: string;
  placement: string;
  startsAt: Date;
  expiresAt: Date;
}) {
  return prisma.adCampaign.create({ data });
}
