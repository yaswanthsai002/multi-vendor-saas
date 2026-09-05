import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import app from '../../app.js';
import { redis } from '../../shared/redis/redis.client.js';

describe('OTP API (/api/auth)', () => {
  const testEmail = 'otp-user@example.com';

  beforeEach(async () => {
    // Clear in-memory Redis state between tests
    await redis.flushall();
  });

  describe('POST /api/auth/send-otp', () => {
    it('should generate and return a 6-character alphanumeric OTP on success', async () => {
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ email: testEmail, purpose: 'email_verification' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('OTP sent successfully');
      expect(res.body.email).toBe(testEmail);
      expect(res.body.expiresIn).toBe(300);
      expect(res.body.resendCooldown).toBe(60);
      expect(res.body.otp).toBeDefined();
      expect(typeof res.body.otp).toBe('string');
      expect(res.body.otp).toHaveLength(6);
      expect(/^[0-9A-Z]{6}$/.test(res.body.otp)).toBe(true);
    });

    it('should reject requests with 429 when resend cooldown is active', async () => {
      // First request succeeds
      const firstRes = await request(app)
        .post('/api/auth/send-otp')
        .send({ email: testEmail, purpose: 'email_verification' });
      expect(firstRes.status).toBe(200);

      // Immediate second request within 60s cooldown window fails
      const secondRes = await request(app)
        .post('/api/auth/send-otp')
        .send({ email: testEmail, purpose: 'email_verification' });

      expect(secondRes.status).toBe(429);
      expect(secondRes.body.code).toBe('RESEND_COOLDOWN');
      expect(secondRes.body.error).toMatch(/Please wait \d+ seconds/);
    });

    it('should return 400 if email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ email: 'invalid-email-format', purpose: 'email_verification' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should successfully verify a valid OTP', async () => {
      // 1. Send OTP
      const sendRes = await request(app)
        .post('/api/auth/send-otp')
        .send({ email: testEmail, purpose: 'email_verification' });

      const otp = sendRes.body.otp;

      // 2. Verify OTP
      const verifyRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: testEmail, otp, purpose: 'email_verification' });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.verified).toBe(true);
      expect(verifyRes.body.message).toBe('OTP verified successfully');
    });

    it('should reject lowercase letters and only accept uppercase alphanumeric OTP', async () => {
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: testEmail, otp: 'abc123', purpose: 'email_verification' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
    });

    it('should prevent replay attacks by deleting the OTP upon successful verification', async () => {
      const sendRes = await request(app)
        .post('/api/auth/send-otp')
        .send({ email: testEmail, purpose: 'email_verification' });

      const otp = sendRes.body.otp;

      // First verification succeeds
      const firstVerify = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: testEmail, otp, purpose: 'email_verification' });
      expect(firstVerify.status).toBe(200);

      // Second verification of the same OTP fails (already consumed)
      const secondVerify = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: testEmail, otp, purpose: 'email_verification' });
      expect(secondVerify.status).toBe(400);
      expect(secondVerify.body.code).toBe('OTP_EXPIRED_OR_INVALID');
    });

    it('should reject an incorrect OTP and report remaining attempts', async () => {
      await request(app)
        .post('/api/auth/send-otp')
        .send({ email: testEmail, purpose: 'email_verification' });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: testEmail, otp: '000000', purpose: 'email_verification' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_OTP');
      expect(res.body.error).toContain('2 attempt(s) remaining');
    });

    it('should lock out and invalidate OTP after 3 failed attempts', async () => {
      const sendRes = await request(app)
        .post('/api/auth/send-otp')
        .send({ email: testEmail, purpose: 'email_verification' });

      const realOtp = sendRes.body.otp;

      // Attempt 1: wrong
      const res1 = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: testEmail, otp: 'WRONG1', purpose: 'email_verification' });
      expect(res1.status).toBe(400);
      expect(res1.body.code).toBe('INVALID_OTP');

      // Attempt 2: wrong
      const res2 = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: testEmail, otp: 'WRONG2', purpose: 'email_verification' });
      expect(res2.status).toBe(400);
      expect(res2.body.code).toBe('INVALID_OTP');

      // Attempt 3: wrong -> locks out and invalidates
      const res3 = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: testEmail, otp: 'WRONG3', purpose: 'email_verification' });
      expect(res3.status).toBe(400);
      expect(res3.body.code).toBe('MAX_ATTEMPTS_EXCEEDED');

      // Attempt 4 with REAL OTP should now fail because it was deleted
      const res4 = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: testEmail, otp: realOtp, purpose: 'email_verification' });
      expect(res4.status).toBe(400);
      expect(res4.body.code).toBe('OTP_EXPIRED_OR_INVALID');
    });

    it('should reject non-existent or expired OTP with 400', async () => {
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: 'nonexistent@example.com', otp: 'ABC123', purpose: 'email_verification' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('OTP_EXPIRED_OR_INVALID');
    });

    it('should reject malformed OTPs (wrong length or non-alphanumeric characters)', async () => {
      // Too short
      const resShort = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: testEmail, otp: '123', purpose: 'email_verification' });
      expect(resShort.status).toBe(400);

      // Contains special characters
      const resSpecial = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: testEmail, otp: 'AB#$12', purpose: 'email_verification' });
      expect(resSpecial.status).toBe(400);
    });
  });
});
