import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

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
  vendors,
  campaigns,
  campaignProducts,
} from '@repo/db/schema';
import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { checkoutTestDatabaseUrl } from '../../shared/config/test-database.js';
import { addItem, setItem } from '../cart/cart.service.js';
import { publishPromotionDraft } from '../merchandising/merchandising.service.js';
import { updateVendorOrderStatus } from '../vendor/order.service.js';

import {
  cancelCustomerOrder,
  getCustomerOrder,
  listCustomerOrders,
  placeCustomerOrder,
  reviewCheckout,
} from './customer-order.service.js';

const namespace = `checkout_test_${randomUUID().replaceAll('-', '')}`;
const migrationRoot = new URL('../../../../../packages/db/drizzle/', import.meta.url);
type Fixture = Awaited<ReturnType<typeof fixture>>;
let f: Fixture;
let initialized = false;

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
  expect(await getDb().select().from(orders)).toHaveLength(0);
  expect(await getDb().select().from(orderItems)).toHaveLength(0);
  expect(await getDb().select().from(orderDeliveryAddresses)).toHaveLength(0);
  expect(await getDb().select().from(cartItems)).toHaveLength(1);
  expect(await stock()).toBe(5);
}

async function waitForLock() {
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    const waiting = await getDb().execute(
      sql`SELECT 1 FROM pg_stat_activity WHERE datname = current_database() AND usename = current_user AND wait_event_type = 'Lock'`,
    );
    if (waiting.length) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error('Expected concurrent request to wait on a PostgreSQL lock.');
}

describe.skipIf(!checkoutTestDatabaseUrl)('customer checkout PostgreSQL integration', () => {
  beforeAll(async () => {
    if (!checkoutTestDatabaseUrl) throw new Error('Explicit test database required.');
    const target = new URL(checkoutTestDatabaseUrl);
    if (!['localhost', '127.0.0.1', '[::1]'].includes(target.hostname))
      throw new Error('Checkout integration tests require localhost.');
    target.searchParams.set(
      'options',
      `-csearch_path=${namespace} -capplication_name=${namespace} -clock_timeout=10000 -cclient_min_messages=warning`,
    );
    vi.stubEnv('DATABASE_URL', target.toString());
    const db = getDb();
    await db.execute(sql`CREATE SCHEMA ${sql.identifier(namespace)}`);
    initialized = true;
    const journal = JSON.parse(
      await readFile(new URL('meta/_journal.json', migrationRoot), 'utf8'),
    );
    for (const entry of journal.entries) {
      if (entry.idx === 12) {
        const [legacyUser] = await db
          .insert(users)
          .values({ fullName: 'Legacy address', email: 'legacy@example.test' })
          .returning();
        await db.insert(customerAddresses).values({
          userId: legacyUser.userId,
          recipientName: 'Legacy address',
          phone: '9876543210',
          addressLine1: 'Street',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500001',
          country: 'US',
        });
      }
      const migration = (
        await readFile(new URL(`${entry.tag}.sql`, migrationRoot), 'utf8')
      ).replaceAll('"public"', `"${namespace}"`);
      await db.transaction(async (tx) => {
        for (const statement of migration
          .split('--> statement-breakpoint')
          .filter((part) => part.trim()))
          await tx.execute(sql.raw(statement));
      });
      if (entry.idx === 12) {
        const [converted] = await db
          .select({ country: customerAddresses.country })
          .from(customerAddresses);
        expect(converted.country).toBe('IN');
      }
    }
  }, 30000);

  beforeEach(async () => {
    await getDb().execute(sql`TRUNCATE TABLE ${sql.identifier(namespace)}."users" CASCADE`);
    f = await fixture();
  });

  afterAll(async () => {
    if (initialized) {
      await getDb().execute(sql`DROP SCHEMA ${sql.identifier(namespace)} CASCADE`);
      await getDb().$client.end();
    }
    vi.unstubAllEnvs();
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
    expect(await getDb().select().from(cartItems)).toHaveLength(0);
    expect((await placeCustomerOrder(f.customer.userId, key, f.input)).orderId).toBe(order.orderId);
    await expect(
      placeCustomerOrder(f.customer.userId, key, {
        ...f.input,
        lines: [{ ...f.input.lines[0], quantity: 2 }],
      }),
    ).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
    await getDb()
      .update(products)
      .set({ name: 'Renamed', slug: 'renamed-lamp', price: '101.00' })
      .where(eq(products.productId, f.product.productId));
    expect((await getCustomerOrder(f.customer.userId, order.orderId)).items[0]).toMatchObject({
      name: 'Lamp',
      unitPrice: '100.10',
      productSlug: 'renamed-lamp',
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
    await expect(listCustomerOrders(f.owner.userId, { page: 1, limit: 20 })).rejects.toMatchObject({
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
    expect(await getDb().select().from(orders)).toHaveLength(0);
    expect(await getDb().select().from(cartItems)).toHaveLength(1);
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
    expect(await getDb().select().from(orders)).toHaveLength(1);
    expect(await getDb().select().from(cartItems)).toHaveLength(1);
  });

  it('rolls back order, snapshots, inventory and cart on a persistence failure', async () => {
    await getDb().execute(
      sql.raw(
        `CREATE FUNCTION "${namespace}".fail_checkout() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Injected checkout persistence failure'; END $$`,
      ),
    );
    await getDb().execute(
      sql.raw(
        `CREATE TRIGGER checkout_failure BEFORE DELETE ON "${namespace}"."cartItems" FOR EACH ROW EXECUTE FUNCTION "${namespace}".fail_checkout()`,
      ),
    );
    try {
      await expect(placeCustomerOrder(f.customer.userId, randomUUID(), f.input)).rejects.toThrow();
      await assertNoPlacement();
    } finally {
      await getDb().execute(sql.raw(`DROP TRIGGER checkout_failure ON "${namespace}"."cartItems"`));
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
      expect(await getDb().select().from(orders)).toHaveLength(0);
    }
    expect(results.some((result) => result.status === 'fulfilled')).toBe(true);
  });

  it('scopes history and detail by authenticated owner and paginates', async () => {
    const order = await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
    const other = await fixture();
    await expect(getCustomerOrder(other.customer.userId, order.orderId)).rejects.toMatchObject({
      code: 'ORDER_NOT_FOUND',
    });
    await expect(cancelCustomerOrder(other.customer.userId, order.orderId)).rejects.toMatchObject({
      code: 'ORDER_NOT_FOUND',
    });
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
      { portions: ['completed', 'cancelled'], status: 'Partially fulfilled' },
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
          .values({ orderId: parent.orderId, vendorId: owner.vendor.vendorId, status })
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
      expect(result.pagination).toEqual({ page: 1, limit: 1, total: 1, totalPages: 1 });
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
      if (index) await addItem(f.customer.userId, { productId: f.product.productId, quantity: 1 });
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

  it('restores vendor cancellation exactly once and prohibits processing cancellation', async () => {
    const order = await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
    const vo = await portion(order.orderId);
    await updateVendorOrderStatus(f.vendor.vendorId, vo.vendorOrderId, { status: 'cancelled' });
    await expect(
      updateVendorOrderStatus(f.vendor.vendorId, vo.vendorOrderId, { status: 'cancelled' }),
    ).rejects.toMatchObject({ code: 'INVALID_ORDER_STATUS_TRANSITION' });
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
    ).rejects.toMatchObject({ code: 'INVALID_ORDER_STATUS_TRANSITION' });
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
    expect(await db.select().from(campaignProducts)).toHaveLength(1);
    await expect(
      placeCustomerOrder(f.customer.userId, randomUUID(), f.input),
    ).rejects.toMatchObject({ code: 'CHECKOUT_CONFLICT' });
    const fresh = { ...f.input, lines: [{ ...f.input.lines[0], expectedUnitPrice: '90.00' }] };
    expect((await placeCustomerOrder(f.customer.userId, randomUUID(), fresh)).total).toBe('90.00');
  });

  it('migration rejects existing orders before changing schema', async () => {
    await placeCustomerOrder(f.customer.userId, randomUUID(), f.input);
    const migration = await readFile(new URL('0012_living_betty_brant.sql', migrationRoot), 'utf8');
    await expect(
      getDb().transaction(async (tx) => {
        for (const statement of migration
          .split('--> statement-breakpoint')
          .filter((part) => part.trim()))
          await tx.execute(sql.raw(statement));
      }),
    ).rejects.toMatchObject({
      cause: { message: 'Checkout migration requires an empty orders table' },
    });
    expect(await getDb().select().from(orders)).toHaveLength(1);
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
        await expect(cancelCustomerOrder(f.customer.userId, order.orderId)).rejects.toMatchObject({
          code: 'ORDER_CANNOT_CANCEL',
        });
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
