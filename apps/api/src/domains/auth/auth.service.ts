import { prisma } from '@jobsy/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { RegisterInput, LoginInput } from '@jobsy/shared';
import { AppError } from '../../middleware/error-handler';

const BCRYPT_ROUNDS = 12;

const ACCESS_EXPIRY_MINUTES = parseInt(
  process.env.JWT_ACCESS_EXPIRY_MINUTES ?? '15',
  10,
);
const REFRESH_EXPIRY_DAYS = parseInt(
  process.env.JWT_REFRESH_EXPIRY_DAYS ?? '7',
  10,
);

function signAccessToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
    expiresIn: `${ACCESS_EXPIRY_MINUTES}m`,
  });
}

function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

/** Fields to exclude from user responses. */
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

export async function registerUser(data: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new AppError('EMAIL_EXISTS', 409, 'A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role,
      phone: data.phone,
    },
    select: userSelectWithoutPassword,
  });

  // Generate a 6-digit email verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      code,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  // Generate tokens so the user is immediately logged in
  const accessToken = signAccessToken(user.id, user.role);
  const refreshTokenValue = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  return { user, accessToken, refreshToken: refreshTokenValue };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', 401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new AppError('FORBIDDEN', 403, 'Account is deactivated');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError('INVALID_CREDENTIALS', 401, 'Invalid email or password');
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshTokenValue = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  // Return user without passwordHash
  const { passwordHash: _, ...safeUser } = user;

  return { user: safeUser, accessToken, refreshToken: refreshTokenValue };
}

export async function refreshAccessToken(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!stored) {
    throw new AppError('UNAUTHORIZED', 401, 'Invalid refresh token');
  }

  if (stored.expiresAt < new Date()) {
    // Clean up expired token
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw new AppError('TOKEN_EXPIRED', 401, 'Refresh token has expired');
  }

  const accessToken = signAccessToken(stored.userId, stored.user.role);
  return { accessToken };
}

export async function logoutUser(userId: string, refreshToken?: string) {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken, userId },
    });
  } else {
    // If no token provided, revoke all sessions for this user
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Return silently to prevent email enumeration
    return { message: 'If an account with that email exists, a reset link has been sent' };
  }

  const token = crypto.randomUUID();
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  // TODO: In production, send email with reset link containing the token
  return { message: 'If an account with that email exists, a reset link has been sent', token };
}

export async function resetPassword(token: string, newPassword: string) {
  const reset = await prisma.passwordReset.findUnique({ where: { token } });

  if (!reset || reset.used || reset.expiresAt < new Date()) {
    throw new AppError('UNAUTHORIZED', 400, 'Invalid or expired reset token');
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash },
    }),
    prisma.passwordReset.update({
      where: { id: reset.id },
      data: { used: true },
    }),
    // Revoke all refresh tokens on password change
    prisma.refreshToken.deleteMany({ where: { userId: reset.userId } }),
  ]);

  return { message: 'Password has been reset successfully' };
}

export async function verifyEmail(userId: string, code: string) {
  const verification = await prisma.emailVerification.findFirst({
    where: { userId, code },
    orderBy: { createdAt: 'desc' },
  });

  if (!verification) {
    throw new AppError('UNAUTHORIZED', 400, 'Invalid verification code');
  }

  if (verification.expiresAt < new Date()) {
    throw new AppError('TOKEN_EXPIRED', 400, 'Verification code has expired');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    }),
    prisma.emailVerification.delete({ where: { id: verification.id } }),
  ]);

  return { message: 'Email verified successfully' };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelectWithoutPassword,
  });

  if (!user) {
    throw new AppError('NOT_FOUND', 404, 'User not found');
  }

  return user;
}
