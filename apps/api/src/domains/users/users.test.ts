import { describe, it } from 'vitest';

describe('Users Domain', () => {
  describe('GET /users/profile', () => {
    it.todo('should return the authenticated user profile without passwordHash');
    it.todo('should return 401 if not authenticated');
  });

  describe('PATCH /users/profile', () => {
    it.todo('should update user profile fields');
    it.todo('should return 400 for invalid data');
    it.todo('should return 401 if not authenticated');
  });

  describe('GET /users/:id', () => {
    it.todo('should return public profile without sensitive fields');
    it.todo('should return 404 for non-existent user');
  });

  describe('GET /users/:id/services', () => {
    it.todo('should return paginated services with images and category');
    it.todo('should only return active, non-deleted services');
    it.todo('should default to page 1 and limit 10');
  });

  describe('GET /users/:id/reviews', () => {
    it.todo('should return paginated reviews with author info');
    it.todo('should not return hidden reviews');
  });

  describe('PATCH /users/avatar', () => {
    it.todo('should update avatar URL');
    it.todo('should return 400 if avatarUrl is missing');
    it.todo('should return 401 if not authenticated');
  });

  describe('PATCH /users/settings', () => {
    it.todo('should update allowed settings fields');
    it.todo('should ignore non-whitelisted fields');
    it.todo('should return 401 if not authenticated');
  });

  describe('POST /users/provider-verification', () => {
    it.todo('should submit verification documents for a provider');
    it.todo('should return 403 for non-provider roles');
    it.todo('should return 400 if documents array is empty');
    it.todo('should return 401 if not authenticated');
  });

  describe('GET /users/dashboard', () => {
    it.todo('should return provider dashboard with service count, booking stats, earnings');
    it.todo('should return customer dashboard with booking count, reviews given');
    it.todo('should return 401 if not authenticated');
  });
});
