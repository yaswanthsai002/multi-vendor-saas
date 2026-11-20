import { randomUUID } from 'node:crypto';

import { getDb } from '@repo/db';
import {
  carts,
  cartItems,
  customerAddresses,
  mediaLibrary,
  orderDeliveryAddresses,
  orderItems,
  orders,
  products,
  users,
  vendorOrders,
  vendorOrderNotifications,
  vendors,
  campaigns,
  campaignProducts,
} from '@repo/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { checkoutTestDatabaseUrl } from '../../shared/config/test-database.js';
import { sendEmail } from '../../shared/email/email.service.js';
import { sendOrderEmail } from '../../shared/orders/order-email.js';
import { adminService } from '../admin/admin.service.js';
import { addItem, setItem } from '../cart/cart.service.js';
import { publishPromotionDraft } from '../merchandising/merchandising.service.js';
import { notificationListQuerySchema } from '../vendor/notifications.schema.js';
import {
  listNotifications,
  readNotification,
  readOrderNotifications,
  deleteNotification,
} from '../vendor/notifications.service.js';
import {
  updateVendorOrderStatus as applyVendorOrderStatus,
  listVendorOrders,
} from '../vendor/order.service.js';

import {
  cancelCustomerOrder,
  getCustomerOrder,
  listCustomerOrders,
  placeCustomerOrder,
  reviewCheckout,
} from './customer-order.service.js';

vi.mock('../../shared/email/email.service.js', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../shared/orders/order-email.js', () => ({
  sendOrderEmail: vi.fn().mockResolvedValue(undefined),
}));

async function updateVendorOrderStatus(
  vendorId: string,
  vendorOrderId: string,
  input: { status: 'processing' | 'completed' | 'cancelled' },
) {
  const saved = await getDb()
    .select()
    .from(orderItems)
    .where(eq(orderItems.vendorOrderId, vendorOrderId));
  return applyVendorOrderStatus({
    vendorId,
    vendorOrderId,
    actorUserId: f.owner.userId,
    input:
      input.status === 'cancelled'
        ? {
            status: 'cancelled',
            cancellationReasonCode: 'OPERATIONAL_ISSUE',
            items: saved.map((item) => ({
              orderItemId: item.orderItemId,
              damagedQuantity: 0,
              missingQuantity: 0,
            })),
          }
        : { status: input.status },
  });
}

const namespace = `checkout_test_${randomUUID().replaceAll('-', '')}`;
type Fixture = Awaited<ReturnType<typeof fixture>>;
let f: Fixture;

async function fixture(stock = 5) {
  const db = getDb();
  const [customer] = await db
    .insert(users)
    .values({ fullName: 'Customer', email: `${randomUUID()}@example.test` })
    .returning();
  const [owner] = await db
    .insert(users)
    .values({ fullName: 'Vendor', email: `${randomUUID()}@example.test`, roles: ['vendor'] })
    .returning();
  const [vendor] = await db
    .insert(vendors)
    .values({ userId: owner.userId, name: 'Vendor', slug: randomUUID(), status: 'active' })
    .returning();
  const [product] = await db
    .insert(products)
    .values({
      vendorId: vendor.vendorId,
      name: 'Lamp',
      slug: randomUUID(),
      description: 'Lamp',
      price: '100.10',
      mrp: '120.00',
      stock,
      published: true,
    })
    .returning();
  const [address] = await db
    .insert(customerAddresses)
    .values({
      userId: customer.userId,
      recipientName: 'Customer',
      phone: '9876543210',
      addressLine1: 'Street 1',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500001',
      isDefault: true,
    })
    .returning();
  const [cart] = await db.insert(carts).values({ userId: customer.userId }).returning();
  await db
    .insert(cartItems)
    .values({ cartId: cart.cartId, productId: product.productId, quantity: 1 });
  const input = {
    addressId: address.addressId,
    lines: [{ productId: product.productId, quantity: 1, expectedUnitPrice: '100.10' }],
  };
  return { customer, owner, vendor, product, address, cart, input };
}

async function stock(productId = f.product.productId) {
  const [row] = await getDb()
    .select({ stock: products.stock })
    .from(products)
    .where(eq(products.productId, productId));
  return row.stock;
}

async function portion(orderId: string) {
  const [row] = await getDb().select().from(vendorOrders).where(eq(vendorOrders.orderId, orderId));
  return row;
}

async function assertNoPlacement() {
  const ownOrders = getDb()
    .select({ id: orders.orderId })
    .from(orders)
    .where(eq(orders.userId, f.customer.userId));
  expect(await ownOrders).toHaveLength(0);
  expect(
    await getDb().select().from(orderItems).where(eq(orderItems.productId, f.product.productId)),
  ).toHaveLength(0);
  expect(
    await getDb()
      .select()
      .from(orderDeliveryAddresses)
      .where(inArray(orderDeliveryAddresses.orderId, ownOrders)),
  ).toHaveLength(0);
  expect(
    await getDb().select().from(cartItems).where(eq(cartItems.cartId, f.cart.cartId)),
  ).toHaveLength(1);
  expect(await stock()).toBe(5);
}

async function waitForLock() {
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    const waiting = await getDb().execute(
      sql`SELECT 1 FROM pg_stat_activity WHERE datname = current_database() AND usename = current_user AND application_name = ${namespace} AND wait_event_type = 'Lock'`,
    );
    if (waiting.length) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error('Expected concurrent request to wait on a PostgreSQL lock.');
}

describe
  .skipIf(!checkoutTestDatabaseUrl)
  .sequential('customer checkout PostgreSQL integration', () => {
    beforeAll(async () => {
      if (!checkoutTestDatabaseUrl) throw new Error('Explicit test database required.');
      const target = new URL(checkoutTestDatabaseUrl);
      if (!['localhost', '127.0.0.1', '[::1]'].includes(target.hostname))
        throw new Error('Checkout integration tests require localhost.');
      if (target.pathname !== '/perigee_test')
        throw new Error('Use a disposable perigee_test database.');
      target.searchParams.set('options', '-clock_timeout=10000 -cclient_min_messages=warning');
      target.searchParams.set('application_name', namespace);
      vi.stubEnv('DATABASE_URL', target.toString());
      await getDb().execute(sql`SELECT 1 FROM users LIMIT 1`);
    }, 30000);

    beforeEach(async () => {
      vi.mocked(sendOrderEmail).mockClear();
      f = await fixture();
    });

    afterAll(async () => {
      await getDb().$client.end();
      vi.unstubAllEnvs();
    });

    it('keeps deleted notifications deleted on checkout retry and enforces owned read/delete', async () => {
      const key = randomUUID();
      const order = await placeCustomerOrder(f.customer.userId, key, f.input);
      const inbox = await listNotifications(f.vendor.vendorId, { limit: 20 });
      expect(inbox.items).toHaveLength(1);
      expect(inbox.items[0].summary).toEqual({
        items: [{ name: 'Lamp', quantity: 1 }],
        itemCount: 1,
        productCount: 1,
      });
      expect(inbox.unreadCount).toBe(1);
      const id = inbox.items[0].notificationId;
      const foreign = await fixture();
      await readNotification(foreign.vendor.vendorId, id);
      await deleteNotification(foreign.vendor.vendorId, id);
      expect((await listNotifications(f.vendor.vendorId, { limit: 20 })).unreadCount).toBe(1);
      await readNotification(f.vendor.vendorId, id);
      const firstRead = (await listNotifications(f.vendor.vendorId, { limit: 20 })).items[0].readAt;
      await readNotification(f.vendor.vendorId, id);
      expect((await listNotifications(f.vendor.vendorId, { limit: 20 })).items[0].readAt).toBe(
        firstRead,
      );
      await deleteNotification(f.vendor.vendorId, id);
      await deleteNotification(f.vendor.vendorId, id);
      expect((await placeCustomerOrder(f.customer.userId, key, f.input)).orderId).toBe(
        order.orderId,
      );
      expect((await listNotifications(f.vendor.vendorId, { limit: 20 })).items).toEqual([]);
      await cancelCustomerOrder(f.customer.userId, order.orderId);
      const cancelled = await listNotifications(f.vendor.vendorId, { limit: 20 });
      expect(cancelled.items.map((item) => item.type)).toEqual(['customer_cancelled']);
      await deleteNotification(f.vendor.vendorId, cancelled.items[0].notificationId);
      await cancelCustomerOrder(f.customer.userId, order.orderId);
      expect((await listNotifications(f.vendor.vendorId, { limit: 20 })).items).toEqual([]);
    });

    it('limits item previews to two snapshots and keeps summaries vendor-owned', async () => {
      const order = await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
      const vo = await portion(order.orderId);
      await getDb()
        .insert(orderItems)
        .values(
          ['Second product', 'Third product'].map((name) => ({
            vendorOrderId: vo.vendorOrderId,
            productId: f.product.productId,
            productNameSnapshot: name,
            productQuantity: 2,
            productPriceSnapshot: '10.00',
          })),
        );
      const query = { page: 1, limit: 20, status: 'all' as const, sort: 'newest' as const };
      const list = await listVendorOrders(f.vendor.vendorId, query);
      expect(list.items[0].summary.items).toHaveLength(2);
      expect(list.items[0].summary).toMatchObject({ itemCount: 5, productCount: 3 });
      const inbox = await listNotifications(f.vendor.vendorId, { limit: 20 });
      expect(inbox.items[0].summary).toEqual(list.items[0].summary);
      const foreign = await fixture();
      expect((await listVendorOrders(foreign.vendor.vendorId, query)).items).toEqual([]);
      expect((await listNotifications(foreign.vendor.vendorId, { limit: 20 })).items).toEqual([]);
    });

    it('marks an opened order read idempotently and leaves unseen cancellations unread', async () => {
      const order = await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
      const vo = await portion(order.orderId);
      const foreign = await fixture();
      expect(
        await readOrderNotifications(foreign.vendor.vendorId, vo.vendorOrderId, 'pending'),
      ).toBe(false);
      expect((await listNotifications(f.vendor.vendorId, { limit: 20 })).unreadCount).toBe(1);
      expect(await readOrderNotifications(f.vendor.vendorId, vo.vendorOrderId, 'pending')).toBe(
        true,
      );
      const first = (await listNotifications(f.vendor.vendorId, { limit: 20 })).items[0].readAt;
      expect(await readOrderNotifications(f.vendor.vendorId, vo.vendorOrderId, 'pending')).toBe(
        false,
      );
      expect((await listNotifications(f.vendor.vendorId, { limit: 20 })).items[0].readAt).toBe(
        first,
      );
      await cancelCustomerOrder(f.customer.userId, order.orderId);
      expect(await readOrderNotifications(f.vendor.vendorId, vo.vendorOrderId, 'pending')).toBe(
        false,
      );
      expect((await listNotifications(f.vendor.vendorId, { limit: 20 })).unreadCount).toBe(1);
      expect(await readOrderNotifications(f.vendor.vendorId, vo.vendorOrderId, 'cancelled')).toBe(
        true,
      );
      expect((await listNotifications(f.vendor.vendorId, { limit: 20 })).unreadCount).toBe(0);
    });

    it('pages equal-timestamp notifications without gaps and counts unread beyond the page', async () => {
      await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
      await addItem(f.customer.userId, { productId: f.product.productId, quantity: 1 });
      await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
      await getDb()
        .update(vendorOrderNotifications)
        .set({ createdAt: new Date('2026-11-19T00:00:00.123Z') })
        .where(
          inArray(
            vendorOrderNotifications.vendorOrderId,
            getDb()
              .select({ id: vendorOrders.vendorOrderId })
              .from(vendorOrders)
              .where(eq(vendorOrders.vendorId, f.vendor.vendorId)),
          ),
        );
      const first = await listNotifications(f.vendor.vendorId, { limit: 1 });
      expect(first.unreadCount).toBe(2);
      expect(first.nextCursor).not.toBeNull();
      const second = await listNotifications(
        f.vendor.vendorId,
        notificationListQuerySchema.parse({ limit: 1, cursor: first.nextCursor }),
      );
      expect(second.items).toHaveLength(1);
      expect(second.items[0].notificationId).not.toBe(first.items[0].notificationId);
      expect(second.nextCursor).toBeNull();
      expect(second.unreadCount).toBe(2);
      const empty = await listNotifications(f.vendor.vendorId, {
        limit: 1,
        cursor: {
          createdAt: '2020-01-01T00:00:00.000Z',
          notificationId: first.items[0].notificationId,
        },
      });
      expect(empty.items).toEqual([]);
      expect(empty.unreadCount).toBe(2);
    });

    it('returns only sellable units and preserves cancellation evidence on retry', async () => {
      await setItem(f.customer.userId, f.product.productId, 3);
      const input = { ...f.input, lines: f.input.lines.map((line) => ({ ...line, quantity: 3 })) };
      const order = await placeCustomerOrder(f.customer.userId, randomUUID(), input);
      const vo = await portion(order.orderId);
      await updateVendorOrderStatus(f.vendor.vendorId, vo.vendorOrderId, { status: 'processing' });
      const action = {
        vendorId: f.vendor.vendorId,
        actorUserId: f.owner.userId,
        vendorOrderId: vo.vendorOrderId,
        input: {
          status: 'cancelled' as const,
          cancellationReasonCode: 'OTHER' as const,
          cancellationDetails: 'Private stock audit detail',
          items: [
            { orderItemId: order.items[0].orderItemId, damagedQuantity: 1, missingQuantity: 1 },
          ],
        },
      };
      const result = await applyVendorOrderStatus(action);
      expect(await stock()).toBe(3);
      expect(result.items[0].cancellationQuantities).toEqual({
        returnedQuantity: 1,
        damagedQuantity: 1,
        missingQuantity: 1,
      });
      expect(JSON.stringify(result)).not.toContain('Private stock audit detail');
      const before = await getDb().query.vendorOrders.findFirst({
        where: eq(vendorOrders.vendorOrderId, vo.vendorOrderId),
      });
      await applyVendorOrderStatus(action);
      expect(await stock()).toBe(3);
      expect(
        (
          await getDb().query.vendorOrders.findFirst({
            where: eq(vendorOrders.vendorOrderId, vo.vendorOrderId),
          })
        )?.cancelledAt,
      ).toEqual(before?.cancelledAt);
      await expect(
        applyVendorOrderStatus({
          ...action,
          input: { ...action.input, cancellationDetails: 'Changed detail' },
        }),
      ).rejects.toMatchObject({ code: 'CANCELLATION_ALREADY_RECORDED' });
      const customer = await getCustomerOrder(f.customer.userId, order.orderId);
      expect(customer.fulfillments[0].cancellation?.reason).toBe(
        'Seller unable to fulfill these items',
      );
      expect(JSON.stringify(customer)).not.toContain('cancellationDetails');
      expect(JSON.stringify(customer)).not.toContain('damagedQuantity');
      const admin = await adminService.getOrderDetail(order.orderId);
      expect(admin.fulfillments[0]).toMatchObject({
        cancellationDetails: 'Private stock audit detail',
        cancelledByUserId: f.owner.userId,
        items: [
          {
            cancellationReturnedQuantity: 1,
            cancellationDamagedQuantity: 1,
            cancellationMissingQuantity: 1,
          },
        ],
      });
    });

    it('uses real constraints for evidence and notification uniqueness', async () => {
      const order = await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
      const vo = await portion(order.orderId);
      await expect(
        getDb()
          .insert(vendorOrderNotifications)
          .values({ vendorOrderId: vo.vendorOrderId, type: 'new_order' }),
      ).rejects.toMatchObject({ cause: { code: '23505' } });
      await expect(
        getDb()
          .update(vendorOrders)
          .set({ status: 'cancelled' })
          .where(eq(vendorOrders.vendorOrderId, vo.vendorOrderId)),
      ).rejects.toMatchObject({ cause: { code: '23514' } });
      for (const quantities of [
        {
          cancellationReturnedQuantity: 0,
          cancellationDamagedQuantity: null,
          cancellationMissingQuantity: null,
        },
        {
          cancellationReturnedQuantity: 2,
          cancellationDamagedQuantity: -1,
          cancellationMissingQuantity: 0,
        },
        {
          cancellationReturnedQuantity: 2147483647,
          cancellationDamagedQuantity: 2147483647,
          cancellationMissingQuantity: 2147483647,
        },
      ])
        await expect(
          getDb()
            .update(orderItems)
            .set(quantities)
            .where(eq(orderItems.orderItemId, order.items[0].orderItemId)),
        ).rejects.toMatchObject({ cause: { code: '23514' } });
    });

    it('emails only the order owner with persisted item snapshots and exact totals', async () => {
      const created = await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
      const other = await fixture();
      await getDb()
        .update(products)
        .set({ name: 'Other customer item' })
        .where(eq(products.productId, other.product.productId));
      await placeCustomerOrder(other.customer.userId, randomUUID(), other.input);
      await getDb()
        .update(products)
        .set({ name: 'Changed product', price: '110.00' })
        .where(eq(products.productId, f.product.productId));
      vi.stubEnv('EMAIL_USER', 'test@example.com');
      vi.stubEnv('EMAIL_PASS', 'test-app-password');
      vi.stubEnv('WEB_ORIGIN', 'https://perigee.example');
      const actual = await vi.importActual<{ sendOrderEmail: typeof sendOrderEmail }>(
        '../../shared/orders/order-email.js',
      );
      await actual.sendOrderEmail(created.orderId, 'placed');
      expect(sendEmail).toHaveBeenCalledTimes(1);
      const message = vi.mocked(sendEmail).mock.calls[0][0];
      expect(message.to).toBe(f.customer.email);
      expect(message.text).toContain('Lamp');
      expect(message.text).toContain('100.10');
      expect(message.text).toContain('Original order total: \u20b9100.10');
      expect(message.text).not.toContain('Changed product');
      expect(message.text).not.toContain('Other customer item');
      expect(message.html).toContain('100.10');
    });

    it('includes both vendor portions and marks only the affected items in an order update', async () => {
      const other = await fixture();
      await getDb()
        .update(products)
        .set({ name: 'Book' })
        .where(eq(products.productId, other.product.productId));
      await getDb()
        .insert(cartItems)
        .values({ cartId: f.cart.cartId, productId: other.product.productId, quantity: 2 });
      const input = {
        ...f.input,
        lines: [
          ...f.input.lines,
          { productId: other.product.productId, quantity: 2, expectedUnitPrice: '100.10' },
        ],
      };
      const created = await placeCustomerOrder(f.customer.userId, randomUUID(), input);
      const portions = await getDb()
        .select()
        .from(vendorOrders)
        .where(eq(vendorOrders.orderId, created.orderId));
      const affected = portions.find((part) => part.vendorId === f.vendor.vendorId);
      expect(affected).toBeDefined();
      vi.stubEnv('EMAIL_USER', 'test@example.com');
      vi.stubEnv('EMAIL_PASS', 'test-app-password');
      vi.stubEnv('WEB_ORIGIN', 'https://perigee.example');
      const actual = await vi.importActual<{ sendOrderEmail: typeof sendOrderEmail }>(
        '../../shared/orders/order-email.js',
      );
      await actual.sendOrderEmail(created.orderId, 'processing', affected!.vendorOrderId);
      const message = vi.mocked(sendEmail).mock.calls.at(-1)?.[0];
      expect(message?.to).toBe(f.customer.email);
      expect(message?.text).toContain(
        'Lamp \u2014 1 \u00d7 \u20b9100.10 \u2014 Subtotal \u20b9100.10 \u2014 affected by this update',
      );
      expect(message?.text).toContain(
        'Book \u2014 2 \u00d7 \u20b9100.10 \u2014 Subtotal \u20b9200.20',
      );
      expect(message?.text).toContain('Original order total: \u20b9300.30');
      expect(message?.text).not.toContain(
        'Book \u2014 2 \u00d7 \u20b9100.10 \u2014 Subtotal \u20b9200.20 \u2014 affected',
      );
    });

    it('places snapshots with exact totals, empties cart, and replays same-key request after cart deletion', async () => {
      const key = randomUUID();
      const order = await placeCustomerOrder(f.customer.userId, key, f.input);
      expect(order).toMatchObject({
        status: 'Order placed',
        total: '100.10',
        address: { country: 'IN' },
        canCancel: true,
      });
      expect(order.items[0]).toMatchObject({
        name: 'Lamp',
        unitPrice: '100.10',
        quantity: 1,
        productSlug: f.product.slug,
      });
      expect(JSON.stringify(order)).not.toMatch(
        /vendorOrderId|requestFingerprint|requestKey|passwordHash/,
      );
      expect(await stock()).toBe(4);
      expect(
        await getDb().select().from(cartItems).where(eq(cartItems.cartId, f.cart.cartId)),
      ).toHaveLength(0);
      expect((await placeCustomerOrder(f.customer.userId, key, f.input)).orderId).toBe(
        order.orderId,
      );
      expect(sendOrderEmail).toHaveBeenCalledTimes(1);
      expect(sendOrderEmail).toHaveBeenCalledWith(order.orderId, 'placed');
      await expect(
        placeCustomerOrder(f.customer.userId, key, {
          ...f.input,
          lines: [{ ...f.input.lines[0], quantity: 2 }],
        }),
      ).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
      await getDb()
        .update(products)
        .set({ name: 'Renamed', slug: `renamed-${f.product.productId}`, price: '101.00' })
        .where(eq(products.productId, f.product.productId));
      expect((await getCustomerOrder(f.customer.userId, order.orderId)).items[0]).toMatchObject({
        name: 'Lamp',
        unitPrice: '100.10',
        productSlug: `renamed-${f.product.productId}`,
      });
    });

    it('rejects stale prices without any partial writes', async () => {
      await expect(
        placeCustomerOrder(f.customer.userId, randomUUID(), {
          ...f.input,
          lines: [{ ...f.input.lines[0], expectedUnitPrice: '99.00' }],
        }),
      ).rejects.toMatchObject({
        code: 'CHECKOUT_CONFLICT',
        details: { lines: [{ productId: f.product.productId, stock: 5, unitPrice: '100.10' }] },
      });
      await assertNoPlacement();
      expect(sendOrderEmail).not.toHaveBeenCalled();
    });

    it('returns product thumbnails without exposing internal media fields', async () => {
      const db = getDb();
      expect((await reviewCheckout(f.customer.userId)).lines[0].imageUrl).toBeNull();
      const [media] = await db
        .insert(mediaLibrary)
        .values({
          vendorId: f.vendor.vendorId,
          createdBy: f.owner.userId,
          mediaType: 'image',
          originalFileName: 'lamp.jpg',
          mimeType: 'image/jpeg',
          fileSizeBytes: 100,
          originalStorageKey: 'lamp.jpg',
        })
        .returning();
      await db
        .update(products)
        .set({ productImageId: media.mediaId })
        .where(eq(products.productId, f.product.productId));
      const line = (await reviewCheckout(f.customer.userId)).lines[0];
      expect(line.imageUrl).toContain(
        `vendors/${f.vendor.vendorId}/media/${media.mediaId}/thumbnail.webp`,
      );
      expect(line).not.toHaveProperty('mediaId');
      expect(line).not.toHaveProperty('mediaVendorId');
      expect(line).not.toHaveProperty('vendorId');
      const order = await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
      expect(order.items[0].imageUrl).toBe(line.imageUrl);
      expect(order.items[0]).not.toHaveProperty('mediaId');
      expect(order.items[0]).not.toHaveProperty('mediaVendorId');
      await db
        .update(products)
        .set({ productImageId: null })
        .where(eq(products.productId, f.product.productId));
      const saved = await getCustomerOrder(f.customer.userId, order.orderId);
      expect(saved.items[0]).toMatchObject({ imageUrl: null, name: 'Lamp', unitPrice: '100.10' });
    });

    it('keeps maximum numeric prices and large multi-line totals exact', async () => {
      const db = getDb();
      const quantity = 2147483647;
      await db.delete(cartItems).where(eq(cartItems.cartId, f.cart.cartId));
      const lines = [];
      for (let index = 0; index < 6; index++) {
        const [product] = await db
          .insert(products)
          .values({
            vendorId: f.vendor.vendorId,
            name: `Product ${index}`,
            slug: randomUUID(),
            description: 'Product',
            price: '9999999999.99',
            mrp: '9999999999.99',
            stock: quantity,
            published: true,
          })
          .returning();
        await db
          .insert(cartItems)
          .values({ cartId: f.cart.cartId, productId: product.productId, quantity });
        lines.push({ productId: product.productId, quantity, expectedUnitPrice: '9999999999.99' });
      }
      const order = await placeCustomerOrder(f.customer.userId, randomUUID(), {
        addressId: f.address.addressId,
        lines,
      });
      const cents = 999999999999n * BigInt(quantity) * 6n;
      expect(order.total).toBe(`${cents / 100n}.${String(cents % 100n).padStart(2, '0')}`);
    });

    it('rejects foreign addresses, non-Indian addresses, inactive accounts and non-customers', async () => {
      const other = await fixture();
      await expect(
        placeCustomerOrder(f.customer.userId, randomUUID(), {
          ...f.input,
          addressId: other.address.addressId,
        }),
      ).rejects.toMatchObject({ code: 'INVALID_DELIVERY_ADDRESS' });
      await getDb()
        .update(customerAddresses)
        .set({ country: 'US' })
        .where(eq(customerAddresses.addressId, f.address.addressId));
      await expect(
        placeCustomerOrder(f.customer.userId, randomUUID(), f.input),
      ).rejects.toMatchObject({ code: 'INVALID_DELIVERY_ADDRESS' });
      await getDb()
        .update(users)
        .set({ status: 'suspended' })
        .where(eq(users.userId, f.customer.userId));
      await expect(reviewCheckout(f.customer.userId)).rejects.toMatchObject({
        code: 'ACCOUNT_INACTIVE',
      });
      await expect(
        placeCustomerOrder(f.customer.userId, randomUUID(), f.input),
      ).rejects.toMatchObject({ code: 'ACCOUNT_INACTIVE' });
      await expect(
        listCustomerOrders(f.owner.userId, { page: 1, limit: 20 }),
      ).rejects.toMatchObject({
        code: 'CUSTOMER_REQUIRED',
      });
    });

    it.each([
      'unpublished',
      'deleted',
      'moderated',
      'vendor suspended',
      'owner suspended',
      'insufficient stock',
    ])('rejects %s product', async (reason) => {
      if (reason === 'unpublished')
        await getDb()
          .update(products)
          .set({ published: false })
          .where(eq(products.productId, f.product.productId));
      if (reason === 'deleted')
        await getDb()
          .update(products)
          .set({ isSoftDeleted: true })
          .where(eq(products.productId, f.product.productId));
      if (reason === 'moderated')
        await getDb()
          .update(products)
          .set({ moderationStatus: 'hidden' })
          .where(eq(products.productId, f.product.productId));
      if (reason === 'vendor suspended')
        await getDb()
          .update(vendors)
          .set({ status: 'suspended' })
          .where(eq(vendors.vendorId, f.vendor.vendorId));
      if (reason === 'owner suspended')
        await getDb()
          .update(users)
          .set({ status: 'suspended' })
          .where(eq(users.userId, f.owner.userId));
      if (reason === 'insufficient stock')
        await getDb()
          .update(products)
          .set({ stock: 0 })
          .where(eq(products.productId, f.product.productId));
      await expect(
        placeCustomerOrder(f.customer.userId, randomUUID(), f.input),
      ).rejects.toMatchObject({ code: 'CHECKOUT_CONFLICT' });
      expect(
        await getDb().select().from(orders).where(eq(orders.userId, f.customer.userId)),
      ).toHaveLength(0);
      expect(
        await getDb().select().from(cartItems).where(eq(cartItems.cartId, f.cart.cartId)),
      ).toHaveLength(1);
    });

    it('serializes same-key concurrent placement and different keys for the same cart', async () => {
      const key = randomUUID();
      const results = await Promise.all([
        placeCustomerOrder(f.customer.userId, key, f.input),
        placeCustomerOrder(f.customer.userId, key, f.input),
      ]);
      expect(results[0].orderId).toBe(results[1].orderId);
      expect(await stock()).toBe(4);
      await expect(
        placeCustomerOrder(f.customer.userId, randomUUID(), f.input),
      ).rejects.toMatchObject({ code: 'CART_CHANGED' });
    });

    it('sells the last unit to only one of two customers', async () => {
      await getDb()
        .update(products)
        .set({ stock: 1 })
        .where(eq(products.productId, f.product.productId));
      const other = await fixture();
      await getDb()
        .update(cartItems)
        .set({ productId: f.product.productId })
        .where(eq(cartItems.cartId, other.cart.cartId));
      const results = await Promise.allSettled([
        placeCustomerOrder(f.customer.userId, randomUUID(), f.input),
        placeCustomerOrder(other.customer.userId, randomUUID(), {
          addressId: other.address.addressId,
          lines: f.input.lines,
        }),
      ]);
      expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
      expect(await stock()).toBe(0);
      expect(
        await getDb()
          .select()
          .from(orders)
          .where(inArray(orders.userId, [f.customer.userId, other.customer.userId])),
      ).toHaveLength(1);
      expect(
        await getDb()
          .select()
          .from(cartItems)
          .where(inArray(cartItems.cartId, [f.cart.cartId, other.cart.cartId])),
      ).toHaveLength(1);
    });

    it('rolls back order, snapshots, inventory and cart on a persistence failure', async () => {
      await getDb().execute(
        sql.raw(
          `CREATE FUNCTION "${namespace}"() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Injected checkout persistence failure'; END $$`,
        ),
      );
      await getDb().execute(
        sql.raw(
          `CREATE TRIGGER "${namespace}" BEFORE DELETE ON "cartItems" FOR EACH ROW WHEN (OLD."cartId" = '${f.cart.cartId}'::uuid) EXECUTE FUNCTION "${namespace}"()`,
        ),
      );
      try {
        await expect(
          placeCustomerOrder(f.customer.userId, randomUUID(), f.input),
        ).rejects.toThrow();
        await assertNoPlacement();
      } finally {
        await getDb().execute(sql.raw(`DROP TRIGGER "${namespace}" ON "cartItems"`));
        await getDb().execute(sql.raw(`DROP FUNCTION "${namespace}"()`));
      }
    });

    it('rejects cart edits committed while checkout waits on the customer lock', async () => {
      let release!: () => void;
      let locked!: () => void;
      const ready = new Promise<void>((resolve) => {
        locked = resolve;
      });
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const edit = getDb().transaction(async (tx) => {
        await tx.select().from(users).where(eq(users.userId, f.customer.userId)).for('update');
        await tx.select().from(carts).where(eq(carts.cartId, f.cart.cartId)).for('update');
        await tx.update(cartItems).set({ quantity: 2 }).where(eq(cartItems.cartId, f.cart.cartId));
        locked();
        await gate;
      });
      await ready;
      const placing = expect(
        placeCustomerOrder(f.customer.userId, randomUUID(), f.input),
      ).rejects.toMatchObject({ code: 'CART_CHANGED' });
      try {
        await waitForLock();
      } finally {
        release();
      }
      await edit;
      await placing;
      expect(await stock()).toBe(5);
    });

    it('cart quantity mutation uses the same locks as checkout', async () => {
      const results = await Promise.allSettled([
        placeCustomerOrder(f.customer.userId, randomUUID(), f.input),
        setItem(f.customer.userId, f.product.productId, 2),
      ]);
      if (results[0].status === 'fulfilled') expect(await stock()).toBe(4);
      else {
        expect(await stock()).toBe(5);
        expect(
          await getDb().select().from(orders).where(eq(orders.userId, f.customer.userId)),
        ).toHaveLength(0);
      }
      expect(results.some((result) => result.status === 'fulfilled')).toBe(true);
    });

    it('scopes history and detail by authenticated owner and paginates', async () => {
      const order = await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
      const other = await fixture();
      await expect(getCustomerOrder(other.customer.userId, order.orderId)).rejects.toMatchObject({
        code: 'ORDER_NOT_FOUND',
      });
      await expect(cancelCustomerOrder(other.customer.userId, order.orderId)).rejects.toMatchObject(
        {
          code: 'ORDER_NOT_FOUND',
        },
      );
      expect(
        (await listCustomerOrders(other.customer.userId, { page: 1, limit: 1 })).items,
      ).toHaveLength(0);
      await addItem(f.customer.userId, { productId: f.product.productId, quantity: 1 });
      await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
      expect(
        (await listCustomerOrders(f.customer.userId, { page: 2, limit: 1 })).pagination,
      ).toMatchObject({ total: 2, totalPages: 2 });
    });

    it('filters aggregate customer statuses before pagination and excludes other customers', async () => {
      const db = getDb();
      const other = await fixture();
      const cases = [
        { portions: ['pending', 'pending'], status: 'Order placed' },
        { portions: ['processing', 'pending'], status: 'In progress' },
        { portions: ['cancelled', 'processing'], status: 'Partially cancelled' },
        { portions: ['completed', 'cancelled'], status: 'Partially cancelled' },
        { portions: ['completed', 'completed'], status: 'Completed' },
        { portions: ['cancelled', 'cancelled'], status: 'Cancelled' },
      ] as const;
      for (const entry of cases) {
        const [parent] = await db
          .insert(orders)
          .values({
            userId: f.customer.userId,
            orderNumber: randomUUID(),
            requestKey: randomUUID(),
            requestFingerprint: randomUUID(),
          })
          .returning();
        for (const [index, status] of entry.portions.entries()) {
          const owner = index ? other : f;
          const [portion] = await db
            .insert(vendorOrders)
            .values({
              orderId: parent.orderId,
              vendorId: owner.vendor.vendorId,
              status,
              ...(status === 'cancelled'
                ? {
                    cancellationSource: 'customer' as const,
                    cancelledByUserId: f.customer.userId,
                    cancelledAt: new Date(),
                  }
                : {}),
            })
            .returning();
          await db.insert(orderItems).values({
            vendorOrderId: portion.vendorOrderId,
            productId: owner.product.productId,
            productNameSnapshot: 'Lamp',
            productQuantity: 1,
            productPriceSnapshot: '100.10',
          });
        }
      }
      const foreign = await placeCustomerOrder(other.customer.userId, randomUUID(), other.input);
      await db
        .update(vendorOrders)
        .set({ status: 'completed' })
        .where(eq(vendorOrders.orderId, foreign.orderId));
      for (const entry of cases) {
        const result = await listCustomerOrders(f.customer.userId, {
          page: 1,
          limit: 1,
          status: entry.status,
        });
        expect(result.items).toHaveLength(1);
        expect(result.items[0].status).toBe(entry.status);
        expect(result.items[0].orderId).not.toBe(foreign.orderId);
        const matches = cases.filter((candidate) => candidate.status === entry.status).length;
        expect(result.pagination).toEqual({
          page: 1,
          limit: 1,
          total: matches,
          totalPages: matches,
        });
      }
    });

    it('uses inclusive India date bounds and paginates only matching orders', async () => {
      const timestamps = [
        '2026-11-12T18:29:59.999Z',
        '2026-11-12T18:30:00.000Z',
        '2026-11-13T18:29:59.999Z',
        '2026-11-13T18:30:00.000Z',
      ];
      const ids = [];
      for (const [index, timestamp] of timestamps.entries()) {
        if (index)
          await addItem(f.customer.userId, { productId: f.product.productId, quantity: 1 });
        const created = await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
        await getDb()
          .update(orders)
          .set({ createdAt: new Date(timestamp) })
          .where(eq(orders.orderId, created.orderId));
        ids.push(created.orderId);
      }
      const query = { page: 1, limit: 1, orderedFrom: '2026-11-13', orderedTo: '2026-11-13' };
      const first = await listCustomerOrders(f.customer.userId, query);
      const second = await listCustomerOrders(f.customer.userId, { ...query, page: 2 });
      expect(first.pagination).toMatchObject({ total: 2, totalPages: 2 });
      expect(first.items.map((item) => item.orderId)).toEqual([ids[2]]);
      expect(second.items.map((item) => item.orderId)).toEqual([ids[1]]);
      expect(
        (await listCustomerOrders(f.customer.userId, { ...query, status: 'Completed' })).items,
      ).toHaveLength(0);
    });

    it('restores vendor cancellation once and permits processing cancellation', async () => {
      const order = await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
      const vo = await portion(order.orderId);
      await updateVendorOrderStatus(f.vendor.vendorId, vo.vendorOrderId, { status: 'cancelled' });
      await expect(
        updateVendorOrderStatus(f.vendor.vendorId, vo.vendorOrderId, { status: 'cancelled' }),
      ).resolves.toMatchObject({ fulfillment: { status: 'cancelled' } });
      await cancelCustomerOrder(f.customer.userId, order.orderId);
      expect(await stock()).toBe(5);
      await addItem(f.customer.userId, { productId: f.product.productId, quantity: 1 });
      const next = await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
      const nextPortion = await portion(next.orderId);
      await updateVendorOrderStatus(f.vendor.vendorId, nextPortion.vendorOrderId, {
        status: 'processing',
      });
      await expect(
        updateVendorOrderStatus(f.vendor.vendorId, nextPortion.vendorOrderId, {
          status: 'cancelled',
        }),
      ).resolves.toMatchObject({ fulfillment: { status: 'cancelled' } });
      expect((await cancelCustomerOrder(f.customer.userId, next.orderId)).status).toBe('Cancelled');
      expect(await stock()).toBe(5);
    });

    it.each(['completed', 'cancelled'] as const)(
      'serializes customer cancellation against vendor %s',
      async (status) => {
        const order = await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
        const vo = await portion(order.orderId);
        if (status === 'completed')
          await updateVendorOrderStatus(f.vendor.vendorId, vo.vendorOrderId, {
            status: 'processing',
          });
        await Promise.allSettled([
          cancelCustomerOrder(f.customer.userId, order.orderId),
          updateVendorOrderStatus(f.vendor.vendorId, vo.vendorOrderId, { status }),
        ]);
        const final = await getCustomerOrder(f.customer.userId, order.orderId);
        expect(['Cancelled', 'Completed']).toContain(final.status);
        expect(await stock()).toBe(final.status === 'Cancelled' ? 5 : 4);
        expect(final.canCancel).toBe(false);
      },
    );

    it('campaign publication holds affected product locks and checkout observes committed deal', async () => {
      const db = getDb();
      const [draft] = await db
        .insert(campaigns)
        .values({
          ownerUserId: f.owner.userId,
          draftPayload: {
            eyebrow: 'Sale',
            title: 'Sale',
            subtitle: 'Deal',
            imageUrl: '/banner.webp',
            ctaLabel: 'Shop',
            ctaHref: '/products',
            startsAt: new Date(Date.now() - 10000).toISOString(),
            endsAt: new Date(Date.now() + 60000).toISOString(),
            products: [{ productId: f.product.productId, dealPrice: '90.00' }],
          },
        })
        .returning();
      let release!: () => void;
      let locked!: () => void;
      const ready = new Promise<void>((resolve) => {
        locked = resolve;
      });
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const hold = db.transaction(async (tx) => {
        await tx
          .select()
          .from(products)
          .where(eq(products.productId, f.product.productId))
          .for('update');
        locked();
        await gate;
      });
      await ready;
      const publishing = publishPromotionDraft(f.owner.userId, draft.campaignId);
      try {
        await waitForLock();
      } finally {
        release();
      }
      await hold;
      await publishing;
      expect(
        await db
          .select()
          .from(campaignProducts)
          .where(eq(campaignProducts.campaignId, draft.campaignId)),
      ).toHaveLength(1);
      await expect(
        placeCustomerOrder(f.customer.userId, randomUUID(), f.input),
      ).rejects.toMatchObject({ code: 'CHECKOUT_CONFLICT' });
      const fresh = { ...f.input, lines: [{ ...f.input.lines[0], expectedUnitPrice: '90.00' }] };
      expect((await placeCustomerOrder(f.customer.userId, randomUUID(), fresh)).total).toBe(
        '90.00',
      );
    });

    it.each(['cancelled', 'completed'] as const)(
      'handles multiple vendors after one portion is %s',
      async (status) => {
        const other = await fixture();
        await getDb()
          .insert(cartItems)
          .values({ cartId: f.cart.cartId, productId: other.product.productId, quantity: 2 });
        const input = {
          ...f.input,
          lines: [
            ...f.input.lines,
            { productId: other.product.productId, quantity: 2, expectedUnitPrice: '100.10' },
          ],
        };
        const order = await placeCustomerOrder(f.customer.userId, randomUUID(), input);
        const portions = await getDb()
          .select()
          .from(vendorOrders)
          .where(eq(vendorOrders.orderId, order.orderId));
        const first = portions.find((row) => row.vendorId === f.vendor.vendorId)!;
        if (status === 'completed')
          await updateVendorOrderStatus(f.vendor.vendorId, first.vendorOrderId, {
            status: 'processing',
          });
        await updateVendorOrderStatus(f.vendor.vendorId, first.vendorOrderId, { status });
        const detail = await getCustomerOrder(f.customer.userId, order.orderId);
        expect(detail.status).toBe(
          status === 'cancelled' ? 'Partially cancelled' : 'Partially fulfilled',
        );
        if (status === 'completed') {
          await expect(cancelCustomerOrder(f.customer.userId, order.orderId)).rejects.toMatchObject(
            {
              code: 'ORDER_CANNOT_CANCEL',
            },
          );
          expect(await stock(other.product.productId)).toBe(3);
          expect(
            (await getCustomerOrder(f.customer.userId, order.orderId)).items.some(
              (item) => item.status === 'pending',
            ),
          ).toBe(true);
        } else {
          await Promise.all([
            cancelCustomerOrder(f.customer.userId, order.orderId),
            cancelCustomerOrder(f.customer.userId, order.orderId),
          ]);
          expect(await stock()).toBe(5);
          expect(await stock(other.product.productId)).toBe(5);
        }
      },
    );

    it('campaign membership edits lock removed products as well as new products', async () => {
      const db = getDb();
      const other = await fixture();
      const payload = {
        eyebrow: 'Sale',
        title: 'Sale',
        subtitle: 'Deal',
        imageUrl: '/banner.webp',
        ctaLabel: 'Shop',
        ctaHref: '/products',
        startsAt: new Date(Date.now() - 10000).toISOString(),
        endsAt: new Date(Date.now() + 60000).toISOString(),
        products: [{ productId: f.product.productId, dealPrice: '90.00' }],
      };
      const [original] = await db
        .insert(campaigns)
        .values({ ownerUserId: f.owner.userId, draftPayload: payload })
        .returning();
      await publishPromotionDraft(f.owner.userId, original.campaignId);
      const [draft] = await db
        .insert(campaigns)
        .values({
          ownerUserId: f.owner.userId,
          sourceCampaignId: original.campaignId,
          draftPayload: {
            ...payload,
            products: [{ productId: other.product.productId, dealPrice: '80.00' }],
          },
        })
        .returning();
      let release!: () => void;
      let locked!: () => void;
      const ready = new Promise<void>((resolve) => {
        locked = resolve;
      });
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const hold = db.transaction(async (tx) => {
        await tx
          .select()
          .from(products)
          .where(eq(products.productId, f.product.productId))
          .for('update');
        locked();
        await gate;
      });
      await ready;
      const publishing = publishPromotionDraft(f.owner.userId, draft.campaignId);
      try {
        await waitForLock();
      } finally {
        release();
      }
      await hold;
      await publishing;
      expect((await reviewCheckout(f.customer.userId)).lines[0].unitPrice).toBe('100.10');
      expect((await reviewCheckout(other.customer.userId)).lines[0].unitPrice).toBe('80.00');
    });

    it('keeps checkout price stable while campaign publication waits for the same product', async () => {
      const db = getDb();
      const [draft] = await db
        .insert(campaigns)
        .values({
          ownerUserId: f.owner.userId,
          draftPayload: {
            eyebrow: 'Sale',
            title: 'Sale',
            subtitle: 'Deal',
            imageUrl: '/banner.webp',
            ctaLabel: 'Shop',
            ctaHref: '/products',
            startsAt: new Date(Date.now() - 10000).toISOString(),
            endsAt: new Date(Date.now() + 60000).toISOString(),
            products: [{ productId: f.product.productId, dealPrice: '90.00' }],
          },
        })
        .returning();
      let release!: () => void;
      let locked!: () => void;
      const ready = new Promise<void>((resolve) => {
        locked = resolve;
      });
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const hold = db.transaction(async (tx) => {
        await tx
          .select()
          .from(products)
          .where(eq(products.productId, f.product.productId))
          .for('update');
        locked();
        await gate;
      });
      await ready;
      const placing = placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
      try {
        await waitForLock();
      } finally {
        release();
      }
      const publishing = publishPromotionDraft(f.owner.userId, draft.campaignId);
      await hold;
      const [order] = await Promise.all([placing, publishing]);
      expect(order.items[0].unitPrice).toBe('100.10');
      expect((await reviewCheckout(f.customer.userId)).lines).toHaveLength(0);
      await addItem(f.customer.userId, { productId: f.product.productId, quantity: 1 });
      expect((await reviewCheckout(f.customer.userId)).lines[0].unitPrice).toBe('90.00');
    });
  });
