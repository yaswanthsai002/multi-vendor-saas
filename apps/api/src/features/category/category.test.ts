import { randomUUID } from 'node:crypto';

import { SignJWT } from 'jose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../../app.js';

import type { categories, users } from '@repo/db/schema';

type UserSelect = typeof users.$inferSelect;
type CategorySelect = typeof categories.$inferSelect;

const { db } = vi.hoisted(() => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
      categories: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      productCategories: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve([])),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => Promise.resolve([])),
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
  },
}));

vi.mock('@repo/db', () => ({
  getDb: vi.fn(() => db),
}));

describe('Category Feature', () => {
  const secretKey = 'test-secret-at-least-32-characters-long-key';

  const adminUserId = randomUUID();
  const vendorUserId = randomUUID();
  const customerUserId = randomUUID();
  const rootCategoryId = randomUUID();
  const childCategoryId = randomUUID();

  const mockAdminUser: UserSelect = {
    userId: adminUserId,
    fullName: 'Admin User',
    email: 'admin@example.com',
    passwordHash: 'hash',
    emailVerifiedAt: new Date(),
    roles: ['admin'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockVendorUser: UserSelect = {
    userId: vendorUserId,
    fullName: 'Vendor User',
    email: 'vendor@example.com',
    passwordHash: 'hash',
    emailVerifiedAt: new Date(),
    roles: ['vendor'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCustomerUser: UserSelect = {
    userId: customerUserId,
    fullName: 'Customer User',
    email: 'customer@example.com',
    passwordHash: 'hash',
    emailVerifiedAt: new Date(),
    roles: ['customer'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategory: CategorySelect = {
    categoryId: rootCategoryId,
    parentCategoryId: null,
    name: 'Electronics',
    slug: 'electronics',
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockChildCategory: CategorySelect = {
    categoryId: childCategoryId,
    parentCategoryId: rootCategoryId,
    name: 'Audio',
    slug: 'audio',
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  async function generateToken(userId: string): Promise<string> {
    return new SignJWT({})
      .setProtectedHeader({ alg: 'HS512' })
      .setSubject(userId)
      .setIssuer('perigee-api')
      .setAudience('perigee-web-app')
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(new TextEncoder().encode(secretKey));
  }

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = secretKey;
  });

  describe('Public Read Endpoints', () => {
    it('GET /api/categories - returns 200 with root categories without auth', async () => {
      const mockResult = [
        {
          categoryId: mockCategory.categoryId,
          name: mockCategory.name,
          slug: mockCategory.slug,
          parentCategoryId: null,
          imageUrl: null,
          hasChildren: true,
        },
      ];

      (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockResult),
          }),
        }),
      });

      const res = await request(app).get('/api/categories');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Electronics');
      expect(res.body[0].hasChildren).toBe(true);
    });

    it('GET /api/categories?parentCategoryId=<uuid> - returns direct children', async () => {
      const mockResult = [
        {
          categoryId: mockChildCategory.categoryId,
          name: mockChildCategory.name,
          slug: mockChildCategory.slug,
          parentCategoryId: rootCategoryId,
          imageUrl: null,
          hasChildren: false,
        },
      ];

      (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockResult),
          }),
        }),
      });

      const res = await request(app).get(`/api/categories?parentCategoryId=${rootCategoryId}`);

      expect(res.status).toBe(200);
      expect(res.body[0].parentCategoryId).toBe(rootCategoryId);
      expect(res.body[0].hasChildren).toBe(false);
    });

    it('GET /api/categories?parentCategoryId=invalid - returns 400 validation error', async () => {
      const res = await request(app).get('/api/categories?parentCategoryId=not-a-uuid');
      expect(res.status).toBe(400);
    });

    it('GET /api/categories?search=<text> - returns categories matching search query', async () => {
      const mockResult = [
        {
          categoryId: mockChildCategory.categoryId,
          name: 'Audio',
          slug: 'audio',
          parentCategoryId: rootCategoryId,
          imageUrl: null,
          hasChildren: false,
        },
      ];

      (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockResult),
          }),
        }),
      });

      const res = await request(app).get('/api/categories?search=aud');

      expect(res.status).toBe(200);
      expect(res.body[0].name).toBe('Audio');
      expect(res.body[0].hasChildren).toBe(false);
    });

    it('GET /api/categories/:categoryId - returns category by ID', async () => {
      const mockResult = [
        {
          categoryId: mockCategory.categoryId,
          name: mockCategory.name,
          slug: mockCategory.slug,
          parentCategoryId: null,
          imageUrl: null,
          hasChildren: true,
        },
      ];

      (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockResult),
        }),
      });

      const res = await request(app).get(`/api/categories/${mockCategory.categoryId}`);

      expect(res.status).toBe(200);
      expect(res.body.categoryId).toBe(mockCategory.categoryId);
      expect(res.body.name).toBe('Electronics');
      expect(res.body.hasChildren).toBe(true);
    });

    it('GET /api/categories/:categoryId - returns 404 when category does not exist', async () => {
      (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      const res = await request(app).get(`/api/categories/${randomUUID()}`);
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('CATEGORY_NOT_FOUND');
    });
  });

  describe('Admin Authorization', () => {
    it('POST /api/categories - returns 401 when unauthenticated', async () => {
      const res = await request(app).post('/api/categories').send({ name: 'Gaming' });

      expect(res.status).toBe(401);
    });

    it('POST /api/categories - returns 403 when user is customer', async () => {
      const token = await generateToken(mockCustomerUser.userId);
      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockCustomerUser);

      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', [`auth_token=${token}`])
        .send({ name: 'Gaming' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    it('POST /api/categories - returns 403 when user is vendor', async () => {
      const token = await generateToken(mockVendorUser.userId);
      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockVendorUser);

      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', [`auth_token=${token}`])
        .send({ name: 'Gaming' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    it('POST /api/categories - returns 201 when user is admin', async () => {
      const token = await generateToken(mockAdminUser.userId);
      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockAdminUser);
      (db.query.categories.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const createdCategory = {
        categoryId: randomUUID(),
        name: 'Gaming',
        slug: 'gaming',
        parentCategoryId: null,
        imageUrl: null,
      };

      (db.insert as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdCategory]),
        }),
      });

      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', [`auth_token=${token}`])
        .send({ name: 'Gaming' });

      expect(res.status).toBe(201);
      expect(res.body.category.name).toBe('Gaming');
      expect(res.body.category.hasChildren).toBe(false);
    });
  });

  describe('Hierarchy & Cycle Rules', () => {
    it('POST /api/categories - rejects invalid parentCategoryId with 400', async () => {
      const token = await generateToken(mockAdminUser.userId);
      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockAdminUser);
      (db.query.categories.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', [`auth_token=${token}`])
        .send({
          name: 'Headphones',
          parentCategoryId: randomUUID(),
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_PARENT_CATEGORY');
    });

    it('PATCH /api/categories/:id - rejects setting category as its own parent with 409', async () => {
      const token = await generateToken(mockAdminUser.userId);
      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockAdminUser);
      (db.query.categories.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockCategory);

      const res = await request(app)
        .patch(`/api/categories/${mockCategory.categoryId}`)
        .set('Cookie', [`auth_token=${token}`])
        .send({
          parentCategoryId: mockCategory.categoryId,
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('CATEGORY_CYCLE');
    });

    it('PATCH /api/categories/:id - rejects moving category under its descendant with 409', async () => {
      const token = await generateToken(mockAdminUser.userId);
      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockAdminUser);

      // Structure: A (catA) -> B (catB) -> C (catC)
      const catAId = randomUUID();
      const catBId = randomUUID();
      const catCId = randomUUID();

      let callCount = 0;
      (db.query.categories.findFirst as ReturnType<typeof vi.fn>).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // find existing catA
          return Promise.resolve({ categoryId: catAId, parentCategoryId: null, name: 'A' });
        }
        if (callCount === 2) {
          // verify target parent catC exists
          return Promise.resolve({ categoryId: catCId, parentCategoryId: catBId, name: 'C' });
        }
        if (callCount === 3) {
          // cycle check: lookup catC's parent
          return Promise.resolve({ categoryId: catCId, parentCategoryId: catBId });
        }
        if (callCount === 4) {
          // cycle check: lookup catB's parent -> returns catAId
          return Promise.resolve({ categoryId: catBId, parentCategoryId: catAId });
        }
        return Promise.resolve(null);
      });

      const res = await request(app)
        .patch(`/api/categories/${catAId}`)
        .set('Cookie', [`auth_token=${token}`])
        .send({
          parentCategoryId: catCId,
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('CATEGORY_CYCLE');
    });
  });

  describe('Delete Constraints', () => {
    it('DELETE /api/categories/:id - rejects deleting category with children with 409', async () => {
      const token = await generateToken(mockAdminUser.userId);
      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockAdminUser);

      let queryCount = 0;
      (db.query.categories.findFirst as ReturnType<typeof vi.fn>).mockImplementation(() => {
        queryCount++;
        if (queryCount === 1) {
          return Promise.resolve(mockCategory);
        }
        if (queryCount === 2) {
          return Promise.resolve(mockChildCategory);
        }
        return Promise.resolve(null);
      });

      const res = await request(app)
        .delete(`/api/categories/${mockCategory.categoryId}`)
        .set('Cookie', [`auth_token=${token}`]);

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('CATEGORY_HAS_CHILDREN');
    });

    it('DELETE /api/categories/:id - rejects deleting category in use by products with 409', async () => {
      const token = await generateToken(mockAdminUser.userId);
      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockAdminUser);

      let queryCount = 0;
      (db.query.categories.findFirst as ReturnType<typeof vi.fn>).mockImplementation(() => {
        queryCount++;
        if (queryCount === 1) {
          return Promise.resolve(mockCategory);
        }
        return Promise.resolve(null);
      });

      (db.query.productCategories.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        productId: randomUUID(),
        categoryId: mockCategory.categoryId,
      });

      const res = await request(app)
        .delete(`/api/categories/${mockCategory.categoryId}`)
        .set('Cookie', [`auth_token=${token}`]);

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('CATEGORY_IN_USE');
    });

    it('DELETE /api/categories/:id - deletes leaf unreferenced category with 200', async () => {
      const token = await generateToken(mockAdminUser.userId);
      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockAdminUser);

      let queryCount = 0;
      (db.query.categories.findFirst as ReturnType<typeof vi.fn>).mockImplementation(() => {
        queryCount++;
        if (queryCount === 1) {
          return Promise.resolve(mockCategory);
        }
        return Promise.resolve(null);
      });

      (db.query.productCategories.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/categories/${mockCategory.categoryId}`)
        .set('Cookie', [`auth_token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Category deleted successfully.');
      expect(db.delete).toHaveBeenCalled();
    });
  });
});
