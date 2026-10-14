import { randomUUID } from 'node:crypto';

import { getDb } from '@repo/db';
import { products, users, vendors } from '@repo/db/schema';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import app from '../../app.js';

describe('Admin Feature Integration Tests', () => {
  const secret = process.env.JWT_SECRET || 'test-jwt-secret-at-least-32-chars-long';
  const db = getDb();

  let adminToken: string;
  let customerToken: string;
  let adminUserId: string;
  let targetUserId: string;
  let targetVendorId: string;
  let targetProductId: string;

  beforeEach(async () => {
    adminUserId = randomUUID();
    targetUserId = randomUUID();
    targetVendorId = randomUUID();
    targetProductId = randomUUID();

    // 1. Create admin user
    await db.insert(users).values({
      userId: adminUserId,
      fullName: 'Test Admin',
      email: `admin-${adminUserId}@test.com`,
      roles: ['admin'],
      status: 'active',
      emailVerifiedAt: new Date(),
    });

    // 2. Create customer user
    await db.insert(users).values({
      userId: targetUserId,
      fullName: 'Target Customer',
      email: `customer-${targetUserId}@test.com`,
      roles: ['customer'],
      status: 'active',
      emailVerifiedAt: new Date(),
    });

    // 3. Create a pending vendor owned by targetUser
    await db.insert(vendors).values({
      vendorId: targetVendorId,
      userId: targetUserId,
      name: 'Test Store',
      slug: `test-store-${targetVendorId.slice(0, 8)}`,
      status: 'pending',
    });

    // 4. Create a product owned by targetVendor
    await db.insert(products).values({
      productId: targetProductId,
      vendorId: targetVendorId,
      name: 'Test Product',
      slug: `test-prod-${targetProductId.slice(0, 8)}`,
      description: 'Test product description',
      price: '99.99',
      stock: 10,
      published: true,
      moderationStatus: 'approved',
    });

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
      const res = await request(app)
        .patch(`/api/admin/users/${targetUserId}/status`)
        .set('Cookie', [`auth_token=${adminToken}`])
        .send({
          status: 'suspended',
          reason: 'Suspicious fraud activity',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('suspended');

      // Verify user cannot get profile when suspended
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
      // First create a customer user
      const [existingCustomer] = await db
        .insert(users)
        .values({
          fullName: 'Existing Customer',
          email: `customer-${uniqueSuffix}@example.com`,
          roles: ['customer'],
          status: 'active',
        })
        .returning();

      const res = await request(app)
        .post('/api/admin/vendors')
        .set('Cookie', [`auth_token=${adminToken}`])
        .send({
          name: `Customer Store ${uniqueSuffix}`,
          ownerEmail: existingCustomer.email,
        });

      expect(res.status).toBe(201);
      expect(res.body.vendor.name).toBe(`Customer Store ${uniqueSuffix}`);
      expect(res.body.vendor.status).toBe('active');
      expect(res.body.owner.userId).toBe(existingCustomer.userId);
      expect(res.body.isNewUser).toBe(false);
      expect(res.body.temporaryPassword).toBeUndefined();

      // Verify user's roles now contain 'vendor'
      const updatedUser = await db.query.users.findFirst({
        where: eq(users.userId, existingCustomer.userId),
      });
      expect(updatedUser?.roles).toContain('vendor');
    });

    it('rejects onboarding if the user already owns a vendor store', async () => {
      // targetVendor's owner is already a vendor owner
      const vendorOwner = await db.query.users.findFirst({
        where: eq(users.userId, targetUserId),
      });

      const res = await request(app)
        .post('/api/admin/vendors')
        .set('Cookie', [`auth_token=${adminToken}`])
        .send({
          name: 'Duplicate Store',
          ownerEmail: vendorOwner!.email,
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
