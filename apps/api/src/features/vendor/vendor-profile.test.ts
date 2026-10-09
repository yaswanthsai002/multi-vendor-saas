import { SignJWT } from 'jose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../../app.js';

import * as vendorService from './vendor.service.js';

import type * as VendorServiceModule from './vendor.service.js';

const { db } = vi.hoisted(() => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
      vendors: {
        findFirst: vi.fn(),
      },
    },
    select: vi.fn(),
    update: vi.fn(),
    transaction: vi.fn(),
  },
}));

vi.mock('@repo/db', () => ({
  getDb: vi.fn(() => db),
}));

vi.mock('./vendor.service.js', async (importOriginal) => {
  const actual = await importOriginal<typeof VendorServiceModule>();
  return {
    ...actual,
    getVendorProfile: vi.fn(),
    updateVendorProfile: vi.fn(),
  };
});

describe('Vendor Profile API Endpoints', () => {
  const validUserId = '11111111-1111-4111-8111-111111111111';
  const validVendorId = '22222222-2222-4222-8222-222222222222';
  let validCookie: string;

  async function createAuthCookie(userId: string) {
    const secret = process.env.JWT_SECRET || 'test-secret-at-least-32-characters-long-key';
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS512' })
      .setSubject(userId)
      .setIssuer('perigee-api')
      .setAudience('perigee-web-app')
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(new TextEncoder().encode(secret));

    return `auth_token=${token}`;
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long-key';

    validCookie = await createAuthCookie(validUserId);

    vi.mocked(db.query.users.findFirst).mockResolvedValue({
      userId: validUserId,
      fullName: 'Vendor Owner',
      email: 'vendor@example.com',
      passwordHash: 'hash',
      emailVerifiedAt: new Date(),
      roles: ['customer', 'vendor'],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    vi.mocked(db.query.vendors.findFirst).mockResolvedValue({
      vendorId: validVendorId,
      userId: validUserId,
      name: 'Acme Store',
      slug: 'acme-store',
      tagline: 'Best store',
      description: 'Handcrafted goods',
      logoUrl: null,
      bannerUrl: null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  });

  describe('GET /api/vendor/profile', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/vendor/profile');
      expect(res.status).toBe(401);
    });

    it('returns 403 when vendor is suspended', async () => {
      vi.mocked(db.query.vendors.findFirst).mockResolvedValueOnce({
        vendorId: validVendorId,
        userId: validUserId,
        status: 'suspended',
      } as any);

      const res = await request(app).get('/api/vendor/profile').set('Cookie', validCookie);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('VENDOR_NOT_ACTIVE');
    });

    it('successfully returns vendor profile with user details', async () => {
      const mockProfile = {
        vendorId: validVendorId,
        name: 'Acme Crafts',
        slug: 'acme-crafts',
        tagline: 'Handmade wonders',
        description: 'Fine handmade ceramics & goods',
        logoUrl: 'https://example.com/logo.png',
        bannerUrl: 'https://example.com/banner.png',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
        user: {
          userId: validUserId,
          fullName: 'Jane Doe',
          email: 'vendor@example.com',
          roles: ['vendor'],
          emailVerifiedAt: '2026-01-01T00:00:00.000Z',
        },
      };

      vi.mocked(vendorService.getVendorProfile).mockResolvedValueOnce(mockProfile as any);

      const res = await request(app).get('/api/vendor/profile').set('Cookie', validCookie);

      expect(res.status).toBe(200);
      expect(res.body.profile).toEqual(mockProfile);
      expect(vendorService.getVendorProfile).toHaveBeenCalledWith(validVendorId);
    });
  });

  describe('PATCH /api/vendor/profile', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app).patch('/api/vendor/profile').send({ name: 'New Name' });

      expect(res.status).toBe(401);
    });

    it('returns 400 when body is empty', async () => {
      const res = await request(app)
        .patch('/api/vendor/profile')
        .set('Cookie', validCookie)
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 400 when invalid logoUrl is provided', async () => {
      const res = await request(app)
        .patch('/api/vendor/profile')
        .set('Cookie', validCookie)
        .send({ logoUrl: 'not-a-valid-url' });

      expect(res.status).toBe(400);
    });

    it('successfully updates profile fields', async () => {
      const updatedProfile = {
        vendorId: validVendorId,
        name: 'Acme Crafts Studio',
        slug: 'acme-crafts',
        tagline: 'Quality goods',
        description: 'Updated store description',
        logoUrl: 'https://example.com/new-logo.png',
        bannerUrl: 'https://example.com/new-banner.png',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
        user: {
          userId: validUserId,
          fullName: 'Jane Smith',
          email: 'vendor@example.com',
          roles: ['vendor'],
          emailVerifiedAt: '2026-01-01T00:00:00.000Z',
        },
      };

      vi.mocked(vendorService.updateVendorProfile).mockResolvedValueOnce(updatedProfile as any);

      const res = await request(app).patch('/api/vendor/profile').set('Cookie', validCookie).send({
        name: 'Acme Crafts Studio',
        tagline: 'Quality goods',
        description: 'Updated store description',
        logoUrl: 'https://example.com/new-logo.png',
        bannerUrl: 'https://example.com/new-banner.png',
        fullName: 'Jane Smith',
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Profile updated successfully.');
      expect(res.body.profile).toEqual(updatedProfile);
      expect(vendorService.updateVendorProfile).toHaveBeenCalledWith(validVendorId, {
        name: 'Acme Crafts Studio',
        tagline: 'Quality goods',
        description: 'Updated store description',
        logoUrl: 'https://example.com/new-logo.png',
        bannerUrl: 'https://example.com/new-banner.png',
        fullName: 'Jane Smith',
      });
    });
  });
});
