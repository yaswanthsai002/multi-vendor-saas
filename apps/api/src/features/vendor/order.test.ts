import { SignJWT } from 'jose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../../app.js';

import * as orderService from './order.service.js';

const { db } = vi.hoisted(() => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
      vendors: {
        findFirst: vi.fn(),
      },
      orders: {
        findFirst: vi.fn(),
      },
      vendorOrders: {
        findFirst: vi.fn(),
      },
      orderDeliveryAddresses: {
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
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
        innerJoin: vi.fn(() => ({
          innerJoin: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve([])),
            leftJoin: vi.fn(() => ({
              where: vi.fn(() => ({
                groupBy: vi.fn(() => ({
                  orderBy: vi.fn(() => ({
                    limit: vi.fn(() => ({
                      offset: vi.fn(() => Promise.resolve([])),
                    })),
                  })),
                })),
              })),
            })),
          })),
        })),
        leftJoin: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            leftJoin: vi.fn(() => ({
              where: vi.fn(() => Promise.resolve([])),
            })),
          })),
        })),
      })),
    })),
    transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb(db)),
  },
}));

vi.mock('@repo/db', () => ({
  getDb: vi.fn(() => db),
}));

describe('Vendor Orders API & Service (/api/vendor/orders)', () => {
  const secret = new TextEncoder().encode('test-jwt-secret-key-32-chars-long!');
  const userId = '11111111-1111-4111-8111-111111111111';
  const vendorId = '22222222-2222-4222-8222-222222222222';
  const otherVendorId = '33333333-3333-4333-8333-333333333333';
  const orderId = '44444444-4444-4444-8444-444444444444';
  const vendorOrderId = '55555555-5555-4555-8555-555555555555';

  async function createAuthCookie(userSub: string): Promise<string> {
    const secretKey = new TextEncoder().encode(
      process.env.JWT_SECRET || 'test-jwt-secret-key-32-chars-long!',
    );
    const token = await new SignJWT({
      roles: ['vendor', 'customer'],
    })
      .setProtectedHeader({ alg: 'HS512' })
      .setSubject(userSub)
      .setIssuer('perigee-api')
      .setAudience('perigee-web-app')
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secretKey);

    return `auth_token=${token}`;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret-key-32-chars-long!';

    // Default mock: valid user with vendor role
    db.query.users.findFirst.mockResolvedValue({
      userId,
      email: 'vendor@example.com',
      roles: ['vendor', 'customer'],
      name: 'Vendor Owner',
      status: 'active',
    });

    // Default mock: active vendor owned by user
    db.query.vendors.findFirst.mockResolvedValue({
      vendorId,
      userId,
      name: 'Acme Store',
      slug: 'acme-store',
      status: 'active',
    });
  });

  describe('Parent Order Status Aggregation Unit Tests', () => {
    it('returns cancelled if all vendor orders are cancelled', () => {
      expect(orderService.calculateParentOrderStatus(['cancelled', 'cancelled'])).toBe('cancelled');
    });

    it('returns completed if all vendor orders are completed', () => {
      expect(orderService.calculateParentOrderStatus(['completed', 'completed'])).toBe('completed');
    });

    it('returns completed if mix of completed and cancelled (at least 1 completed)', () => {
      expect(orderService.calculateParentOrderStatus(['completed', 'cancelled'])).toBe('completed');
    });

    it('returns confirmed if any vendor order is processing', () => {
      expect(orderService.calculateParentOrderStatus(['pending', 'processing'])).toBe('confirmed');
    });

    it('returns pending if all vendor orders are pending', () => {
      expect(orderService.calculateParentOrderStatus(['pending', 'pending'])).toBe('pending');
    });
  });

  describe('Allowed Actions Unit Tests', () => {
    it('returns process and cancel for pending orders', () => {
      expect(orderService.getAllowedOrderActions('pending')).toEqual(['process', 'cancel']);
    });

    it('returns complete and cancel for processing orders', () => {
      expect(orderService.getAllowedOrderActions('processing')).toEqual(['complete', 'cancel']);
    });

    it('returns empty array for completed and cancelled terminal orders', () => {
      expect(orderService.getAllowedOrderActions('completed')).toEqual([]);
      expect(orderService.getAllowedOrderActions('cancelled')).toEqual([]);
    });
  });

  describe('GET /api/vendor/orders', () => {
    it('requires authentication and vendor role', async () => {
      const res = await request(app).get('/api/vendor/orders');
      expect(res.status).toBe(401);
    });

    it('returns vendor-scoped orders listing with pagination and counts', async () => {
      const mockListResult = {
        items: [
          {
            vendorOrderId,
            orderNumber: 'ORD-10001',
            customer: { name: 'Customer One', email: 'customer@example.com' },
            itemCount: 2,
            total: '199.98',
            placedAt: new Date().toISOString(),
            status: 'pending',
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        statusCounts: { all: 1, pending: 1, processing: 0, completed: 0, cancelled: 0 },
      };

      vi.spyOn(orderService, 'listVendorOrders').mockResolvedValue(mockListResult);

      const cookie = await createAuthCookie(userId);
      const res = await request(app).get('/api/vendor/orders').set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].orderNumber).toBe('ORD-10001');
      expect(res.body.data.statusCounts.pending).toBe(1);
    });

    it('passes search, status, and sorting filters to service', async () => {
      const listSpy = vi.spyOn(orderService, 'listVendorOrders').mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        statusCounts: { all: 0, pending: 0, processing: 0, completed: 0, cancelled: 0 },
      });

      const cookie = await createAuthCookie(userId);
      const res = await request(app)
        .get('/api/vendor/orders?page=1&limit=10&status=processing&search=ORD-100&sort=total_desc')
        .set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(listSpy).toHaveBeenCalledWith(vendorId, {
        page: 1,
        limit: 10,
        status: 'processing',
        search: 'ORD-100',
        sort: 'total_desc',
      });
    });
  });

  describe('GET /api/vendor/orders/:vendorOrderId', () => {
    it('returns 400 for invalid UUID vendorOrderId', async () => {
      const cookie = await createAuthCookie(userId);
      const res = await request(app).get('/api/vendor/orders/invalid-uuid').set('Cookie', [cookie]);

      expect(res.status).toBe(400);
    });

    it('returns 404 if order does not belong to vendor', async () => {
      db.query.vendorOrders.findFirst.mockResolvedValue(null);

      const cookie = await createAuthCookie(userId);
      const res = await request(app)
        .get(`/api/vendor/orders/${vendorOrderId}`)
        .set('Cookie', [cookie]);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('ORDER_NOT_FOUND');
    });

    it('returns full order detail for authorized vendor', async () => {
      const mockDetail: orderService.VendorOrderDetail = {
        order: {
          orderNumber: 'ORD-10042',
          placedAt: new Date().toISOString(),
          overallStatus: 'pending',
        },
        fulfillment: {
          vendorOrderId,
          status: 'pending',
          updatedAt: new Date().toISOString(),
          completedAt: null,
          cancellationReason: null,
          allowedActions: ['process', 'cancel'],
        },
        customer: {
          name: 'Jane Customer',
          email: 'jane@example.com',
          phone: '+1 555-1234',
        },
        deliveryAddress: {
          recipientName: 'Jane Customer',
          phone: '+1 555-1234',
          addressLine1: '456 Elm St',
          addressLine2: null,
          city: 'Metropolis',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        items: [
          {
            orderItemId: 'item-1',
            productId: 'prod-1',
            productName: 'Ergonomic Desk Chair',
            productImageUrl: null,
            unitPrice: '149.99',
            quantity: 1,
            subtotal: '149.99',
          },
        ],
        summary: {
          itemCount: 1,
          total: '149.99',
        },
      };

      vi.spyOn(orderService, 'getVendorOrderDetail').mockResolvedValue(mockDetail);

      const cookie = await createAuthCookie(userId);
      const res = await request(app)
        .get(`/api/vendor/orders/${vendorOrderId}`)
        .set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.orderNumber).toBe('ORD-10042');
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.fulfillment.allowedActions).toContain('process');
    });
  });

  describe('POST /api/vendor/orders/:vendorOrderId/status', () => {
    it('rejects invalid status transitions with 400', async () => {
      db.query.vendorOrders.findFirst.mockResolvedValue({
        vendorOrderId,
        orderId,
        vendorId,
        status: 'completed', // Terminal state
      });

      const cookie = await createAuthCookie(userId);
      const res = await request(app)
        .post(`/api/vendor/orders/${vendorOrderId}/status`)
        .set('Cookie', [cookie])
        .send({ status: 'processing' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_ORDER_STATUS_TRANSITION');
    });

    it('rejects illegal transition from pending to completed', async () => {
      db.query.vendorOrders.findFirst.mockResolvedValue({
        vendorOrderId,
        orderId,
        vendorId,
        status: 'pending',
      });

      const cookie = await createAuthCookie(userId);
      const res = await request(app)
        .post(`/api/vendor/orders/${vendorOrderId}/status`)
        .set('Cookie', [cookie])
        .send({ status: 'completed' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_ORDER_STATUS_TRANSITION');
    });

    it('successfully transitions from pending to processing and updates parent status', async () => {
      const mockUpdatedDetail: orderService.VendorOrderDetail = {
        order: {
          orderNumber: 'ORD-10042',
          placedAt: new Date().toISOString(),
          overallStatus: 'confirmed',
        },
        fulfillment: {
          vendorOrderId,
          status: 'processing',
          updatedAt: new Date().toISOString(),
          completedAt: null,
          cancellationReason: null,
          allowedActions: ['complete', 'cancel'],
        },
        customer: {
          name: 'Jane Customer',
          email: 'jane@example.com',
          phone: null,
        },
        deliveryAddress: null,
        items: [],
        summary: {
          itemCount: 1,
          total: '99.00',
        },
      };

      vi.spyOn(orderService, 'updateVendorOrderStatus').mockResolvedValue(mockUpdatedDetail);

      const cookie = await createAuthCookie(userId);
      const res = await request(app)
        .post(`/api/vendor/orders/${vendorOrderId}/status`)
        .set('Cookie', [cookie])
        .send({ status: 'processing' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fulfillment.status).toBe('processing');
    });

    it('accepts cancellation with reason', async () => {
      const mockCancelledDetail: orderService.VendorOrderDetail = {
        order: {
          orderNumber: 'ORD-10042',
          placedAt: new Date().toISOString(),
          overallStatus: 'cancelled',
        },
        fulfillment: {
          vendorOrderId,
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
          completedAt: null,
          cancellationReason: 'Out of stock inventory',
          allowedActions: [],
        },
        customer: {
          name: 'Jane Customer',
          email: 'jane@example.com',
          phone: null,
        },
        deliveryAddress: null,
        items: [],
        summary: {
          itemCount: 1,
          total: '99.00',
        },
      };

      vi.spyOn(orderService, 'updateVendorOrderStatus').mockResolvedValue(mockCancelledDetail);

      const cookie = await createAuthCookie(userId);
      const res = await request(app)
        .post(`/api/vendor/orders/${vendorOrderId}/status`)
        .set('Cookie', [cookie])
        .send({ status: 'cancelled', cancellationReason: 'Out of stock inventory' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fulfillment.status).toBe('cancelled');
      expect(res.body.data.fulfillment.cancellationReason).toBe('Out of stock inventory');
    });
  });
});
