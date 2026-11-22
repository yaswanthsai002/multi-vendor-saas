import cookieParser from 'cookie-parser';
import express from 'express';
import { SignJWT } from 'jose';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { errorHandler } from '../../shared/middleware/errorHandler.js';

import { saveCustomerReviewSchema } from './customer-review.schema.js';
import * as service from './customer-review.service.js';
import { customerRouter } from './customer.routes.js';

const app = express();
app.use(express.json(), cookieParser());
app.use('/api/customer', customerRouter);
app.use(errorHandler);
const userId = '11111111-1111-4111-8111-111111111111';
const orderId = '22222222-2222-4222-8222-222222222222';
const orderItemId = '33333333-3333-4333-8333-333333333333';
const path = `/api/customer/orders/${orderId}/items/${orderItemId}/review`;
const secret = 'review-test-secret-only';
const state = { orderItemId, reviewVersion: 1, canReview: true, review: null };
async function cookie() {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS512' })
    .setSubject(userId)
    .setIssuer('perigee-api')
    .setAudience('perigee-web-app')
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(secret));
  return `auth_token=${token}`;
}
beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubEnv('JWT_SECRET', secret);
});
afterAll(() => vi.unstubAllEnvs());

describe('customer review validation', () => {
  it.each([undefined, null, 0, 6, 1.5, '5'])('rejects invalid stars %s', (rating) => {
    expect(saveCustomerReviewSchema.safeParse({ expectedVersion: 0, rating }).success).toBe(false);
  });
  it.each([-1, 2147483648, 0.5, '0', null])('rejects invalid versions %s', (expectedVersion) => {
    expect(saveCustomerReviewSchema.safeParse({ expectedVersion, rating: 5 }).success).toBe(false);
  });
  it('normalizes outer whitespace and counts Unicode code points', () => {
    const base = { rating: 5, expectedVersion: 0 };
    for (const reviewText of [undefined, null, '', ' \n '])
      expect(saveCustomerReviewSchema.parse({ ...base, reviewText }).reviewText).toBeNull();
    expect(saveCustomerReviewSchema.parse({ ...base, reviewText: '  A\n B  ' }).reviewText).toBe(
      'A\n B',
    );
    expect(
      saveCustomerReviewSchema.parse({ ...base, reviewText: '😀'.repeat(2000) }).reviewText,
    ).toHaveLength(4000);
    for (const reviewText of ['😀'.repeat(2001), '\u0000', '\uD800', '\uDC00'])
      expect(saveCustomerReviewSchema.safeParse({ ...base, reviewText }).success).toBe(false);
    expect(saveCustomerReviewSchema.safeParse({ ...base, userId }).success).toBe(false);
  });
});

describe('customer review HTTP contract', () => {
  it('returns a safe response after an unexpected persistence failure', async () => {
    vi.spyOn(service, 'saveCustomerReview').mockRejectedValue(
      new Error('Internal database failure with private feedback'),
    );
    const result = await request(app)
      .put(path)
      .set('Cookie', await cookie())
      .send({ expectedVersion: 0, rating: 5 });
    expect(result.status).toBe(500);
    expect(JSON.stringify(result.body)).not.toContain('private feedback');
    expect(result.body.code).toBe('REQUEST_FAILED');
  });
  it('requires authentication for both writes', async () => {
    expect((await request(app).put(path).send({})).status).toBe(401);
    expect((await request(app).delete(path).send({})).status).toBe(401);
    expect((await request(app).put(path).set('Cookie', 'auth_token=invalid').send({})).status).toBe(
      401,
    );
  });
  it('uses only session identity and parsed content', async () => {
    const save = vi.spyOn(service, 'saveCustomerReview').mockResolvedValue(state);
    const remove = vi.spyOn(service, 'deleteCustomerReview').mockResolvedValue(state);
    const auth = await cookie();
    expect(
      (
        await request(app)
          .put(path)
          .set('Cookie', auth)
          .send({ expectedVersion: 0, rating: 5, reviewText: ' Hi ' })
      ).body,
    ).toEqual(state);
    expect(save).toHaveBeenCalledWith(userId, orderId, orderItemId, {
      expectedVersion: 0,
      rating: 5,
      reviewText: 'Hi',
    });
    expect(
      (await request(app).delete(path).set('Cookie', auth).send({ expectedVersion: 1 })).body,
    ).toEqual(state);
    expect(remove).toHaveBeenCalledWith(userId, orderId, orderItemId, 1);
  });
  it('rejects malformed paths, missing versions and injected identity', async () => {
    const save = vi.spyOn(service, 'saveCustomerReview');
    const auth = await cookie();
    for (const body of [
      { rating: 5 },
      { rating: 5, expectedVersion: 0, productId: orderId },
      { rating: 5, expectedVersion: 0, userId },
    ])
      expect((await request(app).put(path).set('Cookie', auth).send(body)).status).toBe(400);
    expect(
      (
        await request(app)
          .put(path.replace(orderItemId, 'invalid'))
          .set('Cookie', auth)
          .send({ rating: 5, expectedVersion: 0 })
      ).status,
    ).toBe(400);
    expect(
      (await request(app).delete(path).set('Cookie', auth).send({ expectedVersion: 0, rating: 5 }))
        .status,
    ).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });
});
