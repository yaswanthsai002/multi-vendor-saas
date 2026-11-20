import { SignJWT } from 'jose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../../app.js';

import { notificationListQuerySchema } from './notifications.schema.js';
import { updateVendorOrderStatusSchema } from './order.schema.js';

const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  vendor: vi.fn(),
  list: vi.fn(),
  read: vi.fn(),
  readOrder: vi.fn(),
  remove: vi.fn(),
}));
vi.mock('@repo/db', () => ({
  getDb: () => ({
    query: { users: { findFirst: mocks.user }, vendors: { findFirst: mocks.vendor } },
  }),
}));
vi.mock('./notifications.service.js', () => ({
  listNotifications: mocks.list,
  readNotification: mocks.read,
  readOrderNotifications: mocks.readOrder,
  deleteNotification: mocks.remove,
}));
const userId = '11111111-1111-4111-8111-111111111111';
const vendorId = '22222222-2222-4222-8222-222222222222';
const notificationId = '33333333-3333-4333-8333-333333333333';
const secret = 'local-notification-test-secret-only';
async function cookie() {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS512' })
    .setSubject(userId)
    .setIssuer('perigee-api')
    .setAudience('perigee-web-app')
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(secret));
  return `auth_token=${token}`;
}

describe('vendor notification contracts and access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('JWT_SECRET', secret);
    mocks.user.mockResolvedValue({ userId, status: 'active', roles: ['vendor'] });
    mocks.vendor.mockResolvedValue({
      vendorId,
      userId,
      name: 'Vendor',
      slug: 'vendor',
      status: 'suspended',
    });
    mocks.list.mockResolvedValue({ vendorId, items: [], unreadCount: 0, nextCursor: null });
    mocks.read.mockResolvedValue(undefined);
    mocks.readOrder.mockResolvedValue(true);
    mocks.remove.mockResolvedValue(undefined);
  });
  it('requires authentication', async () => {
    expect((await request(app).get('/api/vendor/notifications')).status).toBe(401);
    expect(mocks.list).not.toHaveBeenCalled();
  });
  it('bootstraps an empty suspended-profile inbox from the session', async () => {
    const res = await request(app)
      .get('/api/vendor/notifications')
      .set('Cookie', await cookie());
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: { vendorId, items: [], unreadCount: 0, nextCursor: null },
    });
    expect(mocks.list).toHaveBeenCalledWith(vendorId, { limit: 20 });
  });
  it.each([
    { status: 'suspended', roles: ['vendor'] },
    { status: 'active', roles: ['customer'] },
  ])('rejects forbidden user state %j', async (user) => {
    mocks.user.mockResolvedValue({ userId, ...user });
    expect(
      (
        await request(app)
          .get('/api/vendor/notifications')
          .set('Cookie', await cookie())
      ).status,
    ).toBe(403);
    expect(mocks.list).not.toHaveBeenCalled();
  });
  it('rejects a missing vendor profile', async () => {
    mocks.vendor.mockResolvedValue(undefined);
    expect(
      (
        await request(app)
          .get('/api/vendor/notifications')
          .set('Cookie', await cookie())
      ).status,
    ).toBe(403);
  });
  it.each(['?vendorId=other', '?limit=51', '?cursor=broken', '?limit=0'])(
    'rejects unsupported query %s',
    async (query) => {
      expect(
        (
          await request(app)
            .get(`/api/vendor/notifications${query}`)
            .set('Cookie', await cookie())
        ).status,
      ).toBe(400);
    },
  );
  it('marks only the session vendor order and validates the displayed state', async () => {
    const path = `/api/vendor/notifications/orders/${notificationId}/read`;
    expect((await request(app).put(path).send({ status: 'pending' })).status).toBe(401);
    const res = await request(app)
      .put(path)
      .set('Cookie', await cookie())
      .send({ status: 'pending' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { vendorId, changed: true } });
    expect(mocks.readOrder).toHaveBeenCalledWith(vendorId, notificationId, 'pending');
    for (const body of [{}, { status: 'unknown' }, { status: 'pending', vendorId }])
      expect(
        (
          await request(app)
            .put(path)
            .set('Cookie', await cookie())
            .send(body)
        ).status,
      ).toBe(400);
    expect(
      (
        await request(app)
          .put('/api/vendor/notifications/orders/bad/read')
          .set('Cookie', await cookie())
          .send({ status: 'pending' })
      ).status,
    ).toBe(400);
    mocks.user.mockResolvedValue({ userId, status: 'suspended', roles: ['vendor'] });
    expect(
      (
        await request(app)
          .put(path)
          .set('Cookie', await cookie())
          .send({ status: 'pending' })
      ).status,
    ).toBe(403);
  });

  it('uses no-body idempotent read and delete operations with the session vendor', async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      const read = await request(app)
        .put(`/api/vendor/notifications/${notificationId}/read`)
        .set('Cookie', await cookie());
      const removed = await request(app)
        .delete(`/api/vendor/notifications/${notificationId}`)
        .set('Cookie', await cookie());
      expect([read.status, removed.status]).toEqual([204, 204]);
      expect(read.text).toBe('');
      expect(removed.text).toBe('');
    }
    expect(mocks.read).toHaveBeenCalledWith(vendorId, notificationId);
    expect(mocks.remove).toHaveBeenCalledWith(vendorId, notificationId);
  });
  it('rejects malformed IDs and supplied body fields', async () => {
    expect(
      (
        await request(app)
          .put('/api/vendor/notifications/bad/read')
          .set('Cookie', await cookie())
      ).status,
    ).toBe(400);
    expect(
      (
        await request(app)
          .put(`/api/vendor/notifications/${notificationId}/read`)
          .set('Cookie', await cookie())
          .send({ read: false })
      ).status,
    ).toBe(400);
  });
  it('decodes only the exact cursor shape', () => {
    const cursor = { createdAt: '2026-11-19T10:00:00.000Z', notificationId };
    expect(
      notificationListQuerySchema.parse({
        cursor: Buffer.from(JSON.stringify(cursor)).toString('base64url'),
      }).cursor,
    ).toEqual(cursor);
    expect(
      notificationListQuerySchema.safeParse({
        cursor: Buffer.from(JSON.stringify({ ...cursor, vendorId })).toString('base64url'),
      }).success,
    ).toBe(false);
  });
  it('rejects cancellation identity, missing items, duplicates and missing Other details', () => {
    const valid = {
      status: 'cancelled',
      cancellationReasonCode: 'OTHER',
      cancellationDetails: 'Private detail',
      items: [{ orderItemId: notificationId, damagedQuantity: 0, missingQuantity: 0 }],
    };
    expect(updateVendorOrderStatusSchema.safeParse(valid).success).toBe(true);
    for (const input of [
      { ...valid, vendorId },
      { ...valid, items: [] },
      { ...valid, items: [...valid.items, ...valid.items] },
      { ...valid, cancellationDetails: '  ' },
      { status: 'processing', cancellationDetails: 'secret' },
    ])
      expect(updateVendorOrderStatusSchema.safeParse(input).success).toBe(false);
  });
});
