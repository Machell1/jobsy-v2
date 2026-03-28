"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.refreshAccessToken = refreshAccessToken;
exports.logoutUser = logoutUser;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.verifyEmail = verifyEmail;
exports.getCurrentUser = getCurrentUser;
exports.sendVerificationEmailCode = sendVerificationEmailCode;
exports.getVerificationStatus = getVerificationStatus;
const database_1 = require("@jobsy/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("../../lib/email");
const error_handler_1 = require("../../middleware/error-handler");
const BCRYPT_ROUNDS = 12;
const ACCESS_EXPIRY_MINUTES = parseInt(process.env.JWT_ACCESS_EXPIRY_MINUTES ?? '15', 10);
const REFRESH_EXPIRY_DAYS = parseInt(process.env.JWT_REFRESH_EXPIRY_DAYS ?? '7', 10);
function signAccessToken(userId, role) {
    return jsonwebtoken_1.default.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: `${ACCESS_EXPIRY_MINUTES}m`,
    });
}
function generateRefreshToken() {
    return crypto_1.default.randomBytes(48).toString('hex');
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
async function registerUser(data) {
    const existing = await database_1.prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existing) {
        throw new error_handler_1.AppError('EMAIL_EXISTS', 409, 'A user with this email already exists');
    }
    const passwordHash = await bcryptjs_1.default.hash(data.password, BCRYPT_ROUNDS);
    const user = await database_1.prisma.user.create({
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
    await database_1.prisma.emailVerification.create({
        data: {
            userId: user.id,
            code,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
    });
    // Generate tokens so the user is immediately logged in
    const accessToken = signAccessToken(user.id, user.role);
    const refreshTokenValue = generateRefreshToken();
    await database_1.prisma.refreshToken.create({
        data: {
            token: refreshTokenValue,
            userId: user.id,
            expiresAt: new Date(Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
        },
    });
    return { user, accessToken, refreshToken: refreshTokenValue };
}
async function loginUser(email, password) {
    const user = await database_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new error_handler_1.AppError('INVALID_CREDENTIALS', 401, 'Invalid email or password');
    }
    if (!user.isActive) {
        throw new error_handler_1.AppError('FORBIDDEN', 403, 'Account is deactivated');
    }
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid) {
        throw new error_handler_1.AppError('INVALID_CREDENTIALS', 401, 'Invalid email or password');
    }
    const accessToken = signAccessToken(user.id, user.role);
    const refreshTokenValue = generateRefreshToken();
    await database_1.prisma.refreshToken.create({
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
async function refreshAccessToken(refreshToken) {
    const stored = await database_1.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
    });
    if (!stored) {
        throw new error_handler_1.AppError('UNAUTHORIZED', 401, 'Invalid refresh token');
    }
    if (stored.expiresAt < new Date()) {
        // Clean up expired token
        await database_1.prisma.refreshToken.delete({ where: { id: stored.id } });
        throw new error_handler_1.AppError('TOKEN_EXPIRED', 401, 'Refresh token has expired');
    }
    const accessToken = signAccessToken(stored.userId, stored.user.role);
    return { accessToken };
}
async function logoutUser(userId, refreshToken) {
    if (refreshToken) {
        await database_1.prisma.refreshToken.deleteMany({
            where: { token: refreshToken, userId },
        });
    }
    else {
        // If no token provided, revoke all sessions for this user
        await database_1.prisma.refreshToken.deleteMany({ where: { userId } });
    }
}
async function forgotPassword(email) {
    const user = await database_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        // Return silently to prevent email enumeration
        return { message: 'If an account with that email exists, a reset link has been sent' };
    }
    const token = crypto_1.default.randomUUID();
    await database_1.prisma.passwordReset.create({
        data: {
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
    });
    // TODO: In production, send email with reset link containing the token
    return { message: 'If an account with that email exists, a reset link has been sent', token };
}
async function resetPassword(token, newPassword) {
    const reset = await database_1.prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.used || reset.expiresAt < new Date()) {
        throw new error_handler_1.AppError('UNAUTHORIZED', 400, 'Invalid or expired reset token');
    }
    const passwordHash = await bcryptjs_1.default.hash(newPassword, BCRYPT_ROUNDS);
    await database_1.prisma.$transaction([
        database_1.prisma.user.update({
            where: { id: reset.userId },
            data: { passwordHash },
        }),
        database_1.prisma.passwordReset.update({
            where: { id: reset.id },
            data: { used: true },
        }),
        // Revoke all refresh tokens on password change
        database_1.prisma.refreshToken.deleteMany({ where: { userId: reset.userId } }),
    ]);
    return { message: 'Password has been reset successfully' };
}
async function verifyEmail(userId, code) {
    const verification = await database_1.prisma.emailVerification.findFirst({
        where: { userId, code },
        orderBy: { createdAt: 'desc' },
    });
    if (!verification) {
        throw new error_handler_1.AppError('UNAUTHORIZED', 400, 'Invalid verification code');
    }
    if (verification.expiresAt < new Date()) {
        throw new error_handler_1.AppError('TOKEN_EXPIRED', 400, 'Verification code has expired');
    }
    await database_1.prisma.$transaction([
        database_1.prisma.user.update({
            where: { id: userId },
            data: { isEmailVerified: true },
        }),
        database_1.prisma.emailVerification.delete({ where: { id: verification.id } }),
    ]);
    return { message: 'Email verified successfully' };
}
async function getCurrentUser(userId) {
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        select: userSelectWithoutPassword,
    });
    if (!user) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'User not found');
    }
    return user;
}
async function sendVerificationEmailCode(userId) {
    const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'User not found');
    if (user.isEmailVerified) {
        return { message: 'Email is already verified' };
    }
    // Check rate limit: max 3 per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await database_1.prisma.emailVerification.count({
        where: { userId, createdAt: { gte: oneHourAgo } },
    });
    if (recentCount >= 3) {
        throw new error_handler_1.AppError('TOO_MANY_REQUESTS', 429, 'Too many verification emails. Try again later.');
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await database_1.prisma.emailVerification.create({
        data: {
            userId,
            code,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
    });
    try {
        await (0, email_1.sendVerificationEmail)(user.email, code);
    }
    catch {
        console.error('[auth] Failed to send verification email');
    }
    return { message: 'Verification email sent' };
}
async function getVerificationStatus(userId) {
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        select: { isEmailVerified: true, verifiedPhone: true },
    });
    if (!user)
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'User not found');
    return {
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.verifiedPhone,
        isFullyVerified: user.isEmailVerified && user.verifiedPhone,
    };
}
//# sourceMappingURL=auth.service.js.map