import { Request, Response } from 'express';
import * as usersService from './users.service';

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = await usersService.getProfile(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (error) {
    throw error;
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = await usersService.updateProfile(req.user!.userId, req.validated);
    res.json({ success: true, data: user });
  } catch (error) {
    throw error;
  }
}

export async function getPublicProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = await usersService.getPublicProfile(req.params.id as string);
    res.json({ success: true, data: user });
  } catch (error) {
    throw error;
  }
}

export async function getUserServices(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await usersService.getUserServices(req.params.id as string, page, limit);
    res.json({ success: true, ...result });
  } catch (error) {
    throw error;
  }
}

export async function getUserReviews(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await usersService.getUserReviews(req.params.id as string, page, limit);
    res.json({ success: true, ...result });
  } catch (error) {
    throw error;
  }
}

export async function updateAvatar(req: Request, res: Response): Promise<void> {
  try {
    const { avatarUrl } = req.body;
    if (!avatarUrl) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'avatarUrl is required' },
      });
      return;
    }
    const user = await usersService.updateAvatar(req.user!.userId, avatarUrl);
    res.json({ success: true, data: user });
  } catch (error) {
    throw error;
  }
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  try {
    const user = await usersService.updateSettings(req.user!.userId, req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    throw error;
  }
}

export async function submitVerification(req: Request, res: Response): Promise<void> {
  try {
    const { documents } = req.body;
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'documents array is required' },
      });
      return;
    }
    const result = await usersService.submitVerification(req.user!.userId, documents);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    throw error;
  }
}

export async function getDashboard(req: Request, res: Response): Promise<void> {
  try {
    const dashboard = await usersService.getDashboard(req.user!.userId, req.user!.role);
    res.json({ success: true, data: dashboard });
  } catch (error) {
    throw error;
  }
}
