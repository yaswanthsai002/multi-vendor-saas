import cookieParser from 'cookie-parser';
import express from 'express';
import { SignJWT } from 'jose';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../../shared/errors/AppError.js';
import { errorHandler } from '../../shared/middleware/errorHandler.js';
import { customerOrderStatus } from '../../shared/orders/order-lifecycle.js';

import {
  customerOrderPaginationSchema,
  placeCustomerOrderSchema,
} from './customer-order.schema.js';
import * as service from './customer-order.service.js';
import { customerRouter } from './customer.routes.js';

const app = express();
app.use(express.json(), cookieParser());
app.use('/api/customer', customerRouter);
app.use(errorHandler);
const userId = '11111111-1111-4111-8111-111111111111';
const addressId = '22222222-2222-4222-8222-222222222222';
const productId = '33333333-3333-4333-8333-333333333333';
const key = '44444444-4444-4444-8444-444444444444';
const body = { addressId, lines: [{ productId, quantity: 1, expectedUnitPrice: '99.99' }] };
const secret = 'checkout-test-secret-only-never-used-in-production';

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

beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubEnv('JWT_SECRET', secret);
});
afterAll(() => vi.unstubAllEnvs());

describe('checkout contract', () => {
  it('requires authentication for all customer order routes', async () => {
    for (const path of ['/checkout/review', '/orders', `/orders/${key}`])
      expect((await request(app).get(`/api/customer${path}`)).status).toBe(401);
    expect((await request(app).post('/api/customer/orders').send(body)).status).toBe(401);
    expect((await request(app).post(`/api/customer/orders/${key}/cancel`).send({})).status).toBe(
      401,
    );
  });
  it('requires UUID idempotency header and rejects client identity/duplicate lines', async () => {
    const create = vi.spyOn(service, 'placeCustomerOrder');
    const auth = await cookie();
    for (const header of ['', 'invalid']) {
      const response = await request(app)
        .post('/api/customer/orders')
        .set('Cookie', auth)
        .set('Idempotency-Key', header)
        .send(body);
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    }
    for (const invalid of [
      { ...body, userId },
      { ...body, vendorId: key },
      { ...body, lines: [...body.lines, ...body.lines] },
      { ...body, lines: [{ ...body.lines[0], quantity: -1 }] },
    ]) {
      expect(
        (
          await request(app)
            .post('/api/customer/orders')
            .set('Cookie', auth)
            .set('Idempotency-Key', key)
            .send(invalid)
        ).status,
      ).toBe(400);
    }
    expect(create).not.toHaveBeenCalled();
  });
  it('passes only session identity and validated values to placement', async () => {
    const create = vi
      .spyOn(service, 'placeCustomerOrder')
      .mockResolvedValue({ orderId: key } as Awaited<
        ReturnType<typeof service.placeCustomerOrder>
      >);
    const result = await request(app)
      .post('/api/customer/orders')
      .set('Cookie', await cookie())
      .set('Idempotency-Key', key)
      .send(body);
    expect(result.status).toBe(201);
    expect(create).toHaveBeenCalledWith(userId, key, body);
  });
  it('validates review/address, path UUIDs, pagination and cancellation body', async () => {
    const auth = await cookie();
    for (const path of [
      '/checkout/review?addressId=bad',
      '/orders?limit=101',
      '/orders?page=0',
      '/orders?page=1.5',
      '/orders?page=100001',
      '/orders?status=Shipped',
      '/orders?orderedFrom=2026-02-30',
      '/orders?orderedTo=not-a-date',
      '/orders?orderedFrom=0000-01-01',
      '/orders?orderedFrom=2026-11-20&orderedTo=2026-11-01',
      '/orders?status=Completed&status=Cancelled',
      '/orders/bad',
    ]) {
      expect((await request(app).get(`/api/customer${path}`).set('Cookie', auth)).status).toBe(400);
    }
    expect(
      (
        await request(app)
          .post(`/api/customer/orders/${key}/cancel`)
          .set('Cookie', auth)
          .send({ userId })
      ).status,
    ).toBe(400);
  });
  it('passes validated list filters with session identity', async () => {
    const list = vi.spyOn(service, 'listCustomerOrders').mockResolvedValue({
      items: [],
      pagination: { page: 2, limit: 20, total: 0, totalPages: 1 },
    });
    const result = await request(app)
      .get(
        '/api/customer/orders?page=2&status=Completed&orderedFrom=2026-11-01&orderedTo=2026-11-30',
      )
      .set('Cookie', await cookie());
    expect(result.status).toBe(200);
    expect(list).toHaveBeenCalledWith(userId, {
      page: 2,
      limit: 20,
      status: 'Completed',
      orderedFrom: '2026-11-01',
      orderedTo: '2026-11-30',
    });
  });
  it('returns safe actionable conflicts and hides unexpected internals', async () => {
    const create = vi
      .spyOn(service, 'placeCustomerOrder')
      .mockRejectedValueOnce(
        new AppError(409, 'CHECKOUT_CONFLICT', 'Review changed items.', {
          lines: [{ productId, unitPrice: '100.00', stock: 0, available: false }],
        }),
      )
      .mockRejectedValueOnce(new Error('internal database credential must never escape'));
    const auth = await cookie();
    const conflict = await request(app)
      .post('/api/customer/orders')
      .set('Cookie', auth)
      .set('Idempotency-Key', key)
      .send(body);
    expect(conflict.status).toBe(409);
    expect(conflict.body.details.lines[0].productId).toBe(productId);
    const failure = await request(app)
      .post('/api/customer/orders')
      .set('Cookie', auth)
      .set('Idempotency-Key', key)
      .send(body);
    expect(failure.status).toBe(500);
    expect(failure.body.requestId).toBeDefined();
    expect(JSON.stringify(failure.body)).not.toContain('credential');
    expect(create).toHaveBeenCalledTimes(2);
  });
});

describe('checkout request and customer status', () => {
  it('canonicalizes line order in fingerprints and includes address, quantity and price', () => {
    const second = { productId: key, quantity: 2, expectedUnitPrice: '1.00' };
    const input = { ...body, lines: [...body.lines, second] };
    expect(service.checkoutFingerprint(input)).toBe(
      service.checkoutFingerprint({ ...input, lines: [...input.lines].reverse() }),
    );
    expect(service.checkoutFingerprint(input)).not.toBe(
      service.checkoutFingerprint({ ...input, addressId: key }),
    );
    expect(service.checkoutFingerprint(input)).not.toBe(
      service.checkoutFingerprint({ ...input, lines: [{ ...body.lines[0], quantity: 2 }, second] }),
    );
    expect(service.checkoutFingerprint(input)).not.toBe(
      service.checkoutFingerprint({
        ...input,
        lines: [{ ...body.lines[0], expectedUnitPrice: '99.98' }, second],
      }),
    );
  });
  it('normalizes UUID case and rejects case-variant duplicate products', () => {
    const id = 'abcdefab-abcd-4abc-8abc-abcdefabcdef';
    expect(
      placeCustomerOrderSchema.safeParse({
        addressId,
        lines: [
          { productId: id, quantity: 1, expectedUnitPrice: '1.00' },
          { productId: id.toUpperCase(), quantity: 1, expectedUnitPrice: '1.00' },
        ],
      }).success,
    ).toBe(false);
    expect(customerOrderPaginationSchema.parse({})).toEqual({ page: 1, limit: 20 });
  });
  it.each([
    [['pending', 'pending'], 'Order placed'],
    [['pending', 'processing'], 'In progress'],
    [['pending', 'cancelled'], 'Partially cancelled'],
    [['processing', 'cancelled'], 'Partially cancelled'],
    [['completed', 'pending'], 'Partially fulfilled'],
    [['completed', 'cancelled'], 'Partially fulfilled'],
    [['completed', 'completed'], 'Completed'],
    [['cancelled', 'cancelled'], 'Cancelled'],
  ] as const)('maps %j to %s', (statuses, label) => {
    expect(customerOrderStatus([...statuses])).toBe(label);
  });
});
