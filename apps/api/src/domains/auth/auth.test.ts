import { describe, it } from 'vitest';

describe('Auth Domain', () => {
  describe('POST /auth/register', () => {
    it.todo('should register a new user and return 201 with user and accessToken');
    it.todo('should return 409 if email already exists');
    it.todo('should return 400 for invalid request body');
    it.todo('should set refreshToken as HttpOnly cookie');
  });

  describe('POST /auth/login', () => {
    it.todo('should login with valid credentials and return user and accessToken');
    it.todo('should return 401 for invalid email');
    it.todo('should return 401 for wrong password');
    it.todo('should return 403 for deactivated account');
    it.todo('should set refreshToken as HttpOnly cookie');
  });

  describe('POST /auth/refresh', () => {
    it.todo('should return new accessToken with valid refresh token cookie');
    it.todo('should return 401 if no refresh token cookie');
    it.todo('should return 401 for expired refresh token');
  });

  describe('POST /auth/logout', () => {
    it.todo('should clear refresh token cookie');
    it.todo('should delete refresh token from database');
    it.todo('should return 401 if not authenticated');
  });

  describe('POST /auth/forgot-password', () => {
    it.todo('should return success message for existing email');
    it.todo('should return success message even for non-existent email');
    it.todo('should create a PasswordReset record with 1hr expiry');
  });

  describe('POST /auth/reset-password', () => {
    it.todo('should reset password with valid token');
    it.todo('should return 400 for invalid token');
    it.todo('should return 400 for expired token');
    it.todo('should return 400 for already-used token');
    it.todo('should revoke all refresh tokens after password reset');
  });

  describe('POST /auth/verify-email', () => {
    it.todo('should verify email with valid code');
    it.todo('should return 400 for invalid code');
    it.todo('should return 400 for expired code');
  });

  describe('GET /auth/me', () => {
    it.todo('should return current user without passwordHash');
    it.todo('should return 401 if not authenticated');
  });
});
