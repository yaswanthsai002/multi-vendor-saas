import { db } from '@repo/db';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../../app.js';
import { redis } from '../../shared/redis/redis.client.js';

// Mock DB queries so tests execute without a live PostgreSQL connection
vi.mock('@repo/db', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ userId: 1 }])),
      })),
    })),
  },
}));

describe('Password Reset Flow (/api/auth)', () => {
  const testEmail = 'user-reset@example.com';

  beforeEach(async () => {
    vi.clearAllMocks();
    await redis.flushall();
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password successfully using a verified OTP resetToken', async () => {
      // 1. Mock existing user in DB
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce({
        userId: 1,
        fullName: 'Jane Doe',
        email: testEmail,
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$oldhash',
        emailVerifiedAt: new Date(),
        roles: ['customer'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 2. Request OTP with purpose "password_reset"
      const sendRes = await request(app)
        .post('/api/auth/send-otp')
        .send({ email: testEmail, purpose: 'password_reset' });

      expect(sendRes.status).toBe(200);
      const otp = sendRes.body.otp;

      // 3. Verify OTP to receive the 24-byte hex resetToken
      const verifyRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: testEmail, otp, purpose: 'password_reset' });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.verified).toBe(true);
      expect(verifyRes.body.resetToken).toBeDefined();
      expect(typeof verifyRes.body.resetToken).toBe('string');
      expect(verifyRes.body.resetToken).toHaveLength(48); // 24 bytes = 48 hex chars

      const resetToken = verifyRes.body.resetToken;

      // 4. Reset password using the received resetToken
      const resetRes = await request(app).post('/api/auth/reset-password').send({
        resetToken,
        newPassword: 'newSecurePassword123!',
        confirmNewPassword: 'newSecurePassword123!',
      });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.message).toBe('Password has been reset successfully.');
      expect(db.update).toHaveBeenCalledTimes(1);

      // 5. Verify token was consumed from Redis (Replay attack prevention)
      const tokenInRedis = await redis.get(`password_reset_token:${resetToken}`);
      expect(tokenInRedis).toBeNull();
    });

    it('should reject replay attacks when using an already consumed resetToken', async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue({
        userId: 1,
        fullName: 'Jane Doe',
        email: testEmail,
        passwordHash: 'hash',
        emailVerifiedAt: new Date(),
        roles: ['customer'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Seed a token directly in Redis
      const resetToken = 'dummy-valid-reset-token-1234567890abcdef';
      await redis.set(`password_reset_token:${resetToken}`, testEmail, 'EX', 600);

      // First reset succeeds
      const res1 = await request(app).post('/api/auth/reset-password').send({
        resetToken,
        newPassword: 'newSecurePassword123!',
        confirmNewPassword: 'newSecurePassword123!',
      });
      expect(res1.status).toBe(200);

      // Second reset attempt with same token fails
      const res2 = await request(app).post('/api/auth/reset-password').send({
        resetToken,
        newPassword: 'anotherPassword123!',
        confirmNewPassword: 'anotherPassword123!',
      });
      expect(res2.status).toBe(400);
      expect(res2.body.code).toBe('INVALID_RESET_TOKEN');
      expect(res2.body.error).toBe('Password reset token is invalid or expired.');
    });

    it('should reject an invalid or non-existent resetToken with 400', async () => {
      const res = await request(app).post('/api/auth/reset-password').send({
        resetToken: 'completely-non-existent-token',
        newPassword: 'newSecurePassword123!',
        confirmNewPassword: 'newSecurePassword123!',
      });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_RESET_TOKEN');
      expect(res.body.error).toBe('Password reset token is invalid or expired.');
    });

    it('should return 400 if user associated with token no longer exists in DB', async () => {
      // Seed a token in Redis for a deleted/non-existent user
      const resetToken = 'valid-token-for-missing-user';
      await redis.set(`password_reset_token:${resetToken}`, 'deleted@example.com', 'EX', 600);

      // DB returns null
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(undefined);

      const res = await request(app).post('/api/auth/reset-password').send({
        resetToken,
        newPassword: 'newSecurePassword123!',
        confirmNewPassword: 'newSecurePassword123!',
      });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_RESET_TOKEN');
      expect(res.body.error).toBe('Unable to reset password for this user.');
    });

    describe('Validation', () => {
      it('should return 400 if resetToken is missing or empty', async () => {
        const res = await request(app).post('/api/auth/reset-password').send({
          resetToken: '',
          newPassword: 'newSecurePassword123!',
          confirmNewPassword: 'newSecurePassword123!',
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation Error');
        expect(res.body.details.properties.resetToken).toBeDefined();
      });

      it('should return 400 if newPassword is too short (< 8 characters)', async () => {
        const res = await request(app).post('/api/auth/reset-password').send({
          resetToken: 'some-token',
          newPassword: 'short',
          confirmNewPassword: 'short',
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation Error');
        expect(res.body.details.properties.newPassword).toBeDefined();
      });

      it('should return 400 if newPassword and confirmNewPassword do not match', async () => {
        const res = await request(app).post('/api/auth/reset-password').send({
          resetToken: 'some-token',
          newPassword: 'passwordOne123!',
          confirmNewPassword: 'passwordTwo123!',
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation Error');
        expect(res.body.details.properties.confirmNewPassword).toBeDefined();
      });
    });
  });
});
