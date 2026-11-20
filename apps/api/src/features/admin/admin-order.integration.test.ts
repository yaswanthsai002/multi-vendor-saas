import { randomUUID } from 'node:crypto';

import { getDb } from '@repo/db';
import {
  mediaLibrary,
  orderItems,
  orders,
  products,
  users,
  vendorOrders,
  vendors,
} from '@repo/db/schema';
import { SignJWT } from 'jose';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import app from '../../app.js';
import { checkoutTestDatabaseUrl } from '../../shared/config/test-database.js';

describe
  .skipIf(!checkoutTestDatabaseUrl)
  .sequential('admin order ledger PostgreSQL integration', () => {
    const needle = randomUUID();
    const secret = 'isolated-admin-order-test-secret';
    let orderId: string;
    let adminCookie: string;
    let customerCookie: string;
    let mediaId: string;

    async function cookie(userId: string) {
      return `auth_token=${await new SignJWT({}).setProtectedHeader({ alg: 'HS512' }).setSubject(userId).setIssuer('perigee-api').setAudience('perigee-web-app').setExpirationTime('1h').sign(new TextEncoder().encode(secret))}`;
    }
    beforeAll(async () => {
      if (!checkoutTestDatabaseUrl) throw new Error('Explicit test database required.');
      const target = new URL(checkoutTestDatabaseUrl);
      if (
        !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) ||
        target.pathname !== '/perigee_test'
      )
        throw new Error('Use an isolated local perigee_test database.');
      vi.stubEnv('DATABASE_URL', checkoutTestDatabaseUrl);
      vi.stubEnv('JWT_SECRET', secret);
      const db = getDb();
      const [admin, customer, firstOwner, secondOwner] = await db
        .insert(users)
        .values([
          { fullName: 'Administrator', email: `${randomUUID()}@example.test`, roles: ['admin'] },
          { fullName: 'Order customer', email: `${randomUUID()}@example.test` },
          { fullName: 'First vendor', email: `${randomUUID()}@example.test`, roles: ['vendor'] },
          { fullName: 'Second vendor', email: `${randomUUID()}@example.test`, roles: ['vendor'] },
        ])
        .returning();
      [adminCookie, customerCookie] = await Promise.all([
        cookie(admin.userId),
        cookie(customer.userId),
      ]);
      const [first, second] = await db
        .insert(vendors)
        .values([
          {
            userId: firstOwner.userId,
            name: 'Lighting studio',
            slug: randomUUID(),
            status: 'active',
          },
          {
            userId: secondOwner.userId,
            name: 'Clock studio',
            slug: randomUUID(),
            status: 'active',
          },
        ])
        .returning();
      const [media] = await db
        .insert(mediaLibrary)
        .values({
          vendorId: first.vendorId,
          createdBy: firstOwner.userId,
          mediaType: 'image',
          originalFileName: 'lamp.jpg',
          mimeType: 'image/jpeg',
          fileSizeBytes: 100,
          originalStorageKey: 'lamp.jpg',
        })
        .returning();
      mediaId = media.mediaId;
      const [lamp, cable, clock] = await db
        .insert(products)
        .values([
          {
            vendorId: first.vendorId,
            name: 'Current lamp name',
            slug: randomUUID(),
            description: 'Lamp',
            price: '999.00',
            mrp: '999.00',
            stock: 10,
            productImageId: mediaId,
          },
          {
            vendorId: first.vendorId,
            name: 'Cable',
            slug: randomUUID(),
            description: 'Cable',
            price: '10.00',
            mrp: '10.00',
            stock: 10,
          },
          {
            vendorId: second.vendorId,
            name: 'Clock',
            slug: randomUUID(),
            description: 'Clock',
            price: '20.25',
            mrp: '20.25',
            stock: 10,
          },
        ])
        .returning();
      const [order] = await db
        .insert(orders)
        .values({
          userId: customer.userId,
          orderNumber: `PG-${needle}`,
          requestKey: randomUUID(),
          requestFingerprint: randomUUID(),
          status: 'confirmed',
        })
        .returning();
      orderId = order.orderId;
      const [lighting, clocks] = await db
        .insert(vendorOrders)
        .values([
          { orderId, vendorId: first.vendorId, status: 'pending' },
          {
            orderId,
            vendorId: second.vendorId,
            status: 'cancelled',
            cancellationSource: 'vendor',
            cancellationReasonCode: 'OTHER',
            cancellationDetails: 'Private stock inspection',
            cancelledByUserId: secondOwner.userId,
            cancelledAt: new Date(),
          },
        ])
        .returning();
      await db.insert(orderItems).values([
        {
          vendorOrderId: lighting.vendorOrderId,
          productId: lamp.productId,
          productNameSnapshot: 'Saved desk lamp',
          productQuantity: 2,
          productPriceSnapshot: '100.10',
        },
        {
          vendorOrderId: lighting.vendorOrderId,
          productId: cable.productId,
          productNameSnapshot: 'Saved cable',
          productQuantity: 1,
          productPriceSnapshot: '10.00',
        },
        {
          vendorOrderId: clocks.vendorOrderId,
          productId: clock.productId,
          productNameSnapshot: 'Saved wall clock',
          productQuantity: 3,
          productPriceSnapshot: '20.25',
          cancellationReturnedQuantity: 1,
          cancellationDamagedQuantity: 1,
          cancellationMissingQuantity: 1,
        },
      ]);
    });
    afterAll(async () => {
      await getDb().$client.end();
      vi.unstubAllEnvs();
    });

    it('returns exact original totals and bounded previews from saved snapshots', async () => {
      const res = await request(app)
        .get(`/api/admin/orders?search=${needle}&limit=1`)
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body.pagination).toMatchObject({ total: 1, page: 1, limit: 1 });
      expect(res.body.orders[0].summary).toMatchObject({
        total: '270.95',
        itemCount: 6,
        vendorCount: 2,
        cancelledVendorCount: 1,
      });
      expect(res.body.orders[0].summary.previews).toHaveLength(2);
      expect(JSON.stringify(res.body)).not.toContain('Current lamp name');
      expect(JSON.stringify(res.body)).not.toContain('storageKey');
    });
    it('groups vendor evidence, image URLs, and monetary subtotals in the authorized detail', async () => {
      const res = await request(app).get(`/api/admin/orders/${orderId}`).set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body.summary.total).toBe('270.95');
      expect(res.body.deliveryAddress).toBeNull();
      const lighting = res.body.fulfillments.find(
        (portion: { vendorName: string }) => portion.vendorName === 'Lighting studio',
      );
      expect(Number(lighting.total)).toBe(210.2);
      const lamp = lighting.items.find(
        (item: { productName: string }) => item.productName === 'Saved desk lamp',
      );
      expect(lamp.subtotal).toBe('200.20');
      expect(lamp.imageUrl).toContain(`/media/${mediaId}/thumbnail.webp`);
      const cancelled = res.body.fulfillments.find(
        (portion: { status: string }) => portion.status === 'cancelled',
      );
      expect(cancelled.cancellationDetails).toBe('Private stock inspection');
      expect(cancelled.items[0]).toMatchObject({
        cancellationReturnedQuantity: 1,
        cancellationDamagedQuantity: 1,
        cancellationMissingQuantity: 1,
      });
      expect(JSON.stringify(res.body)).not.toContain('storageKey');
    });
    it('keeps private details behind administrator authorization', async () => {
      for (const path of ['/api/admin/orders', `/api/admin/orders/${orderId}`]) {
        expect((await request(app).get(path)).status).toBe(401);
        const res = await request(app).get(path).set('Cookie', customerCookie);
        expect(res.status).toBe(403);
        expect(JSON.stringify(res.body)).not.toContain('Private stock inspection');
      }
    });
  });
