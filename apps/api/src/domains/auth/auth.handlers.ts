import { Request, Response } from 'express';
import * as authService from './auth.service';

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_EXPIRY_DAYS = parseInt(process.env.JWT_REFRESH_EXPIRY_DAYS ?? '7', 10);

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.registerUser(req.validated);
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    throw error;
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.validated;
    const result = await authService.loginUser(email, password);
    setRefreshCookie(res, result.refreshToken);
    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    throw error;
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No refresh token provided' },
      });
      return;
    }

    const result = await authService.refreshAccessToken(refreshToken);
    res.json({
      success: true,
      data: { accessToken: result.accessToken },
    });
  } catch (error) {
    throw error;
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    await authService.logoutUser(req.user!.userId, refreshToken);
    clearRefreshCookie(res);
    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (error) {
    throw error;
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.json({
      success: true,
      data: { message: result.message },
    });
  } catch (error) {
    throw error;
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.json({
      success: true,
      data: { message: result.message },
    });
  } catch (error) {
    throw error;
  }
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  try {
    const { userId, code } = req.body;
    const result = await authService.verifyEmail(userId, code);
    res.json({
      success: true,
      data: { message: result.message },
    });
  } catch (error) {
    throw error;
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const user = await authService.getCurrentUser(req.user!.userId);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    throw error;
  }
}

export async function sendVerificationEmail(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.sendVerificationEmailCode(req.user!.userId);
    res.json({ success: true, data: { message: result.message } });
  } catch (error) {
    throw error;
  }
}

export async function getVerificationStatus(req: Request, res: Response): Promise<void> {
  try {
    const status = await authService.getVerificationStatus(req.user!.userId);
    res.json({ success: true, data: status });
  } catch (error) {
    throw error;
  }
}
