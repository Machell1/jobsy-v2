import { prisma } from '@jobsy/database';
import { AppError } from '../../middleware/error-handler';

export async function getPromotedListings() {
  const now = new Date();
  return prisma.promotedListing.findMany({
    where: { isActive: true, endsAt: { gt: now } },
    include: {
      service: {
        include: {
          category: { select: { name: true, slug: true } },
          provider: { select: { id: true, name: true } },
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
        },
      },
    },
    orderBy: { planType: 'desc' },
  });
}

export async function createPromotedListing(
  providerId: string,
  serviceId: string,
  planType: string,
  durationDays: number,
) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new AppError('NOT_FOUND', 404, 'Service not found');
  if (service.providerId !== providerId)
    throw new AppError('FORBIDDEN', 403, 'You do not own this service');

  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + durationDays);

  return prisma.promotedListing.upsert({
    where: { serviceId },
    update: { planType, startsAt, endsAt, isActive: true },
    create: { serviceId, providerId, planType, startsAt, endsAt },
  });
}

export async function getSubscription(providerId: string) {
  const sub = await prisma.providerSubscription.findUnique({
    where: { providerId },
  });
  return sub ?? { plan: 'free', status: 'active', currentPeriodEnd: null };
}

export async function upsertSubscription(
  providerId: string,
  plan: string,
) {
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

  return prisma.providerSubscription.upsert({
    where: { providerId },
    update: { plan, status: 'active', currentPeriodEnd },
    create: { providerId, plan, status: 'active', currentPeriodEnd },
  });
}

export async function trackClick(
  providerId: string | undefined,
  affiliateCode: string | undefined,
  targetUrl: string,
  source: string | undefined,
) {
  if (affiliateCode && providerId) {
    const campaign = await prisma.adCampaign.findFirst({
      where: { providerId, isActive: true },
    });
    if (campaign) {
      await prisma.adCampaign.update({
        where: { id: campaign.id },
        data: { clicks: { increment: 1 } },
      });
    }
  }
  return { tracked: true, targetUrl };
}

export async function getCampaigns(providerId: string) {
  return prisma.adCampaign.findMany({
    where: { providerId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createCampaign(
  providerId: string,
  title: string,
  targetUrl: string,
  budget: number,
) {
  return prisma.adCampaign.create({
    data: { providerId, title, targetUrl, budget },
  });
}
