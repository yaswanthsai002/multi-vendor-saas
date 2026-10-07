import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as mediaProcessor from './media.processor.js';
import * as mediaService from './media.service.js';

import type { mediaLibrary, productMedia } from '@repo/db/schema';

const { db, mockR2Service } = vi.hoisted(() => ({
  db: {
    query: {
      mediaLibrary: {
        findFirst: vi.fn(),
      },
      productMedia: {
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
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve([])),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => {
          const promise = Promise.resolve([{ count: 1, all: 1, image: 1, video: 0, disabled: 0 }]);
          return Object.assign(promise, {
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => Promise.resolve([])),
              })),
            })),
          });
        }),
      })),
    })),
    transaction: vi.fn(<T>(cb: (tx: unknown) => Promise<T>) => cb(db)),
  },
  mockR2Service: {
    putObject: vi.fn().mockResolvedValue(undefined),
    getObjectStream: vi.fn(),
    deleteObject: vi.fn().mockResolvedValue(undefined),
    deletePrefix: vi.fn().mockResolvedValue(undefined),
    resolveUrl: vi.fn((key: string) => `http://localhost:4000/media/${key}`),
  },
}));

vi.mock('@repo/db', () => ({
  getDb: vi.fn(() => db),
}));

vi.mock('../../shared/storage/storage.service.js', () => ({
  STORAGE_BUCKETS: {
    productMedia: 'perigee-product-media',
    bulkImports: 'perigee-products-bulk-upload',
  },
  getStorageConfig: vi.fn(() => ({
    productMediaBucket: 'perigee-product-media',
    bulkImportsBucket: 'perigee-products-bulk-upload',
    endpoint: 'http://localhost:9000',
  })),
  storageService: mockR2Service,
}));

vi.mock('./media.processor.js', () => ({
  processImage: vi.fn().mockResolvedValue({ width: 800, height: 600 }),
  processVideo: vi.fn().mockResolvedValue({ width: 1920, height: 1080, durationSeconds: 45 }),
}));

describe('Media Service (media.service.ts)', () => {
  const vendorA = '11111111-1111-4111-8111-111111111111';
  const vendorB = '22222222-2222-4222-8222-222222222222';

  const userId = '33333333-3333-4333-8333-333333333333';
  const mediaId = '44444444-4444-4444-8444-444444444444';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadMedia', () => {
    it('uploads and processes a valid JPEG image', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 50000,
        buffer: Buffer.from('fake-image-bytes'),
      } as Express.Multer.File;

      const mockDbRow = {
        mediaId,
        vendorId: vendorA,
        createdBy: userId,
        mediaType: 'image' as const,
        originalFileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSizeBytes: 50000,
        width: 800,
        height: 600,
        durationSeconds: null,
        originalStorageKey: `vendors/${vendorA}/media/${mediaId}/original.jpg`,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        disabledAt: null,
      };

      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([mockDbRow]),
        }),
      } as unknown as ReturnType<typeof db.insert>);

      const result = await mediaService.uploadMedia(vendorA, userId, mockFile);

      expect(mockR2Service.putObject).toHaveBeenCalled();
      expect(mediaProcessor.processImage).toHaveBeenCalled();
      expect(result.mediaId).toBe(mediaId);
      expect(result.type).toBe('image');
      expect(result.variants?.thumbnail).toBeDefined();
    });

    it('rejects an unsupported MIME type', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'malicious.exe',
        encoding: '7bit',
        mimetype: 'application/x-msdownload',
        size: 5000,
        buffer: Buffer.from('bad'),
      } as Express.Multer.File;

      await expect(mediaService.uploadMedia(vendorA, userId, mockFile)).rejects.toMatchObject({
        statusCode: 400,
        code: 'UNSUPPORTED_MEDIA_TYPE',
      });
    });

    it('rejects an oversized image (> 10MB)', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'huge.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 11 * 1024 * 1024,
        buffer: Buffer.from('huge'),
      } as Express.Multer.File;

      await expect(mediaService.uploadMedia(vendorA, userId, mockFile)).rejects.toMatchObject({
        statusCode: 400,
        code: 'FILE_TOO_LARGE',
      });
    });

    it('cleans up saved files if database insertion fails', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 50000,
        buffer: Buffer.from('fake-image-bytes'),
      } as Express.Multer.File;

      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockRejectedValueOnce(new Error('DB failure')),
        }),
      } as unknown as ReturnType<typeof db.insert>);

      await expect(mediaService.uploadMedia(vendorA, userId, mockFile)).rejects.toThrow(
        'DB failure',
      );
      expect(mockR2Service.deletePrefix).toHaveBeenCalled();
    });
  });

  describe('getMediaById & Vendor Isolation', () => {
    it('returns media when owned by vendor', async () => {
      const mockDbRow = {
        mediaId,
        vendorId: vendorA,
        createdBy: userId,
        mediaType: 'image' as const,
        originalFileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSizeBytes: 50000,
        width: 800,
        height: 600,
        durationSeconds: null,
        originalStorageKey: `vendors/${vendorA}/media/${mediaId}/original.jpg`,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        disabledAt: null,
      };

      vi.mocked(db.query.mediaLibrary.findFirst).mockResolvedValueOnce(
        mockDbRow as unknown as typeof mediaLibrary.$inferSelect,
      );

      const result = await mediaService.getMediaById(vendorA, mediaId);
      expect(result.mediaId).toBe(mediaId);
    });

    it('throws 404 when media belongs to another vendor (vendor isolation)', async () => {
      vi.mocked(db.query.mediaLibrary.findFirst).mockResolvedValueOnce(null);

      await expect(mediaService.getMediaById(vendorB, mediaId)).rejects.toMatchObject({
        statusCode: 404,
        code: 'MEDIA_NOT_FOUND',
      });
    });
  });

  describe('listMedia', () => {
    it('returns paginated items and all-tab counts summary', async () => {
      const result = await mediaService.listMedia(vendorA, {
        status: 'active',
        page: 1,
        limit: 20,
      });

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('pagination');
      expect(result).toHaveProperty('counts');
      expect(result.counts).toEqual({
        all: 1,
        image: 1,
        video: 0,
        disabled: 0,
      });
    });
  });

  describe('disableMedia', () => {
    it('disables active media, removes productMedia references, and nulls productImageId', async () => {
      const mockDbRow = {
        mediaId,
        vendorId: vendorA,
        createdBy: userId,
        mediaType: 'image' as const,
        originalFileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSizeBytes: 50000,
        width: 800,
        height: 600,
        durationSeconds: null,
        originalStorageKey: `vendors/${vendorA}/media/${mediaId}/original.jpg`,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        disabledAt: null,
      };

      const updatedRow = {
        ...mockDbRow,
        status: 'disabled' as const,
        disabledAt: new Date(),
      };

      vi.mocked(db.query.mediaLibrary.findFirst).mockResolvedValueOnce(
        mockDbRow as unknown as typeof mediaLibrary.$inferSelect,
      );
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedRow]),
          }),
        }),
      } as unknown as ReturnType<typeof db.update>);

      const result = await mediaService.disableMedia(vendorA, mediaId);

      expect(db.delete).toHaveBeenCalled(); // deletes productMedia join rows
      expect(db.update).toHaveBeenCalled(); // nullifies productImageId & updates media status
      expect(result.status).toBe('disabled');
    });

    it('rejects disabling if media is already disabled', async () => {
      const mockDbRow = {
        mediaId,
        vendorId: vendorA,
        status: 'disabled' as const,
      };

      vi.mocked(db.query.mediaLibrary.findFirst).mockResolvedValueOnce(
        mockDbRow as unknown as typeof mediaLibrary.$inferSelect,
      );

      await expect(mediaService.disableMedia(vendorA, mediaId)).rejects.toMatchObject({
        statusCode: 400,
        code: 'MEDIA_ALREADY_DISABLED',
      });
    });

    it('rejects disabling if media belongs to another vendor', async () => {
      vi.mocked(db.query.mediaLibrary.findFirst).mockResolvedValueOnce(null);

      await expect(mediaService.disableMedia(vendorB, mediaId)).rejects.toMatchObject({
        statusCode: 404,
        code: 'MEDIA_NOT_FOUND',
      });
    });
  });

  describe('deleteMedia', () => {
    it('rejects deleting if media status is active', async () => {
      const mockDbRow = {
        mediaId,
        vendorId: vendorA,
        status: 'active' as const,
      };

      vi.mocked(db.query.mediaLibrary.findFirst).mockResolvedValueOnce(
        mockDbRow as unknown as typeof mediaLibrary.$inferSelect,
      );

      await expect(mediaService.deleteMedia(vendorA, mediaId)).rejects.toMatchObject({
        statusCode: 400,
        code: 'MEDIA_NOT_DISABLED',
      });
    });

    it('rejects deleting if media has productMedia references', async () => {
      const mockDbRow = {
        mediaId,
        vendorId: vendorA,
        status: 'disabled' as const,
      };

      vi.mocked(db.query.mediaLibrary.findFirst).mockResolvedValueOnce(
        mockDbRow as unknown as typeof mediaLibrary.$inferSelect,
      );
      vi.mocked(db.query.productMedia.findFirst).mockResolvedValueOnce({
        productId: 'prod-1',
        mediaId,
        sortOrder: 0,
      } as unknown as typeof productMedia.$inferSelect);

      await expect(mediaService.deleteMedia(vendorA, mediaId)).rejects.toMatchObject({
        statusCode: 409,
        code: 'MEDIA_IN_USE',
      });
    });

    it('deletes DB row and removes physical files when media is disabled and unreferenced', async () => {
      const mockDbRow = {
        mediaId,
        vendorId: vendorA,
        status: 'disabled' as const,
      };

      vi.mocked(db.query.mediaLibrary.findFirst).mockResolvedValueOnce(
        mockDbRow as unknown as typeof mediaLibrary.$inferSelect,
      );
      vi.mocked(db.query.productMedia.findFirst).mockResolvedValueOnce(null);

      await mediaService.deleteMedia(vendorA, mediaId);

      expect(db.delete).toHaveBeenCalled();
      expect(mockR2Service.deletePrefix).toHaveBeenCalledWith(
        `vendors/${vendorA}/media/${mediaId}`,
        'perigee-product-media',
      );
    });
  });
});
