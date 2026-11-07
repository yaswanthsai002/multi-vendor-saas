import { randomUUID } from 'node:crypto';

import { SignJWT } from 'jose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../../app.js';

import * as service from './wishlist.service.js';

vi.mock('./wishlist.service.js', () => ({
  getWishlist: vi.fn(),
  addWishlistItem: vi.fn(),
  removeWishlistItem: vi.fn(),
}));

const secret = 'test-secret-at-least-32-characters-long-key';

async function sessionCookie(userId: string) {
  const token = await new SignJWT()
    .setProtectedHeader({ alg: 'HS512' })
    .setSubject(userId)
    .setIssuer('perigee-api')
    .setAudience('perigee-web-app')
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(secret));
  return `auth_token=${token}`;
}

describe('Wishlist API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = secret;
  });

  it('requires an authenticated session', async () => {
    const response = await request(app).get('/api/wishlist');

    expect(response.status).toBe(401);
    expect(service.getWishlist).not.toHaveBeenCalled();
  });

  it('returns only the wishlist for the authenticated session identity', async () => {
    const userId = randomUUID();
    vi.mocked(service.getWishlist).mockResolvedValue({ items: [] });

    const response = await request(app)
      .get('/api/wishlist')
      .set('Cookie', await sessionCookie(userId));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ items: [] });
    expect(service.getWishlist).toHaveBeenCalledWith(userId);
  });

  it('uses session identity and validates product ID before saving', async () => {
    const userId = randomUUID();
    const productId = randomUUID();
    const cookie = await sessionCookie(userId);

    const invalid = await request(app)
      .post('/api/wishlist/items')
      .set('Cookie', cookie)
      .send({ productId: 'not-a-uuid', userId: randomUUID() });
    expect(invalid.status).toBe(400);
    expect(service.addWishlistItem).not.toHaveBeenCalled();

    const response = await request(app)
      .post('/api/wishlist/items')
      .set('Cookie', cookie)
      .send({ productId, userId: randomUUID() });

    expect(response.status).toBe(204);
    expect(service.addWishlistItem).toHaveBeenCalledWith(userId, productId);
  });

  it('removes only the session owner item', async () => {
    const userId = randomUUID();
    const productId = randomUUID();
    const response = await request(app)
      .delete(`/api/wishlist/items/${productId}`)
      .set('Cookie', await sessionCookie(userId));

    expect(response.status).toBe(204);
    expect(service.removeWishlistItem).toHaveBeenCalledWith(userId, productId);
  });
});
