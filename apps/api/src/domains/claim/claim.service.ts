import { prisma } from '@jobsy/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppError } from '../../middleware/error-handler';
import { sendClaimCode } from '../../lib/email';

const BCRYPT_ROUNDS = 12;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function maskEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  if (phone.length < 4) return '***';
  return `***${phone.slice(-4)}`;
}

function generateClaimCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function signAccessToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
    expiresIn: '60m',
  });
}

function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

// ---------------------------------------------------------------------------
// Search unclaimed providers
// ---------------------------------------------------------------------------

interface SearchFilters {
  q?: string;
  parish?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export async function searchUnclaimed(filters: SearchFilters) {
  const { q, parish, category, page = 1, limit = 20 } = filters;

  const where: any = { isClaimed: false };

  if (q) {
    where.businessName = { contains: q, mode: 'insensitive' };
  }
  if (parish) {
    where.parish = parish;
  }
  if (category) {
    where.category = { equals: category, mode: 'insensitive' };
  }

  const skip = (page - 1) * limit;

  const [providers, total] = await Promise.all([
    prisma.unclaimedProvider.findMany({
      where,
      skip,
      take: limit,
      orderBy: { businessName: 'asc' },
      include: { _count: { select: { services: true } } },
    }),
    prisma.unclaimedProvider.count({ where }),
  ]);

  const data = providers.map((p) => ({
    id: p.id,
    businessName: p.businessName,
    category: p.category,
    parish: p.parish,
    description: p.description,
    imageUrl: p.imageUrl,
    maskedEmail: maskEmail(p.email),
    maskedPhone: maskPhone(p.phone),
    serviceCount: p._count.services,
  }));

  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

// ---------------------------------------------------------------------------
// Get unclaimed profile
// ---------------------------------------------------------------------------

export async function getUnclaimedProfile(id: string) {
  const provider = await prisma.unclaimedProvider.findFirst({
    where: { id, isClaimed: false },
    include: { services: true },
  });

  if (!provider) {
    throw new AppError('NOT_FOUND', 404, 'Provider not found');
  }

  return {
    id: provider.id,
    businessName: provider.businessName,
    contactName: provider.contactName,
    category: provider.category,
    parish: provider.parish,
    address: provider.address,
    description: provider.description,
    imageUrl: provider.imageUrl,
    email: provider.email,
    phone: provider.phone,
    sourceUrl: provider.sourceUrl,
    maskedEmail: maskEmail(provider.email),
    maskedPhone: maskPhone(provider.phone),
    services: provider.services.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      priceMin: s.priceMin,
      priceMax: s.priceMax,
      parish: s.parish,
      tags: s.tags,
    })),
  };
}

// ---------------------------------------------------------------------------
// Request claim code
// ---------------------------------------------------------------------------

export async function requestClaimCode(
  unclaimedProviderId: string,
  contactMethod: string,
  contactValue: string,
) {
  const provider = await prisma.unclaimedProvider.findFirst({
    where: { id: unclaimedProviderId, isClaimed: false },
  });

  if (!provider) {
    throw new AppError('NOT_FOUND', 404, 'Provider not found');
  }

  // Validate contact match
  if (contactMethod === 'email') {
    if (!provider.email || contactValue.toLowerCase() !== provider.email.toLowerCase()) {
      throw new AppError('BAD_REQUEST', 400, "Contact details don't match our records");
    }
  } else if (contactMethod === 'phone') {
    const cleanInput = contactValue.replace(/\D/g, '');
    const cleanStored = (provider.phone || '').replace(/\D/g, '');
    if (!cleanStored || cleanInput !== cleanStored) {
      throw new AppError('BAD_REQUEST', 400, "Contact details don't match our records");
    }
  } else {
    throw new AppError('BAD_REQUEST', 400, 'contactMethod must be "email" or "phone"');
  }

  // Rate limit: 2 min between sends
  if (provider.claimCodeSentAt) {
    const timeSince = Date.now() - provider.claimCodeSentAt.getTime();
    if (timeSince < 2 * 60 * 1000) {
      throw new AppError('TOO_MANY_REQUESTS', 429, 'Please wait before requesting another code');
    }
  }

  // Generate and store code
  const code = generateClaimCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await prisma.unclaimedProvider.update({
    where: { id: unclaimedProviderId },
    data: {
      claimCode: code,
      claimCodeSentAt: now,
      claimCodeExpiresAt: expiresAt,
    },
  });

  // Send code via email
  if (contactMethod === 'email' && provider.email) {
    try {
      await sendClaimCode(provider.email, provider.businessName, code);
    } catch {
      // Log but don't fail — code is stored and can be used
      console.error('[claim] Failed to send claim code email');
    }
  }

  const masked = contactMethod === 'email'
    ? maskEmail(provider.email)
    : maskPhone(provider.phone);

  return {
    message: `Code sent to ${masked}`,
    expiresIn: 86400,
  };
}

// ---------------------------------------------------------------------------
// Verify claim code
// ---------------------------------------------------------------------------

export async function verifyClaimCode(unclaimedProviderId: string, code: string) {
  const provider = await prisma.unclaimedProvider.findFirst({
    where: { id: unclaimedProviderId, isClaimed: false },
  });

  if (!provider) {
    throw new AppError('NOT_FOUND', 404, 'Provider not found');
  }

  if (!provider.claimCode || !provider.claimCodeExpiresAt) {
    throw new AppError('BAD_REQUEST', 400, 'No claim code has been requested');
  }

  if (provider.claimCodeExpiresAt < new Date()) {
    throw new AppError('TOKEN_EXPIRED', 400, 'Claim code has expired');
  }

  if (provider.claimCode !== code) {
    throw new AppError('BAD_REQUEST', 400, 'Invalid claim code');
  }

  // Clear code (single use)
  await prisma.unclaimedProvider.update({
    where: { id: unclaimedProviderId },
    data: { claimCode: null, claimCodeSentAt: null, claimCodeExpiresAt: null },
  });

  // Generate claim token
  const claimToken = jwt.sign(
    { unclaimedProviderId, type: 'claim' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' },
  );

  return { claimToken };
}

// ---------------------------------------------------------------------------
// Complete claim — create user + convert services
// ---------------------------------------------------------------------------

interface CompleteClaimData {
  claimToken: string;
  password: string;
  name?: string;
  phone?: string;
}

export async function completeClaim(data: CompleteClaimData) {
  // Decode and verify claim token
  let payload: any;
  try {
    payload = jwt.verify(data.claimToken, process.env.JWT_SECRET!);
  } catch {
    throw new AppError('UNAUTHORIZED', 401, 'Invalid or expired claim token');
  }

  if (payload.type !== 'claim' || !payload.unclaimedProviderId) {
    throw new AppError('UNAUTHORIZED', 401, 'Invalid claim token');
  }

  const provider = await prisma.unclaimedProvider.findFirst({
    where: { id: payload.unclaimedProviderId, isClaimed: false },
    include: { services: true },
  });

  if (!provider) {
    throw new AppError('NOT_FOUND', 404, 'Provider not found or already claimed');
  }

  if (!provider.email) {
    throw new AppError('BAD_REQUEST', 400, 'Provider has no email on file');
  }

  // Check for existing user with this email
  const existingUser = await prisma.user.findUnique({ where: { email: provider.email } });
  if (existingUser) {
    throw new AppError('EMAIL_EXISTS', 409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  // Transaction: create user + convert services + mark claimed
  const result = await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        email: provider.email!,
        passwordHash,
        name: data.name || provider.contactName || provider.businessName,
        role: 'PROVIDER',
        phone: data.phone || provider.phone,
        parish: provider.parish,
        bio: provider.description,
        isEmailVerified: true, // They proved email ownership during claim
        isActive: true,
      },
      select: {
        id: true, email: true, name: true, role: true, phone: true,
        parish: true, bio: true, isEmailVerified: true, createdAt: true,
      },
    });

    // Convert unclaimed services to real services
    let servicesCreated = 0;
    for (const svc of provider.services) {
      await tx.service.create({
        data: {
          title: svc.title,
          description: svc.description || '',
          providerId: user.id,
          categoryId: svc.categoryId || provider.categoryId || '',
          priceMin: svc.priceMin || 0,
          priceMax: svc.priceMax,
          priceCurrency: 'JMD',
          priceUnit: 'per_service',
          parish: svc.parish || provider.parish,
          tags: svc.tags,
          isActive: true,
        },
      });
      servicesCreated++;
    }

    // Mark provider as claimed
    await tx.unclaimedProvider.update({
      where: { id: provider.id },
      data: {
        isClaimed: true,
        claimedByUserId: user.id,
        claimedAt: new Date(),
      },
    });

    return { user, servicesCreated };
  });

  // Generate auth tokens
  const accessToken = signAccessToken(result.user.id, result.user.role);
  const refreshTokenValue = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId: result.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: result.user,
    accessToken,
    refreshToken: refreshTokenValue,
    servicesCreated: result.servicesCreated,
  };
}

// ---------------------------------------------------------------------------
// Claim stats (admin)
// ---------------------------------------------------------------------------

export async function getClaimStats() {
  const [totalUnclaimed, totalClaimed] = await Promise.all([
    prisma.unclaimedProvider.count({ where: { isClaimed: false } }),
    prisma.unclaimedProvider.count({ where: { isClaimed: true } }),
  ]);

  const total = totalUnclaimed + totalClaimed;
  const claimRate = total > 0 ? ((totalClaimed / total) * 100).toFixed(1) : '0';

  const recentClaims = await prisma.unclaimedProvider.findMany({
    where: { isClaimed: true },
    orderBy: { claimedAt: 'desc' },
    take: 10,
    select: {
      id: true,
      businessName: true,
      parish: true,
      category: true,
      claimedAt: true,
    },
  });

  return { totalUnclaimed, totalClaimed, claimRate: `${claimRate}%`, recentClaims };
}

// ---------------------------------------------------------------------------
// Bulk import (admin)
// ---------------------------------------------------------------------------

interface ImportEntry {
  businessName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  category: string;
  parish: string;
  address?: string;
  description?: string;
  sourceUrl?: string;
  sourcePlatform?: string;
  imageUrl?: string;
  services?: Array<{
    title: string;
    description?: string;
    priceMin?: number;
    priceMax?: number;
    parish?: string;
  }>;
}

export async function bulkImport(entries: ImportEntry[]) {
  // Build category lookup
  const categories = await prisma.category.findMany({ select: { id: true, name: true } });
  const catMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));

  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    try {
      const categoryId = catMap.get(entry.category.toLowerCase()) || null;

      const provider = await prisma.unclaimedProvider.create({
        data: {
          businessName: entry.businessName,
          contactName: entry.contactName,
          email: entry.email,
          phone: entry.phone,
          category: entry.category,
          categoryId,
          parish: entry.parish,
          address: entry.address,
          description: entry.description,
          sourceUrl: entry.sourceUrl,
          sourcePlatform: entry.sourcePlatform,
          imageUrl: entry.imageUrl,
        },
      });

      if (entry.services?.length) {
        await prisma.unclaimedService.createMany({
          data: entry.services.map((s) => ({
            unclaimedProviderId: provider.id,
            title: s.title,
            description: s.description,
            priceMin: s.priceMin,
            priceMax: s.priceMax,
            categoryId,
            parish: s.parish || entry.parish,
            tags: [],
          })),
        });
      }

      imported++;
    } catch (err: any) {
      failed++;
      errors.push(`[${i}] ${entry.businessName}: ${err.message}`);
    }
  }

  return { imported, failed, errors };
}
