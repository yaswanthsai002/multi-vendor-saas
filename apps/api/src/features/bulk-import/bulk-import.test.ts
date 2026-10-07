import { Readable } from 'node:stream';

import { SignJWT } from 'jose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../../app.js';
import { bulkImportQueue } from '../../shared/queue/queues.js';
import { redis } from '../../shared/redis/redis.client.js';
import { storageService } from '../../shared/storage/storage.service.js';
import { processImportProducts } from '../../worker/import-products.processor.js';
import { processValidateImport } from '../../worker/validate-import.processor.js';
import * as categoryCache from '../category/category.cache.js';

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
    transaction: vi.fn(async (cb) => {
      const tx = {
        insert: vi.fn(() => ({
          values: vi.fn(() => ({
            returning: vi.fn(() =>
              Promise.resolve([{ productId: '00000000-0000-0000-0000-000000000100' }]),
            ),
          })),
        })),
      };
      return cb(tx);
    }),
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
      from: vi.fn(() => {
        const p = Promise.resolve([]);
        (p as any).where = vi.fn(() => Promise.resolve([]));
        return p;
      }),
    })),
  },
}));

vi.mock('@repo/db', () => ({
  getDb: vi.fn(() => db),
}));

async function createAuthCookie(userId: string): Promise<string> {
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

describe('Bulk Product Import API', () => {
  const vendorId = '00000000-0000-0000-0000-000000000002';
  const userId = '00000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long-key';
    await redis.flushall();

    // Mock active vendor authentication
    db.query.users.findFirst.mockResolvedValue({
      userId,
      email: 'vendor@example.com',
      roles: ['vendor'],
    });

    db.query.vendors.findFirst.mockResolvedValue({
      vendorId,
      userId,
      name: 'Tech Haven',
      slug: 'tech-haven',
      status: 'active',
    });
  });

  describe('GET /api/vendor/products/bulk-imports/template', () => {
    it('returns 401 if unauthenticated', async () => {
      const res = await request(app).get('/api/vendor/products/bulk-imports/template');
      expect(res.status).toBe(401);
    });

    it('returns 200 with Excel spreadsheet buffer and correct attachment header', async () => {
      const cookie = await createAuthCookie(userId);
      const res = await request(app)
        .get('/api/vendor/products/bulk-imports/template')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(res.headers['content-disposition']).toContain('products_template.xlsx');
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /api/vendor/products/bulk-imports/initiate', () => {
    it('returns 401 if unauthenticated', async () => {
      const res = await request(app)
        .post('/api/vendor/products/bulk-imports/initiate')
        .send({ filename: 'products.xlsx' });

      expect(res.status).toBe(401);
    });

    it('returns 400 if filename is not .xlsx or .csv', async () => {
      const cookie = await createAuthCookie(userId);
      const res = await request(app)
        .post('/api/vendor/products/bulk-imports/initiate')
        .set('Cookie', cookie)
        .send({ filename: 'products.pdf' });

      expect(res.status).toBe(400);
    });

    it('returns 201 with presigned upload URL for .xlsx file', async () => {
      const cookie = await createAuthCookie(userId);
      const res = await request(app)
        .post('/api/vendor/products/bulk-imports/initiate')
        .set('Cookie', cookie)
        .send({ filename: 'products.xlsx' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.importId).toBeDefined();
      expect(res.body.data.uploadUrl).toBeDefined();
      expect(res.body.data.objectKey).toContain('source.xlsx');

      // Verify Redis lock was acquired
      const lock = await redis.get(`vendor:${vendorId}:active-import`);
      expect(lock).toBe(res.body.data.importId);
    });

    it('returns 201 with presigned upload URL for .csv file', async () => {
      const cookie = await createAuthCookie(userId);
      const res = await request(app)
        .post('/api/vendor/products/bulk-imports/initiate')
        .set('Cookie', cookie)
        .send({ filename: 'products.csv' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.objectKey).toContain('source.csv');
    });

    it('returns 409 if vendor already has an active import session', async () => {
      const cookie = await createAuthCookie(userId);

      // First initiate succeeds
      await request(app)
        .post('/api/vendor/products/bulk-imports/initiate')
        .set('Cookie', cookie)
        .send({ filename: 'products.xlsx' });

      // Second initiate should conflict
      const res = await request(app)
        .post('/api/vendor/products/bulk-imports/initiate')
        .set('Cookie', cookie)
        .send({ filename: 'another.xlsx' });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('IMPORT_ALREADY_IN_PROGRESS');
    });
  });

  describe('GET /api/vendor/products/bulk-imports/active', () => {
    it('returns null when no active import exists', async () => {
      const cookie = await createAuthCookie(userId);
      const res = await request(app)
        .get('/api/vendor/products/bulk-imports/active')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeNull();
    });

    it('returns active import state when one exists', async () => {
      const cookie = await createAuthCookie(userId);
      const initRes = await request(app)
        .post('/api/vendor/products/bulk-imports/initiate')
        .set('Cookie', cookie)
        .send({ filename: 'products.csv' });

      const importId = initRes.body.data.importId;

      const res = await request(app)
        .get('/api/vendor/products/bulk-imports/active')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.importId).toBe(importId);
      expect(res.body.data.status).toBe('UPLOADING');
    });
  });

  describe('POST /api/vendor/products/bulk-imports/:importId/uploaded', () => {
    it('transitions status to VALIDATING and enqueues job', async () => {
      const queueAddSpy = vi.spyOn(bulkImportQueue, 'add').mockResolvedValue({} as any);

      const cookie = await createAuthCookie(userId);
      const initRes = await request(app)
        .post('/api/vendor/products/bulk-imports/initiate')
        .set('Cookie', cookie)
        .send({ filename: 'products.csv' });

      const importId = initRes.body.data.importId;

      const res = await request(app)
        .post(`/api/vendor/products/bulk-imports/${importId}/uploaded`)
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('VALIDATING');
      expect(queueAddSpy).toHaveBeenCalledWith(
        'validate-import',
        expect.objectContaining({
          importId,
          vendorId,
        }),
      );
    });
  });

  describe('POST /api/vendor/products/bulk-imports/:importId/start', () => {
    it('rejects if import is not in NEEDS_REVIEW status', async () => {
      const cookie = await createAuthCookie(userId);
      const initRes = await request(app)
        .post('/api/vendor/products/bulk-imports/initiate')
        .set('Cookie', cookie)
        .send({ filename: 'products.csv' });

      const importId = initRes.body.data.importId;

      const res = await request(app)
        .post(`/api/vendor/products/bulk-imports/${importId}/start`)
        .set('Cookie', cookie);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_STATE');
    });

    it('rejects if readyRows is 0', async () => {
      const cookie = await createAuthCookie(userId);
      const initRes = await request(app)
        .post('/api/vendor/products/bulk-imports/initiate')
        .set('Cookie', cookie)
        .send({ filename: 'products.csv' });

      const importId = initRes.body.data.importId;

      // Force state to NEEDS_REVIEW with 0 ready rows
      const raw = await redis.get(`bulk-import:${importId}`);
      const state = JSON.parse(raw!);
      state.status = 'NEEDS_REVIEW';
      state.readyRows = 0;
      await redis.set(`bulk-import:${importId}`, JSON.stringify(state));

      const res = await request(app)
        .post(`/api/vendor/products/bulk-imports/${importId}/start`)
        .set('Cookie', cookie);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('NO_VALID_ROWS');
    });

    it('enqueues import job when valid', async () => {
      const queueAddSpy = vi.spyOn(bulkImportQueue, 'add').mockResolvedValue({} as any);

      const cookie = await createAuthCookie(userId);
      const initRes = await request(app)
        .post('/api/vendor/products/bulk-imports/initiate')
        .set('Cookie', cookie)
        .send({ filename: 'products.csv' });

      const importId = initRes.body.data.importId;

      // Set state to NEEDS_REVIEW with 5 ready rows
      const raw = await redis.get(`bulk-import:${importId}`);
      const state = JSON.parse(raw!);
      state.status = 'NEEDS_REVIEW';
      state.readyRows = 5;
      await redis.set(`bulk-import:${importId}`, JSON.stringify(state));

      const res = await request(app)
        .post(`/api/vendor/products/bulk-imports/${importId}/start`)
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('IMPORTING');
      expect(queueAddSpy).toHaveBeenCalledWith(
        'import-products',
        expect.objectContaining({
          importId,
          vendorId,
        }),
      );
    });
  });

  describe('DELETE /api/vendor/products/bulk-imports/:importId', () => {
    it('cancels import and cleans up Redis keys and R2 objects', async () => {
      const deletePrefixSpy = vi.spyOn(storageService, 'deletePrefix').mockResolvedValue();

      const cookie = await createAuthCookie(userId);
      const initRes = await request(app)
        .post('/api/vendor/products/bulk-imports/initiate')
        .set('Cookie', cookie)
        .send({ filename: 'products.csv' });

      const importId = initRes.body.data.importId;

      const res = await request(app)
        .delete(`/api/vendor/products/bulk-imports/${importId}`)
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.success).toBe(true);

      // Verify lock removed
      const lock = await redis.get(`vendor:${vendorId}:active-import`);
      expect(lock).toBeNull();

      expect(deletePrefixSpy).toHaveBeenCalledWith(`bulk-imports/${vendorId}/${importId}/`);
    });
  });
});

describe('Bulk Import Worker Processors', () => {
  const vendorId = '00000000-0000-0000-0000-000000000002';
  const importId = '00000000-0000-0000-0000-000000000003';
  const objectKey = `bulk-imports/${vendorId}/${importId}/source.csv`;

  beforeEach(async () => {
    vi.clearAllMocks();
    await redis.flushall();
    await categoryCache.invalidateCategoryMap();

    const mockTaxItem: categoryCache.CategoryTaxonomyItem = {
      categoryId: 'cat-111',
      name: 'Electronics',
      slug: 'electronics',
      parentCategoryId: null,
      path: 'Electronics',
      isLeaf: true,
    };

    vi.spyOn(categoryCache, 'getCategoryMap').mockResolvedValue(
      new Map([['electronics', mockTaxItem]]),
    );

    vi.spyOn(categoryCache, 'getCategoryTaxonomy').mockResolvedValue({
      list: [mockTaxItem],
      leafList: [mockTaxItem],
      lookup: (q: string) => {
        const norm = q.trim().toLowerCase();
        if (norm === 'electronics' || norm === 'cat-111') {
          return mockTaxItem;
        }
        return undefined;
      },
    });
  });

  it('processValidateImport correctly parses valid rows and captures invalid rows in errors.csv', async () => {
    const csvContent = `name,description,price,stock,category
Valid Wireless Headphones,High quality wireless bluetooth headphones,199.99,50,electronics
Invalid Price Product,Description of the product with bad price,abc,10,electronics
Nonexistent Category,Valid description for this product,49.99,20,clothing
`;

    vi.spyOn(storageService, 'getObjectStream').mockResolvedValue(Readable.from([csvContent]));
    const putObjectSpy = vi.spyOn(storageService, 'putObject').mockResolvedValue();

    const mockJob = {
      data: {
        importId,
        vendorId,
        objectKey,
      },
    } as any;

    await processValidateImport(mockJob);

    const rawState = await redis.get(`bulk-import:${importId}`);
    expect(rawState).toBeDefined();
    const state = JSON.parse(rawState!);

    expect(state.status).toBe('NEEDS_REVIEW');
    expect(state.totalRows).toBe(3);
    expect(state.readyRows).toBe(1);
    expect(state.needsAttentionRows).toBe(2);
    expect(state.errorsKey).toBe(`bulk-imports/${vendorId}/${importId}/errors.csv`);

    expect(putObjectSpy).toHaveBeenCalledWith(
      `bulk-imports/${vendorId}/${importId}/errors.csv`,
      expect.stringContaining('Invalid Price Product'),
      'text/csv',
    );
  });

  it('processImportProducts inserts valid products in chunks and marks import as COMPLETED', async () => {
    const csvContent = `name,description,price,stock,category
Valid Wireless Headphones,High quality wireless bluetooth headphones,199.99,50,electronics
Another Great Product,High quality wireless bluetooth earphones,89.99,100,electronics
`;

    vi.spyOn(storageService, 'getObjectStream').mockResolvedValue(Readable.from([csvContent]));

    // Seed state in Redis
    await redis.set(
      `bulk-import:${importId}`,
      JSON.stringify({
        importId,
        vendorId,
        status: 'IMPORTING',
        filename: 'source.csv',
        objectKey,
        totalRows: 2,
        processedRows: 2,
        readyRows: 2,
        needsAttentionRows: 0,
        importedRows: 0,
      }),
    );
    await redis.set(`vendor:${vendorId}:active-import`, importId);

    const mockJob = {
      data: {
        importId,
        vendorId,
        objectKey,
      },
    } as any;

    await processImportProducts(mockJob);

    const rawState = await redis.get(`bulk-import:${importId}`);
    const state = JSON.parse(rawState!);

    expect(state.status).toBe('COMPLETED');
    expect(state.importedRows).toBe(2);

    // Vendor active-import pointer is preserved so the completed screen remains visible
    const lock = await redis.get(`vendor:${vendorId}:active-import`);
    expect(lock).toBe(importId);
  });
});
