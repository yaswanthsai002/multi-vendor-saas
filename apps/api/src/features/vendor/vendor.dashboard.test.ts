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
      products: {
        findFirst: vi.fn(),
      },
      categories: {
        findMany: vi.fn(),
      },
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([])),
          })),
        })),
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
  },
}));

vi.mock('@repo/db', () => ({
  getDb: vi.fn(() => db),
}));

vi.mock('./vendor.service.js', async (importOriginal) => {
  const actual = await importOriginal<typeof VendorServiceModule>();
  return {
    ...actual,
    getVendorDashboardData: vi.fn(),
  };
});

describe('Vendor Dashboard API (/api/vendor/dashboard)', () => {
  const validUserId = '11111111-1111-4111-8111-111111111111';
  const validVendorId = '22222222-2222-4222-8222-222222222222';

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

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long-key';

    vi.mocked(db.query.users.findFirst).mockResolvedValue({
      userId: validUserId,
      fullName: 'Aura Boutique Owner',
      email: 'vendor@aura.com',
      passwordHash: 'hash',
      emailVerifiedAt: new Date(),
      roles: ['customer', 'vendor'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(db.query.vendors.findFirst).mockResolvedValue({
      vendorId: validVendorId,
      userId: validUserId,
      name: 'Aura Boutique',
      slug: 'aura-boutique',
      tagline: 'Distinctive fashion and lifestyle',
      description: 'Handmade luxury clothing and accessories',
      logoUrl: 'https://example.com/aura.png',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('should return 401 when no session cookie is provided', async () => {
    const response = await request(app).get('/api/vendor/dashboard');

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('AUTH_TOKEN_MISSING');
  });

  it('should return 403 when user does not have vendor role', async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue({
      userId: validUserId,
      fullName: 'Regular Customer',
      email: 'customer@example.com',
      passwordHash: 'hash',
      emailVerifiedAt: new Date(),
      roles: ['customer'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const cookie = await createAuthCookie(validUserId);
    const response = await request(app)
      .get('/api/vendor/dashboard')
      .set('Cookie', [cookie]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('VENDOR_ROLE_REQUIRED');
  });

  it('should return 403 when vendor profile is not active', async () => {
    vi.mocked(db.query.vendors.findFirst).mockResolvedValue({
      vendorId: validVendorId,
      userId: validUserId,
      name: 'Pending Store',
      slug: 'pending-store',
      tagline: null,
      description: null,
      logoUrl: null,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const cookie = await createAuthCookie(validUserId);
    const response = await request(app)
      .get('/api/vendor/dashboard')
      .set('Cookie', [cookie]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('VENDOR_NOT_ACTIVE');
  });

  it('should return 400 when an invalid period query parameter is provided', async () => {
    const cookie = await createAuthCookie(validUserId);
    const response = await request(app)
      .get('/api/vendor/dashboard?period=1year')
      .set('Cookie', [cookie]);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation Error');
  });

  it('should return 200 with dashboard data on valid request', async () => {
    const mockDashboardData = {
      vendor: {
        vendorId: validVendorId,
        name: 'Aura Boutique',
        slug: 'aura-boutique',
        logoUrl: 'https://example.com/aura.png',
      },
      metrics: {
        sales: { value: 124500, changePercentage: 12.4 },
        orders: { value: 186, changePercentage: 8.2 },
        unitsSold: { value: 247, changePercentage: 11.7 },
        avgOrderValue: { value: 669, changePercentage: 3.9 },
      },
      chart: [
        { label: 'Mon', date: '2026-09-15', sales: 1200 },
        { label: 'Tue', date: '2026-09-16', sales: 1500 },
        { label: 'Wed', date: '2026-09-17', sales: 1250 },
        { label: 'Thu', date: '2026-09-18', sales: 1600 },
        { label: 'Fri', date: '2026-09-19', sales: 1450 },
        { label: 'Sat', date: '2026-09-20', sales: 1800 },
        { label: 'Sun', date: '2026-09-21', sales: 1400 },
      ],
      recentOrders: [
        {
          vendorOrderId: 'vo-1',
          orderId: 'o-1',
          orderNumber: '#1001',
          itemsCount: 2,
          amount: 2499,
          status: 'pending',
          thumbnailUrl: 'https://example.com/prod1.png',
          createdAt: new Date().toISOString(),
        },
      ],
      topProducts: [
        {
          productId: 'p-1',
          name: 'Sony WH-1000XM5',
          category: 'Electronics · Headphones',
          thumbnailUrl: 'https://example.com/headphones.png',
          unitsSold: 42,
          sales: 84000,
          stock: 8,
        },
      ],
    };

    vi.mocked(vendorService.getVendorDashboardData).mockResolvedValue(mockDashboardData as any);

    const cookie = await createAuthCookie(validUserId);
    const response = await request(app)
      .get('/api/vendor/dashboard?period=7d')
      .set('Cookie', [cookie]);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockDashboardData);
    expect(vendorService.getVendorDashboardData).toHaveBeenCalledWith(validVendorId, {
      period: '7d',
    });
  });
});
