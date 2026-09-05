import { SignJWT } from 'jose';
import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import app from '../../app.js';
import { AppError } from '../../shared/errors/AppError.js';

import * as authService from './auth.service.js';

// Mock auth service to test controller, routing, validation, and cookie emission
vi.mock('./auth.service.js', () => ({
  signup: vi.fn(),
  signin: vi.fn(),
  getMe: vi.fn(),
}));

describe('Auth API (/api/auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long-key';
  });

  /* -------------------------------------------------------------------------- */
  /*                               /signup Tests                                */
  /* -------------------------------------------------------------------------- */
  describe('POST /api/auth/signup', () => {
    const validSignupPayload = {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'securePassword123!',
      confirmPassword: 'securePassword123!',
    };

    describe('Validation', () => {
      it('should return 400 if fullName is missing or too short', async () => {
        const res = await request(app)
          .post('/api/auth/signup')
          .send({ ...validSignupPayload, fullName: ' ' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation Error');
        expect(res.body.details.properties.fullName).toBeDefined();
      });

      it('should return 400 if email format is invalid', async () => {
        const res = await request(app)
          .post('/api/auth/signup')
          .send({ ...validSignupPayload, email: 'not-an-email' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation Error');
        expect(res.body.details.properties.email).toBeDefined();
      });

      it('should return 400 if password is too short (<8 chars)', async () => {
        const res = await request(app)
          .post('/api/auth/signup')
          .send({ ...validSignupPayload, password: 'short', confirmPassword: 'short' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation Error');
        expect(res.body.details.properties.password).toBeDefined();
      });

      it('should return 400 if passwords do not match', async () => {
        const res = await request(app)
          .post('/api/auth/signup')
          .send({ ...validSignupPayload, confirmPassword: 'mismatchPassword!' });

        expect(res.status).toBe(400);
        expect(res.body.details.properties.confirmPassword).toBeDefined();
      });
    });

    describe('Business Logic', () => {
      it('should return 201 and sanitized user object on success', async () => {
        const mockUserResponse = {
          user: {
            userId: 1,
            fullName: 'Jane Doe',
            email: 'jane@example.com',
            roles: ['customer'] as ('customer' | 'vendor' | 'admin')[],
            emailVerifiedAt: null,
          },
        };

        vi.mocked(authService.signup).mockResolvedValueOnce(mockUserResponse);

        const res = await request(app).post('/api/auth/signup').send(validSignupPayload);

        expect(res.status).toBe(201);
        expect(res.body).toEqual(mockUserResponse);
        expect(res.body.user).not.toHaveProperty('passwordHash');
      });

      it('should return 409 if email already exists', async () => {
        vi.mocked(authService.signup).mockRejectedValueOnce(
          new AppError(409, 'EMAIL_IN_USE', 'An account with this email already exists'),
        );

        const res = await request(app).post('/api/auth/signup').send(validSignupPayload);

        expect(res.status).toBe(409);
        expect(res.body.code).toBe('EMAIL_IN_USE');
      });
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                               /signin Tests                                */
  /* -------------------------------------------------------------------------- */
  describe('POST /api/auth/signin', () => {
    const validSigninPayload = {
      email: 'jane@example.com',
      password: 'securePassword123!',
    };

    describe('Validation', () => {
      it('should return 400 if email is invalid', async () => {
        const res = await request(app)
          .post('/api/auth/signin')
          .send({ email: 'bad-email', password: 'password123' });

        expect(res.status).toBe(400);
        expect(res.body.details.properties.email).toBeDefined();
      });

      it('should return 400 if password is empty', async () => {
        const res = await request(app)
          .post('/api/auth/signin')
          .send({ email: 'jane@example.com', password: '' });

        expect(res.status).toBe(400);
        expect(res.body.details.properties.password).toBeDefined();
      });
    });

    describe('Business Logic & Security', () => {
      it('should return 200, set HttpOnly cookie, and return user DTO on success', async () => {
        const mockAuthResult = {
          token: 'mock.jwt.token',
          user: {
            userId: 1,
            fullName: 'Jane Doe',
            email: 'jane@example.com',
            roles: ['customer'] as ('customer' | 'vendor' | 'admin')[],
            emailVerifiedAt: null,
          },
        };

        vi.mocked(authService.signin).mockResolvedValueOnce(mockAuthResult);

        const res = await request(app).post('/api/auth/signin').send(validSigninPayload);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ user: mockAuthResult.user });
        expect(res.body.user).not.toHaveProperty('passwordHash');

        // Verify Set-Cookie header attributes
        const rawCookies = res.headers['set-cookie'] as unknown as string[] | string | undefined;
        const cookies = Array.isArray(rawCookies) ? rawCookies : rawCookies ? [rawCookies] : [];
        expect(cookies.length).toBeGreaterThan(0);
        const authCookie = cookies.find((c: string) => c.startsWith('auth_token='));
        expect(authCookie).toBeDefined();
        expect(authCookie).toContain('HttpOnly');
        expect(authCookie).toContain('Path=/');
        expect(authCookie).toContain('SameSite=Lax');
      });

      it('should return 401 on invalid credentials', async () => {
        const invalidSignInPayload = {
          email: 'ivalid@mail.com',
          password: 'not-a-password',
        };
        vi.mocked(authService.signin).mockRejectedValueOnce(
          new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.'),
        );

        const res = await request(app).post('/api/auth/signin').send(invalidSignInPayload);

        expect(res.status).toBe(401);
        expect(res.body.code).toBe('INVALID_CREDENTIALS');
      });

      it('should return 500 when an unexpected internal error occurs', async () => {
        vi.mocked(authService.signin).mockRejectedValueOnce(new Error('DB failure'));

        const res = await request(app).post('/api/auth/signin').send(validSigninPayload);

        expect(res.status).toBe(500);
      });
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                 /me Tests                                  */
  /* -------------------------------------------------------------------------- */
  describe('GET /api/auth/me', () => {
    const mockUserResponse = {
      user: {
        userId: 1,
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        roles: ['customer'] as ('customer' | 'vendor' | 'admin')[],
        emailVerifiedAt: null,
      },
    };

    it('should return 401 if auth_token cookie is missing', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_TOKEN_MISSING');
    });

    it('should return 200 and user profile when valid auth token is provided in cookie', async () => {
      const secret = process.env.JWT_SECRET || 'test-secret';
      const token = await new SignJWT({})
        .setProtectedHeader({ alg: 'HS512' })
        .setSubject('1')
        .setIssuer('perigee-api')
        .setAudience('perigee-web-app')
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(new TextEncoder().encode(secret));

      vi.mocked(authService.getMe).mockResolvedValueOnce(mockUserResponse);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`auth_token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUserResponse);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                              /signout Tests                                */
  /* -------------------------------------------------------------------------- */
  describe('POST /api/auth/signout', () => {
    it('should return 200 and clear the auth_token cookie', async () => {
      const res = await request(app).post('/api/auth/signout');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Signed out successfully' });

      const rawCookies = res.headers['set-cookie'] as unknown as string[] | string | undefined;
      const cookies = Array.isArray(rawCookies) ? rawCookies : rawCookies ? [rawCookies] : [];
      const authCookie = cookies.find((c: string) => c.startsWith('auth_token='));
      expect(authCookie).toBeDefined();
    });
  });
});
