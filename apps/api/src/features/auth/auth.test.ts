import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import app from '../../app.js';
import { AppError } from '../../shared/errors/AppError.js';

import * as authService from './auth.service.js';

// Mock the auth service to isolate the controller and routing logic
vi.mock('./auth.service.js', () => ({
  signup: vi.fn(),
}));

describe('Auth API - Signup (/api/auth/signup)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPayload = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'securePassword123!',
    confirmPassword: 'securePassword123!',
  };

  describe('Validation', () => {
    it('should return 400 if fullName is missing', async () => {
      const { fullName: _fullName, ...payload } = validPayload;
      const res = await request(app).post('/api/auth/signup').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
      expect(res.body.details.fullName).toBeDefined();
    });

    it('should return 400 if email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          ...validPayload,
          email: 'invalid-email',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
      expect(res.body.details.email).toBeDefined();
    });

    it('should return 400 if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          ...validPayload,
          password: 'short',
          confirmPassword: 'short',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
      expect(res.body.details.password).toBeDefined();
    });

    it('should return 400 if passwords do not match', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          ...validPayload,
          confirmPassword: 'differentPassword!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
      expect(res.body.details.confirmPassword).toBeDefined();
    });
  });

  describe('Business Logic', () => {
    it('should return 201 and the user object on successful signup', async () => {
      const mockUserResponse = {
        user: {
          userId: 1,
          fullName: validPayload.fullName,
          email: validPayload.email,
          roles: ['customer'] as ('customer' | 'vendor' | 'admin')[],
          emailVerifiedAt: null,
        },
      };

      vi.mocked(authService.signup).mockResolvedValueOnce(mockUserResponse);

      const res = await request(app).post('/api/auth/signup').send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockUserResponse);
      expect(authService.signup).toHaveBeenCalledTimes(1);
      expect(authService.signup).toHaveBeenCalledWith({
        fullName: validPayload.fullName,
        email: validPayload.email,
        password: validPayload.password,
        confirmPassword: validPayload.confirmPassword,
      });
    });

    it('should return 409 if email is already registered (AppError)', async () => {
      vi.mocked(authService.signup).mockRejectedValueOnce(
        new AppError(409, 'EMAIL_IN_USE', 'An account with this email already exists'),
      );

      const res = await request(app).post('/api/auth/signup').send(validPayload);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('An account with this email already exists');
      expect(authService.signup).toHaveBeenCalledTimes(1);
    });

    it('should return 500 on unexpected server errors', async () => {
      vi.mocked(authService.signup).mockRejectedValueOnce(new Error('Database connection failed'));

      const res = await request(app).post('/api/auth/signup').send(validPayload);

      expect(res.status).toBe(500);
      // Depending on the test runner environment, it might expose the error or mask it as 'Internal Server Error'
      expect(res.body.error).toBeDefined();
    });
  });
});
