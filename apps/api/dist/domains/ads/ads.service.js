"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBSCRIPTION_PLANS = void 0;
exports.getPromotedListings = getPromotedListings;
exports.createPromotedListing = createPromotedListing;
exports.getSubscription = getSubscription;
exports.upsertSubscription = upsertSubscription;
exports.getBanners = getBanners;
exports.recordImpression = recordImpression;
exports.recordClick = recordClick;
exports.createCampaign = createCampaign;
const database_1 = require("@jobsy/database");
const error_handler_1 = require("../../middleware/error-handler");
// ---------------------------------------------------------------------------
// Subscription plans (static — no DB needed)
// ---------------------------------------------------------------------------
exports.SUBSCRIPTION_PLANS = [
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
async function getPromotedListings() {
    const now = new Date();
    return database_1.prisma.promotedListing.findMany({
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
async function createPromotedListing(providerId, serviceId, tier, durationDays, amountPaid, paymentRef) {
    const service = await database_1.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service)
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'Service not found');
    if (service.providerId !== providerId)
        throw new error_handler_1.AppError('FORBIDDEN', 403, 'You do not own this service');
    const startsAt = new Date();
    const expiresAt = new Date(startsAt);
    expiresAt.setDate(expiresAt.getDate() + durationDays);
    return database_1.prisma.promotedListing.create({
        data: { serviceId, providerId, tier, startsAt, expiresAt, amountPaid, paymentRef, isActive: true },
    });
}
// ---------------------------------------------------------------------------
// Provider subscriptions
// ---------------------------------------------------------------------------
async function getSubscription(userId) {
    const sub = await database_1.prisma.providerSubscription.findUnique({ where: { userId } });
    return sub ?? { plan: 'free', isActive: true, expiresAt: null };
}
async function upsertSubscription(userId, plan, amountPaid, paymentRef) {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    return database_1.prisma.providerSubscription.upsert({
        where: { userId },
        update: { plan, isActive: true, expiresAt, amountPaid, paymentRef },
        create: { userId, plan, isActive: true, expiresAt, amountPaid, paymentRef },
    });
}
// ---------------------------------------------------------------------------
// Ad banners (AdCampaign)
// ---------------------------------------------------------------------------
async function getBanners(placement) {
    const now = new Date();
    return database_1.prisma.adCampaign.findMany({
        where: { placement, isActive: true, expiresAt: { gt: now }, startsAt: { lte: now } },
        orderBy: { createdAt: 'desc' },
    });
}
async function recordImpression(id) {
    return database_1.prisma.adCampaign.update({
        where: { id },
        data: { impressions: { increment: 1 } },
    });
}
async function recordClick(id) {
    return database_1.prisma.adCampaign.update({
        where: { id },
        data: { clicks: { increment: 1 } },
    });
}
async function createCampaign(data) {
    return database_1.prisma.adCampaign.create({ data });
}
//# sourceMappingURL=ads.service.js.map