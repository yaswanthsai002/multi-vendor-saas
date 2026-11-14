import { getDb } from '@repo/db';
import {
  mediaLibrary,
  orderDeliveryAddresses,
  orderItems,
  orders,
  products,
  users,
  vendorOrders,
} from '@repo/db/schema';
import { and, asc, count, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';

import { AppError } from '../../shared/errors/AppError.js';
import {
  lockOrder,
  restoreOrderStock,
  refreshParentStatus,
} from '../../shared/orders/order-lifecycle.js';
import { STORAGE_BUCKETS, storageService } from '../../shared/storage/storage.service.js';

import type { ListVendorOrdersQuery, UpdateVendorOrderStatusInput } from './order.schema.js';

export interface VendorOrderListItem {
  vendorOrderId: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  itemCount: number;
  total: string;
  placedAt: string;
  status: string;
}

export interface VendorOrderDetail {
  order: {
    orderNumber: string;
    placedAt: string;
    overallStatus: string;
  };
  fulfillment: {
    vendorOrderId: string;
    status: string;
    updatedAt: string;
    completedAt: string | null;
    cancellationReason: string | null;
    allowedActions: ('process' | 'complete' | 'cancel')[];
  };
  customer: {
    name: string;
    email: string;
    phone: string | null;
  };
  deliveryAddress: {
    recipientName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  items: {
    orderItemId: string;
    productId: string;
    productName: string;
    productImageUrl: string | null;
    unitPrice: string;
    quantity: number;
    subtotal: string;
  }[];
  summary: {
    itemCount: number;
    total: string;
  };
}

/**
 * ponytail: Resolves allowed next fulfillment actions from current vendor order status.
 */
export function getAllowedOrderActions(
  status: 'pending' | 'processing' | 'completed' | 'cancelled',
): ('process' | 'complete' | 'cancel')[] {
  switch (status) {
    case 'pending':
      return ['process', 'cancel'];
    case 'processing':
      return ['complete'];
    case 'completed':
    case 'cancelled':
    default:
      return [];
  }
}

/**
 * Lists vendor orders with vendor-scoped filtering, search, sorting, and pagination.
 */
export async function listVendorOrders(vendorId: string, query: ListVendorOrdersQuery) {
  const db = getDb();
  const { page, limit, status, search, dateFrom, dateTo, sort } = query;
  const offset = (page - 1) * limit;

  const baseConditions = [eq(vendorOrders.vendorId, vendorId)];

  if (status && status !== 'all') {
    baseConditions.push(eq(vendorOrders.status, status));
  }

  if (search) {
    const searchPattern = `%${search}%`;
    baseConditions.push(
      or(
        ilike(orders.orderNumber, searchPattern),
        ilike(users.fullName, searchPattern),
        ilike(users.email, searchPattern),
      )!,
    );
  }

  if (dateFrom) {
    baseConditions.push(gte(vendorOrders.createdAt, new Date(dateFrom)));
  }

  if (dateTo) {
    const endDate = new Date(dateTo);
    // If only date (e.g. YYYY-MM-DD), set to end of day
    if (dateTo.length === 10) {
      endDate.setHours(23, 59, 59, 999);
    }
    baseConditions.push(lte(vendorOrders.createdAt, endDate));
  }

  // Determine sort order
  const sortExpression = (() => {
    switch (sort) {
      case 'oldest':
        return asc(vendorOrders.createdAt);
      case 'total_desc':
        return desc(
          sql<number>`COALESCE(SUM(${orderItems.productPriceSnapshot} * ${orderItems.productQuantity}), 0)`,
        );
      case 'total_asc':
        return asc(
          sql<number>`COALESCE(SUM(${orderItems.productPriceSnapshot} * ${orderItems.productQuantity}), 0)`,
        );
      case 'newest':
      default:
        return desc(vendorOrders.createdAt);
    }
  })();

  // 1. Fetch vendor-scoped status counts across ALL orders for this vendor in a single fast query
  const [countsRow] = await db
    .select({
      all: sql<number>`COUNT(*)`,
      pending: sql<number>`COUNT(*) FILTER (WHERE ${vendorOrders.status} = 'pending')`,
      processing: sql<number>`COUNT(*) FILTER (WHERE ${vendorOrders.status} = 'processing')`,
      completed: sql<number>`COUNT(*) FILTER (WHERE ${vendorOrders.status} = 'completed')`,
      cancelled: sql<number>`COUNT(*) FILTER (WHERE ${vendorOrders.status} = 'cancelled')`,
    })
    .from(vendorOrders)
    .where(eq(vendorOrders.vendorId, vendorId));

  // 2. Fetch filtered count & paginated rows
  const whereClause = and(...baseConditions);

  const [totalCountResult] = await db
    .select({ count: count() })
    .from(vendorOrders)
    .innerJoin(orders, eq(orders.orderId, vendorOrders.orderId))
    .innerJoin(users, eq(users.userId, orders.userId))
    .where(whereClause);

  const total = Number(totalCountResult?.count ?? 0);
  const totalPages = Math.ceil(total / limit) || 1;

  const rows = await db
    .select({
      vendorOrderId: vendorOrders.vendorOrderId,
      orderNumber: orders.orderNumber,
      customerName: users.fullName,
      customerEmail: users.email,
      status: vendorOrders.status,
      placedAt: vendorOrders.createdAt,
      itemCount: sql<number>`COALESCE(SUM(${orderItems.productQuantity}), 0)`,
      total: sql<string>`COALESCE(SUM(${orderItems.productPriceSnapshot} * ${orderItems.productQuantity}), 0)::text`,
    })
    .from(vendorOrders)
    .innerJoin(orders, eq(orders.orderId, vendorOrders.orderId))
    .innerJoin(users, eq(users.userId, orders.userId))
    .leftJoin(orderItems, eq(orderItems.vendorOrderId, vendorOrders.vendorOrderId))
    .where(whereClause)
    .groupBy(vendorOrders.vendorOrderId, orders.orderNumber, users.fullName, users.email)
    .orderBy(sortExpression)
    .limit(limit)
    .offset(offset);

  const items: VendorOrderListItem[] = rows.map((r) => ({
    vendorOrderId: r.vendorOrderId,
    orderNumber: r.orderNumber,
    customer: {
      name: r.customerName,
      email: r.customerEmail,
    },
    itemCount: Number(r.itemCount),
    total: Number(r.total).toFixed(2),
    placedAt: r.placedAt.toISOString(),
    status: r.status,
  }));

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    statusCounts: {
      all: Number(countsRow?.all ?? 0),
      pending: Number(countsRow?.pending ?? 0),
      processing: Number(countsRow?.processing ?? 0),
      completed: Number(countsRow?.completed ?? 0),
      cancelled: Number(countsRow?.cancelled ?? 0),
    },
  };
}

/**
 * Retrieves full vendor order details including customer, delivery address snapshot, and order items.
 */
export async function getVendorOrderDetail(
  vendorId: string,
  vendorOrderId: string,
): Promise<VendorOrderDetail> {
  const db = getDb();

  // 1. Retrieve the vendor order record
  const vo = await db.query.vendorOrders.findFirst({
    where: and(eq(vendorOrders.vendorOrderId, vendorOrderId), eq(vendorOrders.vendorId, vendorId)),
  });

  if (!vo) {
    throw new AppError(404, 'ORDER_NOT_FOUND', 'Vendor order not found.');
  }

  // 2. Fetch parent order and customer
  const orderRecord = await db.query.orders.findFirst({
    where: eq(orders.orderId, vo.orderId),
  });

  if (!orderRecord) {
    throw new AppError(404, 'ORDER_NOT_FOUND', 'Parent order not found.');
  }

  const customerRecord = await db.query.users.findFirst({
    where: eq(users.userId, orderRecord.userId),
  });

  // 3. Fetch delivery address snapshot
  const deliveryAddressRecord = await db.query.orderDeliveryAddresses.findFirst({
    where: eq(orderDeliveryAddresses.orderId, orderRecord.orderId),
  });

  // 4. Fetch order items with primary product media thumbnail
  const itemsRows = await db
    .select({
      orderItemId: orderItems.orderItemId,
      productId: orderItems.productId,
      productName: orderItems.productNameSnapshot,
      unitPrice: orderItems.productPriceSnapshot,
      quantity: orderItems.productQuantity,
      mediaStorageKey: mediaLibrary.originalStorageKey,
      mediaId: mediaLibrary.mediaId,
      mediaVendorId: mediaLibrary.vendorId,
    })
    .from(orderItems)
    .leftJoin(products, eq(products.productId, orderItems.productId))
    .leftJoin(mediaLibrary, eq(mediaLibrary.mediaId, products.productImageId))
    .where(eq(orderItems.vendorOrderId, vendorOrderId));

  let totalNum = 0;
  let totalItemCount = 0;

  const items = itemsRows.map((item) => {
    const unitPriceNum = Number(item.unitPrice);
    const subtotalNum = unitPriceNum * item.quantity;
    totalNum += subtotalNum;
    totalItemCount += item.quantity;

    let productImageUrl: string | null = null;
    if (item.mediaStorageKey && item.mediaId && item.mediaVendorId) {
      const bucket = STORAGE_BUCKETS.productMedia;
      const dirPrefix = `vendors/${item.mediaVendorId}/media/${item.mediaId}`;
      productImageUrl = storageService.resolveUrl(`${dirPrefix}/thumbnail.webp`, bucket);
    }

    return {
      orderItemId: item.orderItemId,
      productId: item.productId,
      productName: item.productName,
      productImageUrl,
      unitPrice: unitPriceNum.toFixed(2),
      quantity: item.quantity,
      subtotal: subtotalNum.toFixed(2),
    };
  });

  return {
    order: {
      orderNumber: orderRecord.orderNumber,
      placedAt: vo.createdAt.toISOString(),
      overallStatus: orderRecord.status,
    },
    fulfillment: {
      vendorOrderId: vo.vendorOrderId,
      status: vo.status,
      updatedAt: vo.updatedAt.toISOString(),
      completedAt: vo.completedAt ? vo.completedAt.toISOString() : null,
      cancellationReason: vo.cancellationReason,
      allowedActions: getAllowedOrderActions(vo.status),
    },
    customer: {
      name: customerRecord?.fullName ?? 'Customer',
      email: customerRecord?.email ?? '',
      phone: deliveryAddressRecord?.phone ?? null,
    },
    deliveryAddress: deliveryAddressRecord
      ? {
          recipientName: deliveryAddressRecord.recipientName,
          phone: deliveryAddressRecord.phone,
          addressLine1: deliveryAddressRecord.addressLine1,
          addressLine2: deliveryAddressRecord.addressLine2,
          city: deliveryAddressRecord.city,
          state: deliveryAddressRecord.state,
          postalCode: deliveryAddressRecord.postalCode,
          country: deliveryAddressRecord.country,
        }
      : null,
    items,
    summary: {
      itemCount: totalItemCount,
      total: totalNum.toFixed(2),
    },
  };
}

/**
 * Updates vendor order status and recalculates parent order status atomically.
 */
export async function updateVendorOrderStatus(
  vendorId: string,
  vendorOrderId: string,
  input: UpdateVendorOrderStatusInput,
): Promise<VendorOrderDetail> {
  const db = getDb();
  const { status: targetStatus, cancellationReason } = input;

  const vo = await db.query.vendorOrders.findFirst({
    where: and(eq(vendorOrders.vendorOrderId, vendorOrderId), eq(vendorOrders.vendorId, vendorId)),
  });
  if (!vo) throw new AppError(404, 'ORDER_NOT_FOUND', 'Vendor order not found.');
  await db.transaction(async (tx) => {
    const { portions } = await lockOrder(tx, vo.orderId);
    const current = portions.find(
      (portion) => portion.vendorOrderId === vendorOrderId && portion.vendorId === vendorId,
    );
    if (!current) throw new AppError(404, 'ORDER_NOT_FOUND', 'Vendor order not found.');
    if (
      !getAllowedOrderActions(current.status).includes(
        targetStatus === 'processing'
          ? 'process'
          : targetStatus === 'completed'
            ? 'complete'
            : 'cancel',
      )
    ) {
      throw new AppError(
        400,
        'INVALID_ORDER_STATUS_TRANSITION',
        'Order state changed or transition is unavailable. Refresh the order.',
      );
    }
    const now = new Date();
    const changed = await tx
      .update(vendorOrders)
      .set({
        status: targetStatus,
        cancellationReason:
          targetStatus === 'cancelled' ? (cancellationReason ?? 'Cancelled by vendor') : null,
        completedAt: targetStatus === 'completed' ? now : null,
        updatedAt: now,
      })
      .where(
        and(
          eq(vendorOrders.vendorOrderId, vendorOrderId),
          eq(vendorOrders.vendorId, vendorId),
          eq(vendorOrders.status, current.status),
        ),
      )
      .returning({ vendorOrderId: vendorOrders.vendorOrderId });
    if (targetStatus === 'cancelled')
      await restoreOrderStock(
        tx,
        changed.map((portion) => portion.vendorOrderId),
      );
    await refreshParentStatus(tx, vo.orderId);
  });
  return getVendorOrderDetail(vendorId, vendorOrderId);
}
