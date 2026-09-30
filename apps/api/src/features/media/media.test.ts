import { SignJWT } from 'jose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../../app.js';

import * as mediaService from './media.service.js';

import type * as MediaServiceModule from './media.service.js';
import type { users, vendors } from '@repo/db/schema';

const { db } = vi.hoisted(() => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
      vendors: {
        findFirst: vi.fn(),
      },
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
      })),
    })),
  },
}));

vi.mock('@repo/db', () => ({
  getDb: vi.fn(() => db),
}));

vi.mock('./media.service.js', async (importOriginal) => {
  const actual = await importOriginal<typeof MediaServiceModule>();
  return {
    ...actual,
    uploadMedia: vi.fn(),
    listMedia: vi.fn(),
    getMediaById: vi.fn(),
    disableMedia: vi.fn(),
    deleteMedia: vi.fn(),
    enableMedia: vi.fn(),
    bulkAction: vi.fn(),
  };
});

describe('Media API (/api/vendor/media)', () => {
  const validUserId = '11111111-1111-4111-8111-111111111111';
  const validVendorId = '22222222-2222-4222-8222-222222222222';
  const validMediaId = '33333333-3333-4333-8333-333333333333';

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
      roles: ['customer', 'vendor'],
    } as unknown as typeof users.$inferSelect);

    vi.mocked(db.query.vendors.findFirst).mockResolvedValue({
      vendorId: validVendorId,
      userId: validUserId,
      name: 'Test Vendor Store',
      slug: 'test-vendor-store',
      status: 'active',
    } as unknown as typeof vendors.$inferSelect);
  });

  describe('Authentication & Authorization', () => {
    it('returns 401 when no auth cookie is present', async () => {
      const res = await request(app).get('/api/vendor/media');
      expect(res.status).toBe(401);
    });

    it('returns 403 when user is not a vendor', async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce({
        userId: validUserId,
        roles: ['customer'],
      } as unknown as typeof users.$inferSelect);

      const cookie = await createAuthCookie(validUserId);
      const res = await request(app).get('/api/vendor/media').set('Cookie', cookie);
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/vendor/media', () => {
    it('returns 400 when no file is uploaded in the request', async () => {
      const cookie = await createAuthCookie(validUserId);
      const res = await request(app).post('/api/vendor/media').set('Cookie', cookie);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('FILE_REQUIRED');
    });

    it('returns 201 with uploaded media metadata when file is provided', async () => {
      const mockResult = {
        mediaId: validMediaId,
        type: 'image' as const,
        originalFileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSizeBytes: 12345,
        width: 800,
        height: 600,
        status: 'active' as const,
        original: 'http://localhost:4000/media/vendors/v/media/m/original.jpg',
        variants: {
          thumbnail: 'http://localhost:4000/media/vendors/v/media/m/thumbnail.webp',
          medium: 'http://localhost:4000/media/vendors/v/media/m/medium.webp',
          large: 'http://localhost:4000/media/vendors/v/media/m/large.webp',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        disabledAt: null,
      };

      vi.mocked(mediaService.uploadMedia).mockResolvedValueOnce(mockResult);

      const cookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .post('/api/vendor/media')
        .set('Cookie', cookie)
        .attach('file', Buffer.from('fake image content'), 'test.jpg');

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Media uploaded successfully.');
      expect(res.body.media.mediaId).toBe(validMediaId);
    });

    it('returns 201 with items array when multiple files are uploaded', async () => {
      const mockResult1 = {
        mediaId: validMediaId,
        type: 'image' as const,
        originalFileName: 'test1.jpg',
        mimeType: 'image/jpeg',
        fileSizeBytes: 12345,
        width: 800,
        height: 600,
        status: 'active' as const,
        original: 'http://localhost:4000/media/vendors/v/media/1/original.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        disabledAt: null,
      };
      const mockResult2 = {
        mediaId: '66666666-6666-4666-8666-666666666666',
        type: 'video' as const,
        originalFileName: 'test2.mp4',
        mimeType: 'video/mp4',
        fileSizeBytes: 54321,
        width: 1920,
        height: 1080,
        status: 'active' as const,
        original: 'http://localhost:4000/media/vendors/v/media/2/original.mp4',
        createdAt: new Date(),
        updatedAt: new Date(),
        disabledAt: null,
      };

      vi.mocked(mediaService.uploadMedia)
        .mockResolvedValueOnce(mockResult1)
        .mockResolvedValueOnce(mockResult2);

      const cookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .post('/api/vendor/media')
        .set('Cookie', cookie)
        .attach('files', Buffer.from('fake image content'), 'test1.jpg')
        .attach('files', Buffer.from('fake video content'), 'test2.mp4');

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('2 media files uploaded successfully.');
      expect(res.body.items).toHaveLength(2);
      expect(res.body.media.mediaId).toBe(validMediaId);
    });
  });

  describe('GET /api/vendor/media', () => {
    it('returns 200 with paginated media list and counts summary', async () => {
      vi.mocked(mediaService.listMedia).mockResolvedValueOnce({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
        counts: { all: 5, image: 3, video: 2, disabled: 1 },
      });

      const cookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .get('/api/vendor/media?status=active&page=1&limit=20')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.counts).toEqual({ all: 5, image: 3, video: 2, disabled: 1 });
    });
  });

  describe('GET /api/vendor/media/:mediaId', () => {
    it('returns 400 for invalid UUID parameter', async () => {
      const cookie = await createAuthCookie(validUserId);
      const res = await request(app).get('/api/vendor/media/not-a-uuid').set('Cookie', cookie);

      expect(res.status).toBe(400);
    });

    it('returns 200 with media details when found', async () => {
      const mockResult = {
        mediaId: validMediaId,
        type: 'image' as const,
        originalFileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSizeBytes: 12345,
        width: 800,
        height: 600,
        status: 'active' as const,
        original: 'http://localhost:4000/media/vendors/v/media/m/original.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        disabledAt: null,
      };

      vi.mocked(mediaService.getMediaById).mockResolvedValueOnce(mockResult);

      const cookie = await createAuthCookie(validUserId);
      const res = await request(app).get(`/api/vendor/media/${validMediaId}`).set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.media.mediaId).toBe(validMediaId);
    });
  });

  describe('PATCH /api/vendor/media/:mediaId/disable', () => {
    it('returns 200 when media is disabled', async () => {
      const mockResult = {
        mediaId: validMediaId,
        type: 'image' as const,
        originalFileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSizeBytes: 12345,
        width: 800,
        height: 600,
        status: 'disabled' as const,
        original: 'http://localhost:4000/media/vendors/v/media/m/original.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        disabledAt: new Date(),
      };

      vi.mocked(mediaService.disableMedia).mockResolvedValueOnce(mockResult);

      const cookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .patch(`/api/vendor/media/${validMediaId}/disable`)
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.media.status).toBe('disabled');
    });
  });

  describe('PATCH /api/vendor/media/:mediaId/enable', () => {
    it('returns 200 when media is re-activated', async () => {
      const mockResult = {
        mediaId: validMediaId,
        type: 'image' as const,
        originalFileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSizeBytes: 12345,
        width: 800,
        height: 600,
        status: 'active' as const,
        original: 'http://localhost:4000/media/vendors/v/media/m/original.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        disabledAt: null,
      };

      vi.mocked(mediaService.enableMedia).mockResolvedValueOnce(mockResult);

      const cookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .patch(`/api/vendor/media/${validMediaId}/enable`)
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Media enabled successfully.');
      expect(res.body.media.status).toBe('active');
    });
  });

  describe('DELETE /api/vendor/media/:mediaId', () => {
    it('returns 204 when disabled unreferenced media is deleted', async () => {
      vi.mocked(mediaService.deleteMedia).mockResolvedValueOnce(undefined);

      const cookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .delete(`/api/vendor/media/${validMediaId}`)
        .set('Cookie', cookie);

      expect(res.status).toBe(204);
    });
  });

  describe('POST /api/vendor/media/bulk', () => {
    it('returns 200 with report when bulk action is executed', async () => {
      const mockReport = {
        action: 'disable' as const,
        total: 1,
        processed: 1,
        failedCount: 0,
        failed: [],
        message: 'Bulk disable completed: 1 succeeded, 0 failed.',
      };

      vi.mocked(mediaService.bulkAction).mockResolvedValueOnce(mockReport);

      const cookie = await createAuthCookie(validUserId);
      const res = await request(app)
        .post('/api/vendor/media/bulk')
        .set('Cookie', cookie)
        .send({
          action: 'disable',
          mediaIds: [validMediaId],
        });

      expect(res.status).toBe(200);
      expect(res.body.processed).toBe(1);
    });

    it('returns 400 when bulk payload is empty or invalid', async () => {
      const cookie = await createAuthCookie(validUserId);
      const res = await request(app).post('/api/vendor/media/bulk').set('Cookie', cookie).send({
        action: 'invalid_action',
        mediaIds: [],
      });

      expect(res.status).toBe(400);
    });
  });
});
