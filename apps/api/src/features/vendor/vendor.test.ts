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
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
              offset: vi.fn(() => Promise.resolve([])),
            })),
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
    createProduct: vi.fn(),
    getVendorProducts: vi.fn(),
    getVendorProductById: vi.fn(),
    updateVendorProductById: vi.fn(),
    deleteVendorProductById: vi.fn(),
  };
});

describe('Vendor Products API (/api/vendor/products)', () => {
  const validUserId = '11111111-1111-4111-8111-111111111111';
  const validVendorId = '22222222-2222-4222-8222-222222222222';
  const validProductId = '33333333-3333-4333-8333-333333333333';
  const validCategoryId = '44444444-4444-4444-8444-444444444444';

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

    // Default: valid vendor user with active vendor profile
    vi.mocked(db.query.users.findFirst).mockResolvedValue({
      userId: validUserId,
      fullName: 'Vendor Owner',
      email: 'vendor@example.com',
      passwordHash: 'hash',
      emailVerifiedAt: new Date(),
      roles: ['customer', 'vendor'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(db.query.vendors.findFirst).mockResolvedValue({
      vendorId: validVendorId,
      userId: validUserId,
      name: 'Acme Hardware',
      slug: 'acme-hardware',
      tagline: 'Best tools',
      description: 'Quality tools store',
      logoUrl: 'https://example.com/logo.png',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  /* -------------------------------------------------------------------------- */
  /*               Pipeline: Authentication & Role Authorization                */
  /* -------------------------------------------------------------------------- */
  describe('Pipeline Stage 1 & 2: Authentication & Role Authorization', () => {
    it('should reject unauthenticated requests with 401 AUTH_TOKEN_MISSING', async () => {
      const res = await request(app).get('/api/vendor/products');

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_TOKEN_MISSING');
    });

    it('should reject users without vendor role with 403 VENDOR_ROLE_REQUIRED', async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce({
        userId: validUserId,
        fullName: 'Customer Only',
        email: 'customer@example.com',
        passwordHash: 'hash',
        emailVerifiedAt: new Date(),
        roles: ['customer'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const authCookie = await createAuthCookie(validUserId);
      const res = await request(app).get('/api/vendor/products').set('Cookie', [authCookie]);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('VENDOR_ROLE_REQUIRED');
    });
  });

  /* -------------------------------------------------------------------------- */
  /*            Pipeline Stage 3: Vendor Profile & Status Authorization         */
  /* -------------------------------------------------------------------------- */
  describe('Pipeline Stage 3: Vendor Profile & Status Authorization', () => {
    it('should return 403 VENDOR_PROFILE_NOT_FOUND if vendor record is missing', async () => {
      vi.mocked(db.query.vendors.findFirst).mockResolvedValueOnce(undefined);

      const authCookie = await createAuthCookie(validUserId);
      const res = await request(app).get('/api/vendor/products').set('Cookie', [authCookie]);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('VENDOR_PROFILE_NOT_FOUND');
    });

    it('should return 403 VENDOR_NOT_ACTIVE if vendor status is pending, suspended, or rejected', async () => {
      vi.mocked(db.query.vendors.findFirst).mockResolvedValueOnce({
        vendorId: validVendorId,
        userId: validUserId,
        name: 'Pending Vendor',
        slug: 'pending-vendor',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const authCookie = await createAuthCookie(validUserId);
      const res = await request(app).get('/api/vendor/products').set('Cookie', [authCookie]);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('VENDOR_NOT_ACTIVE');
      expect(res.body.error).toContain('pending');
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                       POST /api/vendor/products                            */
  /* -------------------------------------------------------------------------- */
  describe('POST /api/vendor/products', () => {
    const validProductPayload = {
      name: 'Mechanical Gaming Keyboard',
      description: 'Ultra responsive RGB mechanical gaming keyboard with brown switches.',
      price: '89.99',
      stock: 25,
      images: ['https://example.com/keyboard1.png', 'https://example.com/keyboard2.png'],
      videos: ['https://example.com/video1.mp4'],
      categoryIds: [validCategoryId],
    };

    it('should successfully create a product and return 201', async () => {
      const mockCreatedProduct = {
        productId: validProductId,
        vendorId: validVendorId,
        ...validProductPayload,
        slug: 'mechanical-gaming-keyboard',
        isSoftDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        categories: [{ categoryId: validCategoryId, name: 'Keyboards', slug: 'keyboards' }],
      };

      vi.mocked(vendorService.createProduct).mockResolvedValueOnce(mockCreatedProduct as never);

      const authCookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .post('/api/vendor/products')
        .set('Cookie', [authCookie])
        .send(validProductPayload);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Product created successfully.');
      expect(res.body.product).toEqual(mockCreatedProduct);
      expect(vendorService.createProduct).toHaveBeenCalledWith(
        validVendorId,
        expect.objectContaining({
          name: validProductPayload.name,
          price: validProductPayload.price,
        }),
      );
    });

    it('should reject request with 400 if validation fails (negative price or stock < 0)', async () => {
      const authCookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .post('/api/vendor/products')
        .set('Cookie', [authCookie])
        .send({
          ...validProductPayload,
          price: '-10.00',
          stock: -1,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
      expect(res.body.details.properties.price).toBeDefined();
      expect(res.body.details.properties.stock).toBeDefined();
    });

    it('should reject request with 400 if images array is empty', async () => {
      const authCookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .post('/api/vendor/products')
        .set('Cookie', [authCookie])
        .send({
          ...validProductPayload,
          images: [],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
      expect(res.body.details.properties.images).toBeDefined();
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                        GET /api/vendor/products                            */
  /* -------------------------------------------------------------------------- */
  describe('GET /api/vendor/products', () => {
    it('should return 200 with paginated product list for authenticated vendor', async () => {
      const mockResult = {
        products: [
          {
            productId: validProductId,
            vendorId: validVendorId,
            name: 'Mechanical Gaming Keyboard',
            slug: 'mechanical-gaming-keyboard',
            price: '89.99',
            stock: 25,
            isSoftDeleted: false,
            categories: [],
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      vi.mocked(vendorService.getVendorProducts).mockResolvedValueOnce(mockResult as never);

      const authCookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .get('/api/vendor/products?page=1&limit=20&search=keyboard')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResult);
      expect(vendorService.getVendorProducts).toHaveBeenCalledWith(
        validVendorId,
        expect.objectContaining({
          page: 1,
          limit: 20,
          search: 'keyboard',
        }),
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                    GET /api/vendor/products/:productId                     */
  /* -------------------------------------------------------------------------- */
  describe('GET /api/vendor/products/:productId', () => {
    it('should return 200 and product details when product exists and belongs to vendor', async () => {
      const mockProduct = {
        productId: validProductId,
        vendorId: validVendorId,
        name: 'Mechanical Gaming Keyboard',
        slug: 'mechanical-gaming-keyboard',
        price: '89.99',
        stock: 25,
        categories: [],
      };

      vi.mocked(vendorService.getVendorProductById).mockResolvedValueOnce(mockProduct as never);

      const authCookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .get(`/api/vendor/products/${validProductId}`)
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.product).toEqual(mockProduct);
      expect(vendorService.getVendorProductById).toHaveBeenCalledWith(
        validVendorId,
        validProductId,
      );
    });

    it('should return 400 when productId parameter is not a valid UUID', async () => {
      const authCookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .get('/api/vendor/products/not-a-valid-uuid')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                   PATCH /api/vendor/products/:productId                    */
  /* -------------------------------------------------------------------------- */
  describe('PATCH /api/vendor/products/:productId', () => {
    it('should update product fields and return 200', async () => {
      const updatePayload = {
        name: 'Updated Mechanical Keyboard',
        price: '99.99',
        stock: 10,
      };

      const mockUpdatedProduct = {
        productId: validProductId,
        vendorId: validVendorId,
        ...updatePayload,
        categories: [],
      };

      vi.mocked(vendorService.updateVendorProductById).mockResolvedValueOnce(
        mockUpdatedProduct as never,
      );

      const authCookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .patch(`/api/vendor/products/${validProductId}`)
        .set('Cookie', [authCookie])
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Product updated successfully.');
      expect(res.body.product).toEqual(mockUpdatedProduct);
    });

    it('should return 400 if update body is empty', async () => {
      const authCookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .patch(`/api/vendor/products/${validProductId}`)
        .set('Cookie', [authCookie])
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                  DELETE /api/vendor/products/:productId                    */
  /* -------------------------------------------------------------------------- */
  describe('DELETE /api/vendor/products/:productId', () => {
    it('should soft delete product and return 200 message', async () => {
      vi.mocked(vendorService.deleteVendorProductById).mockResolvedValueOnce({
        message: 'Product deleted successfully.',
      });

      const authCookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .delete(`/api/vendor/products/${validProductId}`)
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Product deleted successfully.');
      expect(vendorService.deleteVendorProductById).toHaveBeenCalledWith(
        validVendorId,
        validProductId,
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                          Slugify Utility Tests                             */
  /* -------------------------------------------------------------------------- */
  describe('slugify utility', () => {
    it('should correctly slugify product titles', () => {
      expect(vendorService.slugify('Mechanical Gaming Keyboard!')).toBe(
        'mechanical-gaming-keyboard',
      );
      expect(vendorService.slugify('  Special & Unique Product 2026  ')).toBe(
        'special-unique-product-2026',
      );
    });
  });
});
