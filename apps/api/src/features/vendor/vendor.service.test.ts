import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as vendorService from './vendor.service.js';

const { db } = vi.hoisted(() => ({
  db: {
    query: {
      products: {
        findFirst: vi.fn(),
      },
      categories: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() =>
          Promise.resolve([
            {
              productId: '33333333-3333-4333-8333-333333333333',
              vendorId: '22222222-2222-4222-8222-222222222222',
              name: 'Sample Product',
              slug: 'sample-product',
              description: 'Sample description',
              images: ['https://example.com/img.jpg'],
              videos: [],
              price: '29.99',
              stock: 10,
              isSoftDeleted: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
        ),
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
              offset: vi.fn(() =>
                Promise.resolve([
                  {
                    productId: '33333333-3333-4333-8333-333333333333',
                    vendorId: '22222222-2222-4222-8222-222222222222',
                    name: 'Sample Product',
                    slug: 'sample-product',
                    price: '29.99',
                    stock: 10,
                    isSoftDeleted: false,
                  },
                ]),
              ),
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

describe('Vendor Service (vendor.service.ts)', () => {
  const vendorId = '22222222-2222-4222-8222-222222222222';
  const otherVendorId = '99999999-9999-4999-8999-999999999999';
  const productId = '33333333-3333-4333-8333-333333333333';
  const categoryId = '44444444-4444-4444-8444-444444444444';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should throw 400 INVALID_CATEGORY if specified category does not exist', async () => {
      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(undefined);
      // Mock categories lookup returning empty (category missing)
      vi.mocked(db.query.categories.findMany).mockResolvedValueOnce([]);

      await expect(
        vendorService.createProduct(vendorId, {
          name: 'Mechanical Keyboard',
          description: 'A great mechanical keyboard.',
          price: '99.99',
          stock: 20,
          images: ['https://example.com/img.png'],
          categoryIds: [categoryId],
        }),
      ).rejects.toThrow('One or more specified categories do not exist.');
    });

    it('should auto-generate a unique suffixed slug when the base slug is taken', async () => {
      // Mock existing slug in DB
      vi.mocked(db.query.products.findFirst)
        .mockResolvedValueOnce({
          productId: 'existing-id',
          slug: 'mechanical-keyboard',
        } as never)
        // Second call inside getVendorProductById
        .mockResolvedValueOnce({
          productId,
          vendorId,
          name: 'Mechanical Keyboard',
          slug: 'mechanical-keyboard-abc123',
          description: 'Description',
          images: ['https://example.com/img.png'],
          videos: [],
          price: '99.99',
          stock: 10,
          isSoftDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as never);

      const result = await vendorService.createProduct(vendorId, {
        name: 'Mechanical Keyboard',
        description: 'A great mechanical keyboard.',
        price: '99.99',
        stock: 20,
        images: ['https://example.com/img.png'],
      });

      expect(db.insert).toHaveBeenCalled();
      expect(result.productId).toBe(productId);
    });
  });

  describe('getVendorProductById', () => {
    it('should throw 404 PRODUCT_NOT_FOUND when product does not exist or belongs to another vendor', async () => {
      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(undefined);

      await expect(vendorService.getVendorProductById(otherVendorId, productId)).rejects.toThrow(
        'Product not found.',
      );
    });

    it('should throw 404 PRODUCT_NOT_FOUND when product is soft-deleted', async () => {
      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(undefined);

      await expect(vendorService.getVendorProductById(vendorId, productId)).rejects.toThrow(
        'Product not found.',
      );
    });
  });

  describe('updateVendorProductById', () => {
    it('should throw 404 if product to update is not found or belongs to another vendor', async () => {
      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(undefined);

      await expect(
        vendorService.updateVendorProductById(vendorId, productId, { name: 'New Name' }),
      ).rejects.toThrow('Product not found.');
    });

    it('should throw 404 if product is already soft-deleted', async () => {
      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce({
        productId,
        vendorId,
        isSoftDeleted: true,
      } as never);

      await expect(
        vendorService.updateVendorProductById(vendorId, productId, { name: 'New Name' }),
      ).rejects.toThrow('Product not found.');
    });

    it('should throw 409 SLUG_COLLISION if new slug belongs to another product', async () => {
      vi.mocked(db.query.products.findFirst)
        // 1. Existing product found
        .mockResolvedValueOnce({
          productId,
          vendorId,
          slug: 'old-slug',
          isSoftDeleted: false,
        } as never)
        // 2. Slug check finds another product with this slug
        .mockResolvedValueOnce({
          productId: 'different-product-id',
          slug: 'conflicting-slug',
        } as never);

      await expect(
        vendorService.updateVendorProductById(vendorId, productId, { slug: 'conflicting-slug' }),
      ).rejects.toThrow('A product with this slug already exists.');
    });
  });

  describe('deleteVendorProductById', () => {
    it('should throw 404 if product to delete is not found', async () => {
      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(undefined);

      await expect(vendorService.deleteVendorProductById(vendorId, productId)).rejects.toThrow(
        'Product not found.',
      );
    });

    it('should perform soft-delete by setting isSoftDeleted: true', async () => {
      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce({
        productId,
        vendorId,
        isSoftDeleted: false,
      } as never);

      const res = await vendorService.deleteVendorProductById(vendorId, productId);

      expect(res.message).toBe('Product deleted successfully.');
      expect(db.update).toHaveBeenCalled();
    });
  });
});
