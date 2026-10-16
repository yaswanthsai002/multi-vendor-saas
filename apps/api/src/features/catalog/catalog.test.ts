import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../../app.js';

const { db } = vi.hoisted(() => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock('@repo/db', () => ({
  getDb: vi.fn(() => db),
}));

describe('Catalog Feature', () => {
  const productId = randomUUID();
  const vendorId = randomUUID();
  const categoryId = randomUUID();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('returns 200 with paginated product catalog without authentication', async () => {
      // Mock total count query
      const mockCountQuery = {
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 1 }]),
          }),
        }),
      };

      // Mock products rows query
      const mockProductsQuery = {
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    offset: vi.fn().mockResolvedValue([
                      {
                        productId,
                        name: 'Studio Wireless Headphones',
                        slug: 'studio-wireless-headphones',
                        shortDescription: 'High quality wireless sound',
                        price: '2499.00',
                        compareAtPrice: '4999.00',
                        stock: 15,
                        isFeatured: true,
                        createdAt: new Date().toISOString(),
                        vendorId,
                        vendorName: 'TechPulse',
                        vendorSlug: 'techpulse',
                        vendorLogoUrl: 'https://example.com/logo.webp',
                        mediaId: null,
                        mediaVendorId: null,
                        mediaStorageKey: null,
                      },
                    ]),
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      // Mock categories query
      const mockCategoriesQuery = {
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                productId,
                categoryId,
                name: 'Audio',
                slug: 'audio',
              },
            ]),
          }),
        }),
      };

      (db.select as unknown as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(mockCountQuery)
        .mockReturnValueOnce(mockProductsQuery)
        .mockReturnValueOnce(mockCategoriesQuery);

      const res = await request(app).get('/api/products?page=1&limit=20');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination.total).toBe(1);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(20);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].name).toBe('Studio Wireless Headphones');
      expect(res.body.items[0].vendor.name).toBe('TechPulse');
      expect(res.body.items[0].categories[0].slug).toBe('audio');
    });

    it('rejects invalid limit exceeding 50 with 400', async () => {
      const res = await request(app).get('/api/products?limit=100');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/products/:slug', () => {
    it('returns 200 with full product details, vendor, and gallery', async () => {
      const mockProductRow = {
        productId,
        name: 'Studio Wireless Headphones',
        slug: 'studio-wireless-headphones',
        shortDescription: 'High quality wireless sound',
        description: 'Complete description of the headphones...',
        price: '2499.00',
        compareAtPrice: '4999.00',
        stock: 15,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        vendorId,
        vendorName: 'TechPulse',
        vendorSlug: 'techpulse',
        vendorLogoUrl: 'https://example.com/logo.webp',
        vendorTagline: 'Audio Specialists',
        vendorDescription: 'Premium audio gear provider',
        primaryMediaId: null,
        primaryMediaVendorId: null,
        primaryMediaStorageKey: null,
      };

      // Mock single product query
      const mockProductQuery = {
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockProductRow]),
              }),
            }),
          }),
        }),
      };

      // Mock gallery query
      const mockGalleryQuery = {
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      };

      // Mock categories query
      const mockCategoriesQuery = {
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                categoryId,
                name: 'Audio',
                slug: 'audio',
              },
            ]),
          }),
        }),
      };

      (db.select as unknown as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(mockProductQuery)
        .mockReturnValueOnce(mockGalleryQuery)
        .mockReturnValueOnce(mockCategoriesQuery);

      const res = await request(app).get('/api/products/studio-wireless-headphones');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('product');
      expect(res.body.product.name).toBe('Studio Wireless Headphones');
      expect(res.body.product.vendor.tagline).toBe('Audio Specialists');
      expect(res.body.product.categories[0].name).toBe('Audio');
    });

    it('returns 404 when product slug does not exist', async () => {
      const mockProductQuery = {
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      };

      (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockProductQuery);

      const res = await request(app).get('/api/products/non-existent-product');

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('GET /api/products/facets', () => {
    it('returns 200 with priceRange and category counts', async () => {
      const mockPriceStatsQuery = {
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ minPrice: '199', maxPrice: '9999' }]),
          }),
        }),
      };

      const leftJoinChain: any = {};
      leftJoinChain.leftJoin = vi.fn().mockReturnValue(leftJoinChain);
      leftJoinChain.groupBy = vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue([
          {
            categoryId,
            name: 'Electronics',
            slug: 'electronics',
            parentCategoryId: null,
            productCount: 12,
          },
        ]),
      });

      const mockCategoryCountsQuery = {
        from: vi.fn().mockReturnValue(leftJoinChain),
      };

      (db.select as unknown as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(mockPriceStatsQuery)
        .mockReturnValueOnce(mockCategoryCountsQuery);

      const res = await request(app).get('/api/products/facets');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('priceRange');
      expect(res.body.priceRange.min).toBe(199);
      expect(res.body.priceRange.max).toBe(9999);
      expect(res.body.categories).toHaveLength(1);
      expect(res.body.categories[0].name).toBe('Electronics');
    });
  });
});
