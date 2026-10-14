import { randomUUID } from 'node:crypto';

import { SignJWT } from 'jose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../../app.js';

// ponytail: mock @repo/db using vi.hoisted to run cleanly in CI without live PostgreSQL
const { db } = vi.hoisted(() => {
  const createChain = (data: any = []) => {
    const chain: any = {
      where: vi.fn(() => chain),
      orderBy: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      offset: vi.fn(() => chain),
      innerJoin: vi.fn(() => chain),
      leftJoin: vi.fn(() => chain),
      groupBy: vi.fn(() => chain),
      then: (resolve: any, reject?: any) => Promise.resolve(data).then(resolve, reject),
      catch: (reject: any) => Promise.resolve(data).catch(reject),
    };
    return chain;
  };

  const defaultRows = [
    {
      count: 5,
      total: 5,
      approved: 4,
      hidden: 1,
      rejected: 0,
      deals: 2,
      grossVolume: '5000',
      orderId: '00000000-0000-0000-0000-000000000001',
      orderNumber: 'ORD-1001',
      status: 'completed',
      createdAt: new Date(),
      customerName: 'Test Customer',
      userId: '00000000-0000-0000-0000-000000000002',
      fullName: 'Test User',
      email: 'user@test.com',
      roles: ['customer'],
      productId: '00000000-0000-0000-0000-000000000003',
      name: 'Test Product',
      price: '99.99',
      vendorId: '00000000-0000-0000-0000-000000000004',
      vendorName: 'Test Store',
      vendorSlug: 'test-store',
    },
  ];

  return {
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
        orders: {
          findFirst: vi.fn(),
        },
        orderDeliveryAddresses: {
          findFirst: vi.fn(),
        },
      },
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
      })),
      select: vi.fn(() => ({
        from: vi.fn(() => createChain(defaultRows)),
      })),
    },
  };
});

vi.mock('@repo/db', () => ({
  getDb: vi.fn(() => db),
}));

describe('Admin Feature Integration Tests', () => {
  const secret = process.env.JWT_SECRET || 'test-jwt-secret-at-least-32-chars-long';

  let adminToken: string;
  let customerToken: string;
  let adminUserId: string;
  let targetUserId: string;
  let targetVendorId: string;
  let targetProductId: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = secret;

    adminUserId = randomUUID();
    targetUserId = randomUUID();
    targetVendorId = randomUUID();
    targetProductId = randomUUID();

    // Default: requireAdmin middleware resolves an active admin user
    db.query.users.findFirst.mockImplementation(async (query: any) => {
      return {
        userId: adminUserId,
        fullName: 'Test Admin',
        email: `admin-${adminUserId}@test.com`,
        roles: ['admin'],
        status: 'active',
        emailVerifiedAt: new Date(),
      };
    });

    db.query.vendors.findFirst.mockImplementation(async () => {
      return {
        vendorId: targetVendorId,
        userId: targetUserId,
        name: 'Test Store',
        slug: `test-store-${targetVendorId.slice(0, 8)}`,
        status: 'pending',
        isFeatured: false,
        createdAt: new Date(),
      };
    });

    db.query.products.findFirst.mockImplementation(async () => {
      return {
        productId: targetProductId,
        vendorId: targetVendorId,
        name: 'Test Product',
        slug: `test-prod-${targetProductId.slice(0, 8)}`,
        description: 'Test product description',
        price: '99.99',
        stock: 10,
        published: true,
        moderationStatus: 'approved',
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    db.insert.mockImplementation(() => ({
      values: vi.fn((vals: any) => ({
        returning: vi.fn(() => {
          const row = Array.isArray(vals) ? vals[0] : vals;
          return Promise.resolve([
            {
              ...row,
              userId: row?.userId || targetUserId,
              vendorId: row?.vendorId || targetVendorId,
              productId: row?.productId || targetProductId,
              status: row?.status || 'active',
              isFeatured: row?.isFeatured || false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);
        }),
      })),
    }));

    db.update.mockImplementation(() => ({
      set: vi.fn((vals: any) => {
        const chain: any = {
          where: vi.fn(() => chain),
          returning: vi.fn(() =>
            Promise.resolve([
              {
                ...vals,
                userId: targetUserId,
                vendorId: targetVendorId,
                productId: targetProductId,
              },
            ]),
          ),
          then: (resolve: any) =>
            Promise.resolve([
              {
                ...vals,
                userId: targetUserId,
                vendorId: targetVendorId,
                productId: targetProductId,
              },
            ]).then(resolve),
        };
        return chain;
      }),
    }));

    // Mint admin token
    adminToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS512' })
      .setSubject(adminUserId)
      .setIssuer('perigee-api')
      .setAudience('perigee-web-app')
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(new TextEncoder().encode(secret));

    // Mint customer token
    customerToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS512' })
      .setSubject(targetUserId)
      .setIssuer('perigee-api')
      .setAudience('perigee-web-app')
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(new TextEncoder().encode(secret));
  });

  describe('Authorization Gate', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/admin/dashboard/metrics');
      expect(res.status).toBe(401);
    });

    it('rejects non-admin users with 403', async () => {
      // Mock user lookup to return customer role
      db.query.users.findFirst.mockResolvedValueOnce({
        userId: targetUserId,
        roles: ['customer'],
        status: 'active',
      });

      const res = await request(app)
        .get('/api/admin/dashboard/metrics')
        .set('Cookie', [`auth_token=${customerToken}`]);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    it('allows admin users with 200', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/metrics')
        .set('Cookie', [`auth_token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.kpi).toBeDefined();
      expect(res.body.needsAttention).toBeDefined();
    });
  });

  describe('User Management', () => {
    it('lists users and filters by role', async () => {
      const res = await request(app)
        .get('/api/admin/users?role=customer')
        .set('Cookie', [`auth_token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.users).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
    });

    it('suspends a user with valid reason', async () => {
      // 1. requireAdmin passes
      db.query.users.findFirst
        .mockResolvedValueOnce({
          userId: adminUserId,
          roles: ['admin'],
          status: 'active',
        })
        // 2. updateUserStatus looks up target user
        .mockResolvedValueOnce({
          userId: targetUserId,
          roles: ['customer'],
          status: 'active',
        });

      const res = await request(app)
        .patch(`/api/admin/users/${targetUserId}/status`)
        .set('Cookie', [`auth_token=${adminToken}`])
        .send({
          status: 'suspended',
          reason: 'Suspicious fraud activity',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('suspended');

      // 3. Verify user cannot get profile when suspended
      db.query.users.findFirst.mockResolvedValueOnce({
        userId: targetUserId,
        fullName: 'Target Customer',
        email: `customer-${targetUserId}@test.com`,
        roles: ['customer'],
        status: 'suspended',
        suspensionReason: 'Suspicious fraud activity',
      });

      const profileRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`auth_token=${customerToken}`]);

      expect(profileRes.status).toBe(403);
      expect(profileRes.body.code).toBe('ACCOUNT_SUSPENDED');
    });

    it('rejects user suspension without a reason', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${targetUserId}/status`)
        .set('Cookie', [`auth_token=${adminToken}`])
        .send({
          status: 'suspended',
        });

      expect(res.status).toBe(400);
    });

    it('prevents admin from suspending themselves', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${adminUserId}/status`)
        .set('Cookie', [`auth_token=${adminToken}`])
        .send({
          status: 'suspended',
          reason: 'Accidental self-ban',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('CANNOT_SUSPEND_SELF');
    });
  });

  describe('Vendor Management & Onboarding', () => {
    it('onboards a new vendor with a new user (auto-generates slug and sets status active)', async () => {
      const uniqueSuffix = Date.now();

      // 1. requireAdmin
      // 2. check slug uniqueness (vendors.findFirst -> null)
      // 3. check ownerEmail exists (users.findFirst -> null)
      db.query.users.findFirst
        .mockResolvedValueOnce({
          userId: adminUserId,
          roles: ['admin'],
          status: 'active',
        })
        .mockResolvedValueOnce(null);

      db.query.vendors.findFirst.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/admin/vendors')
        .set('Cookie', [`auth_token=${adminToken}`])
        .send({
          name: `Apex Hardware ${uniqueSuffix}`,
          description: 'Premium tools and hardware supplier.',
          ownerEmail: `apex-${uniqueSuffix}@example.com`,
          ownerFullName: 'Apex Merchant',
          isFeatured: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.vendor).toBeDefined();
      expect(res.body.vendor.name).toBe(`Apex Hardware ${uniqueSuffix}`);
      expect(res.body.vendor.slug).toContain(`apex-hardware-${uniqueSuffix}`);
      expect(res.body.vendor.status).toBe('active');
      expect(res.body.vendor.isFeatured).toBe(true);
      expect(res.body.owner.email).toBe(`apex-${uniqueSuffix}@example.com`);
      expect(res.body.isNewUser).toBe(true);
      expect(res.body.temporaryPassword).toBeDefined();
    });

    it('onboards a vendor for an existing user account and upgrades roles', async () => {
      const uniqueSuffix = Date.now() + 1;
      const existingEmail = `customer-${uniqueSuffix}@example.com`;

      // 1. requireAdmin
      // 2. check slug uniqueness -> null
      // 3. check user exists -> existing customer
      // 4. check if user already owns vendor -> null
      db.query.users.findFirst
        .mockResolvedValueOnce({
          userId: adminUserId,
          roles: ['admin'],
          status: 'active',
        })
        .mockResolvedValueOnce({
          userId: targetUserId,
          fullName: 'Existing Customer',
          email: existingEmail,
          roles: ['customer'],
          status: 'active',
        });

      db.query.vendors.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/admin/vendors')
        .set('Cookie', [`auth_token=${adminToken}`])
        .send({
          name: `Customer Store ${uniqueSuffix}`,
          ownerEmail: existingEmail,
        });

      expect(res.status).toBe(201);
      expect(res.body.vendor.name).toBe(`Customer Store ${uniqueSuffix}`);
      expect(res.body.vendor.status).toBe('active');
      expect(res.body.owner.userId).toBe(targetUserId);
      expect(res.body.isNewUser).toBe(false);
      expect(res.body.temporaryPassword).toBeUndefined();
    });

    it('rejects onboarding if the user already owns a vendor store', async () => {
      // 1. requireAdmin
      // 2. slug check -> null
      // 3. user exists -> targetUser
      // 4. vendor check -> already owns a vendor
      db.query.users.findFirst
        .mockResolvedValueOnce({
          userId: adminUserId,
          roles: ['admin'],
          status: 'active',
        })
        .mockResolvedValueOnce({
          userId: targetUserId,
          fullName: 'Vendor Owner',
          email: 'owner@test.com',
          roles: ['vendor'],
          status: 'active',
        });

      db.query.vendors.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({
        vendorId: targetVendorId,
        userId: targetUserId,
        name: 'Existing Store',
      });

      const res = await request(app)
        .post('/api/admin/vendors')
        .set('Cookie', [`auth_token=${adminToken}`])
        .send({
          name: 'Duplicate Store',
          ownerEmail: 'owner@test.com',
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('USER_ALREADY_OWNS_VENDOR');
    });

    it('rejects onboarding with invalid payload', async () => {
      const res = await request(app)
        .post('/api/admin/vendors')
        .set('Cookie', [`auth_token=${adminToken}`])
        .send({
          name: 'A', // too short
          ownerEmail: 'not-an-email',
        });

      expect(res.status).toBe(400);
    });

    it('approves a pending vendor', async () => {
      db.query.vendors.findFirst.mockResolvedValueOnce({
        vendorId: targetVendorId,
        status: 'pending',
      });

      const res = await request(app)
        .patch(`/api/admin/vendors/${targetVendorId}/status`)
        .set('Cookie', [`auth_token=${adminToken}`])
        .send({
          status: 'active',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('active');
    });

    it('toggles featured vendor', async () => {
      db.query.vendors.findFirst.mockResolvedValueOnce({
        vendorId: targetVendorId,
        isFeatured: false,
      });

      const res = await request(app)
        .patch(`/api/admin/vendors/${targetVendorId}/feature`)
        .set('Cookie', [`auth_token=${adminToken}`])
        .send({ isFeatured: true });

      expect(res.status).toBe(200);
      expect(res.body.isFeatured).toBe(true);
    });
  });

  describe('Product Moderation & Merchandising', () => {
    it('moderates a product to hidden', async () => {
      db.query.products.findFirst.mockResolvedValueOnce({
        productId: targetProductId,
        moderationStatus: 'approved',
      });

      const res = await request(app)
        .patch(`/api/admin/products/${targetProductId}/moderation`)
        .set('Cookie', [`auth_token=${adminToken}`])
        .send({
          status: 'hidden',
        });

      expect(res.status).toBe(200);
      expect(res.body.moderationStatus).toBe('hidden');
    });

    it('toggles featured product', async () => {
      db.query.products.findFirst.mockResolvedValueOnce({
        productId: targetProductId,
        isFeatured: false,
      });

      const res = await request(app)
        .patch(`/api/admin/products/${targetProductId}/feature`)
        .set('Cookie', [`auth_token=${adminToken}`])
        .send({ isFeatured: true });

      expect(res.status).toBe(200);
      expect(res.body.isFeatured).toBe(true);
    });

    it('lists products with server-side search, sorting, and overview counts', async () => {
      const res = await request(app)
        .get('/api/admin/products?search=Test&sortBy=name&sortOrder=asc')
        .set('Cookie', [`auth_token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(res.body).toHaveProperty('counts');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.counts.total).toBeGreaterThanOrEqual(1);
      expect(res.body.counts.approved).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Dashboard Analytics & Performance Timeframes', () => {
    it('returns 7-day performance data by default', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/performance')
        .set('Cookie', [`auth_token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(7);
      expect(res.body[0]).toHaveProperty('orders');
      expect(res.body[0]).toHaveProperty('gmv');
    });

    it('returns 30-day performance data when requested', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/performance?days=30')
        .set('Cookie', [`auth_token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(30);
    });

    it('returns 90-day performance data when requested', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/performance?days=90')
        .set('Cookie', [`auth_token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(90);
    });
  });
});
