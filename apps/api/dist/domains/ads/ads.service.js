"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPromotedListings = getPromotedListings;
exports.createPromotedListing = createPromotedListing;
exports.getSubscription = getSubscription;
exports.upsertSubscription = upsertSubscription;
exports.trackClick = trackClick;
exports.getCampaigns = getCampaigns;
exports.createCampaign = createCampaign;
const database_1 = require("@jobsy/database");
const error_handler_1 = require("../../middleware/error-handler");
async function getPromotedListings() {
    const now = new Date();
    return database_1.prisma.promotedListing.findMany({
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
async function createPromotedListing(providerId, serviceId, planType, durationDays) {
    const service = await database_1.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service)
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'Service not found');
    if (service.providerId !== providerId)
        throw new error_handler_1.AppError('FORBIDDEN', 403, 'You do not own this service');
    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setDate(endsAt.getDate() + durationDays);
    return database_1.prisma.promotedListing.upsert({
        where: { serviceId },
        update: { planType, startsAt, endsAt, isActive: true },
        create: { serviceId, providerId, planType, startsAt, endsAt },
    });
}
async function getSubscription(providerId) {
    const sub = await database_1.prisma.providerSubscription.findUnique({
        where: { providerId },
    });
    return sub ?? { plan: 'free', status: 'active', currentPeriodEnd: null };
}
async function upsertSubscription(providerId, plan) {
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    return database_1.prisma.providerSubscription.upsert({
        where: { providerId },
        update: { plan, status: 'active', currentPeriodEnd },
        create: { providerId, plan, status: 'active', currentPeriodEnd },
    });
}
async function trackClick(providerId, affiliateCode, targetUrl, source) {
    if (affiliateCode && providerId) {
        const campaign = await database_1.prisma.adCampaign.findFirst({
            where: { providerId, isActive: true },
        });
        if (campaign) {
            await database_1.prisma.adCampaign.update({
                where: { id: campaign.id },
                data: { clicks: { increment: 1 } },
            });
        }
    }
    return { tracked: true, targetUrl };
}
async function getCampaigns(providerId) {
    return database_1.prisma.adCampaign.findMany({
        where: { providerId },
        orderBy: { createdAt: 'desc' },
    });
}
async function createCampaign(providerId, title, targetUrl, budget) {
    return database_1.prisma.adCampaign.create({
        data: { providerId, title, targetUrl, budget },
    });
}
//# sourceMappingURL=ads.service.js.map