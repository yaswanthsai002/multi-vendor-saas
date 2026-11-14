import { createHash, randomUUID } from 'node:crypto';

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
} from '@repo/db/schema';
import { and, asc, count, desc, eq, inArray, sql } from 'drizzle-orm';

import { AppError } from '../../shared/errors/AppError.js';
import {
  customerOrderStatus,
  lockOrder,
  refreshParentStatus,
  restoreOrderStock,
} from '../../shared/orders/order-lifecycle.js';
import { currentProductPriceSql } from '../../shared/pricing/current-product-price.js';
import { STORAGE_BUCKETS, storageService } from '../../shared/storage/storage.service.js';

import type { CustomerOrderQuery, PlaceCustomerOrderInput } from './customer-order.schema.js';

type Database = ReturnType<typeof getDb>;
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

function productThumbnailUrl(mediaId: string | null, vendorId: string | null) {
  return mediaId && vendorId
    ? storageService.resolveUrl(
        `vendors/${vendorId}/media/${mediaId}/thumbnail.webp`,
        STORAGE_BUCKETS.productMedia,
      )
    : null;
}

async function activeCustomer(
  db: Database | Transaction,
  userId: string,
  lock = false,
  requireCustomer = true,
) {
  const query = db
    .select({ userId: users.userId, roles: users.roles })
    .from(users)
    .where(and(eq(users.userId, userId), eq(users.status, 'active')))
    .limit(1);
  const [user] = await (lock ? query.for('update') : query);
  if (!user) throw new AppError(403, 'ACCOUNT_INACTIVE', 'Active account required.');
  if (requireCustomer && !user.roles.includes('customer'))
    throw new AppError(403, 'CUSTOMER_REQUIRED', 'Customer account required.');
}

export function checkoutFingerprint(input: PlaceCustomerOrderInput) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        addressId: input.addressId.toLowerCase(),
        lines: input.lines
          .map((line) => ({
            productId: line.productId.toLowerCase(),
            quantity: line.quantity,
            expectedUnitPrice: line.expectedUnitPrice,
          }))
          .sort((a, b) => a.productId.localeCompare(b.productId)),
      }),
    )
    .digest('hex');
}

async function cartLines(
  db: Database | Transaction,
  cartId: string,
  at = sql`statement_timestamp()`,
) {
  const price = currentProductPriceSql(products.productId, products.price, at);
  return db
    .select({
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      name: products.name,
      vendorId: products.vendorId,
      mediaId: mediaLibrary.mediaId,
      mediaVendorId: mediaLibrary.vendorId,
      stock: products.stock,
      unitPrice: price,
      subtotal: sql<string>`(${price} * ${cartItems.quantity})::numeric(22,2)::text`,
      available: sql<boolean>`(${products.published} AND ${products.moderationStatus} = 'approved' AND NOT ${products.isSoftDeleted} AND ${vendors.status} = 'active' AND ${users.status} = 'active' AND ${products.stock} >= ${cartItems.quantity})`,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.productId, cartItems.productId))
    .innerJoin(vendors, eq(vendors.vendorId, products.vendorId))
    .innerJoin(users, eq(users.userId, vendors.userId))
    .leftJoin(mediaLibrary, eq(mediaLibrary.mediaId, products.productImageId))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(asc(products.productId));
}

export async function reviewCheckout(userId: string, addressId?: string) {
  const db = getDb();
  await activeCustomer(db, userId, false, false);
  const addresses = await db
    .select({
      addressId: customerAddresses.addressId,
      recipientName: customerAddresses.recipientName,
      phone: customerAddresses.phone,
      addressLine1: customerAddresses.addressLine1,
      addressLine2: customerAddresses.addressLine2,
      city: customerAddresses.city,
      state: customerAddresses.state,
      postalCode: customerAddresses.postalCode,
      country: customerAddresses.country,
      isDefault: customerAddresses.isDefault,
    })
    .from(customerAddresses)
    .where(eq(customerAddresses.userId, userId));
  const [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  const lines = cart ? await cartLines(db, cart.cartId) : [];
  const selected =
    addresses.find((address) => address.addressId === addressId) ??
    (!addressId ? (addresses.find((address) => address.isDefault) ?? addresses[0]) : undefined);
  return {
    lines: lines.map(({ vendorId: _vendorId, mediaId, mediaVendorId, ...line }) => ({
      ...line,
      imageUrl: productThumbnailUrl(mediaId, mediaVendorId),
    })),
    addresses,
    addressId: selected?.addressId ?? null,
    addressEligible: selected?.country === 'IN',
    total: await sumPrices(db, lines),
  };
}

async function sumPrices(db: Database | Transaction, lines: { subtotal: string }[]) {
  if (!lines.length) return '0.00';
  const [row] = await db
    .select({
      total: sql<string>`(${sql.join(
        lines.map((line) => sql`${line.subtotal}::numeric`),
        sql` + `,
      )})::numeric(24,2)::text`,
    })
    .from(sql`(SELECT 1) AS totals`);
  return row.total;
}

export async function readCustomerOrder(
  userId: string,
  orderId: string,
  db: Database | Transaction = getDb(),
) {
  const [order] = await db
    .select({
      orderId: orders.orderId,
      orderNumber: orders.orderNumber,
      placedAt: orders.createdAt,
    })
    .from(orders)
    .where(and(eq(orders.orderId, orderId), eq(orders.userId, userId)))
    .limit(1);
  if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found.');
  const portions = await db
    .select({ status: vendorOrders.status })
    .from(vendorOrders)
    .where(eq(vendorOrders.orderId, orderId));
  const items = await db
    .select({
      orderItemId: orderItems.orderItemId,
      productId: orderItems.productId,
      name: orderItems.productNameSnapshot,
      productSlug: products.slug,
      mediaId: mediaLibrary.mediaId,
      mediaVendorId: mediaLibrary.vendorId,
      quantity: orderItems.productQuantity,
      unitPrice: orderItems.productPriceSnapshot,
      status: vendorOrders.status,
      subtotal: sql<string>`(${orderItems.productPriceSnapshot} * ${orderItems.productQuantity})::numeric(22,2)::text`,
    })
    .from(orderItems)
    .innerJoin(vendorOrders, eq(vendorOrders.vendorOrderId, orderItems.vendorOrderId))
    .leftJoin(products, eq(products.productId, orderItems.productId))
    .leftJoin(mediaLibrary, eq(mediaLibrary.mediaId, products.productImageId))
    .where(eq(vendorOrders.orderId, orderId))
    .orderBy(asc(orderItems.orderItemId));
  const [address] = await db
    .select({
      recipientName: orderDeliveryAddresses.recipientName,
      phone: orderDeliveryAddresses.phone,
      addressLine1: orderDeliveryAddresses.addressLine1,
      addressLine2: orderDeliveryAddresses.addressLine2,
      city: orderDeliveryAddresses.city,
      state: orderDeliveryAddresses.state,
      postalCode: orderDeliveryAddresses.postalCode,
      country: orderDeliveryAddresses.country,
    })
    .from(orderDeliveryAddresses)
    .where(eq(orderDeliveryAddresses.orderId, orderId));
  const statuses = portions.map((portion) => portion.status);
  return {
    ...order,
    status: customerOrderStatus(statuses),
    items: items.map(({ mediaId, mediaVendorId, ...item }) => ({
      ...item,
      imageUrl: productThumbnailUrl(mediaId, mediaVendorId),
    })),
    address: address ?? null,
    total: await sumPrices(db, items),
    canCancel:
      statuses.some((status) => status === 'pending' || status === 'processing') &&
      !statuses.includes('completed'),
  };
}

export async function getCustomerOrder(userId: string, orderId: string) {
  await activeCustomer(getDb(), userId);
  return readCustomerOrder(userId, orderId);
}

export async function listCustomerOrders(userId: string, query: CustomerOrderQuery) {
  const db = getDb();
  await activeCustomer(db, userId);
  const matchingStatuses = db
    .select({ orderId: orders.orderId })
    .from(orders)
    .leftJoin(vendorOrders, eq(vendorOrders.orderId, orders.orderId))
    .where(eq(orders.userId, userId))
    .groupBy(orders.orderId).having(sql`(CASE
      WHEN bool_and(${vendorOrders.status} = 'cancelled') THEN 'Cancelled'
      WHEN bool_and(${vendorOrders.status} = 'completed') THEN 'Completed'
      WHEN bool_or(${vendorOrders.status} = 'completed') THEN 'Partially fulfilled'
      WHEN bool_or(${vendorOrders.status} = 'cancelled') THEN 'Partially cancelled'
      WHEN bool_or(${vendorOrders.status} = 'processing') THEN 'In progress'
      ELSE 'Order placed' END) = ${query.status ?? ''}`);
  const filters = and(
    eq(orders.userId, userId),
    query.status ? inArray(orders.orderId, matchingStatuses) : undefined,
    query.orderedFrom
      ? sql`${orders.createdAt} >= (${query.orderedFrom}::date::timestamp AT TIME ZONE 'Asia/Kolkata')`
      : undefined,
    query.orderedTo
      ? sql`${orders.createdAt} < ((${query.orderedTo}::date + 1)::timestamp AT TIME ZONE 'Asia/Kolkata')`
      : undefined,
  );
  const [total] = await db.select({ count: count() }).from(orders).where(filters);
  const rows = await db
    .select({ orderId: orders.orderId })
    .from(orders)
    .where(filters)
    .orderBy(desc(orders.createdAt), desc(orders.orderId))
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);
  const items = await Promise.all(rows.map((row) => readCustomerOrder(userId, row.orderId)));
  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: total.count,
      totalPages: Math.max(1, Math.ceil(total.count / query.limit)),
    },
  };
}

export async function placeCustomerOrder(
  userId: string,
  key: string,
  input: PlaceCustomerOrderInput,
) {
  const fingerprint = checkoutFingerprint(input);
  return getDb().transaction(async (tx) => {
    await activeCustomer(tx, userId, true);
    const [cart] = await tx
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .for('update')
      .limit(1);
    const [previous] = await tx
      .select()
      .from(orders)
      .where(and(eq(orders.userId, userId), eq(orders.requestKey, key)))
      .limit(1);
    if (previous) {
      if (previous.requestFingerprint !== fingerprint)
        throw new AppError(
          409,
          'IDEMPOTENCY_CONFLICT',
          'This request key was already used with different order details.',
        );
      return readCustomerOrder(userId, previous.orderId, tx);
    }
    if (!cart)
      throw new AppError(409, 'CART_CHANGED', 'Your cart is empty. Return to cart and review it.');
    const submitted = [...input.lines].sort((a, b) => a.productId.localeCompare(b.productId));
    const current = await tx.select().from(cartItems).where(eq(cartItems.cartId, cart.cartId));
    if (
      current.length !== submitted.length ||
      submitted.some(
        (line) =>
          !current.some(
            (item) => item.productId === line.productId && item.quantity === line.quantity,
          ),
      )
    )
      throw new AppError(
        409,
        'CART_CHANGED',
        'Your cart changed. Review it before placing your order.',
      );
    await tx
      .select({ productId: products.productId })
      .from(products)
      .where(
        inArray(
          products.productId,
          submitted.map((line) => line.productId),
        ),
      )
      .orderBy(asc(products.productId))
      .for('update');
    const [clock] = await tx
      .select({ at: sql<string>`clock_timestamp()::text` })
      .from(sql`(SELECT 1) AS clock`);
    const lines = await cartLines(tx, cart.cartId, sql`${clock.at}::timestamptz`);
    const affected = lines.filter(
      (line) =>
        !line.available ||
        line.unitPrice !==
          submitted.find((item) => item.productId === line.productId)?.expectedUnitPrice,
    );
    if (affected.length)
      throw new AppError(
        409,
        'CHECKOUT_CONFLICT',
        'Price or availability changed. Review the highlighted items.',
        {
          lines: affected.map(({ productId, stock, unitPrice, available }) => ({
            productId,
            stock,
            unitPrice,
            available,
          })),
        },
      );
    const [address] = await tx
      .select()
      .from(customerAddresses)
      .where(
        and(eq(customerAddresses.addressId, input.addressId), eq(customerAddresses.userId, userId)),
      )
      .limit(1);
    if (!address || address.country !== 'IN')
      throw new AppError(
        422,
        'INVALID_DELIVERY_ADDRESS',
        'Choose one of your saved Indian delivery addresses.',
        { field: 'addressId' },
      );
    const orderId = randomUUID();
    await tx.insert(orders).values({
      orderId,
      userId,
      orderNumber: `PG-${randomUUID()}`,
      requestKey: key,
      requestFingerprint: fingerprint,
    });
    const { recipientName, phone, addressLine1, addressLine2, city, state, postalCode, country } =
      address;
    await tx.insert(orderDeliveryAddresses).values({
      orderId,
      recipientName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
    });
    const portionIds = new Map<string, string>();
    for (const line of lines) {
      let vendorOrderId = portionIds.get(line.vendorId);
      if (!vendorOrderId) {
        vendorOrderId = randomUUID();
        portionIds.set(line.vendorId, vendorOrderId);
        await tx.insert(vendorOrders).values({ vendorOrderId, orderId, vendorId: line.vendorId });
      }
      await tx.insert(orderItems).values({
        vendorOrderId,
        productId: line.productId,
        productNameSnapshot: line.name,
        productQuantity: line.quantity,
        productPriceSnapshot: line.unitPrice,
      });
      await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${line.quantity}`, updatedAt: new Date() })
        .where(eq(products.productId, line.productId));
    }
    await tx.delete(cartItems).where(
      and(
        eq(cartItems.cartId, cart.cartId),
        inArray(
          cartItems.productId,
          submitted.map((line) => line.productId),
        ),
      ),
    );
    return readCustomerOrder(userId, orderId, tx);
  });
}

export async function cancelCustomerOrder(userId: string, orderId: string) {
  return getDb().transaction(async (tx) => {
    await activeCustomer(tx, userId, true);
    const { portions } = await lockOrder(tx, orderId, userId);
    if (portions.some((portion) => portion.status === 'completed'))
      throw new AppError(
        409,
        'ORDER_CANNOT_CANCEL',
        'A vendor has completed part of this order. Cancellation is unavailable.',
      );
    const changed = await tx
      .update(vendorOrders)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(
        and(
          eq(vendorOrders.orderId, orderId),
          inArray(vendorOrders.status, ['pending', 'processing']),
        ),
      )
      .returning({ vendorOrderId: vendorOrders.vendorOrderId });
    await restoreOrderStock(
      tx,
      changed.map((portion) => portion.vendorOrderId),
    );
    await refreshParentStatus(tx, orderId);
    return readCustomerOrder(userId, orderId, tx);
  });
}
