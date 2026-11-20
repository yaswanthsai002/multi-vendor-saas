import { type getDb } from '@repo/db';
import { orders, vendorOrders, type orderItems, products } from '@repo/db/schema';
import { and, asc, eq, sql } from 'drizzle-orm';

import { AppError } from '../errors/AppError.js';

type Transaction = Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0];
type Status = typeof vendorOrders.$inferSelect.status;

export function calculateParentOrderStatus(statuses: Status[]): typeof orders.$inferSelect.status {
  if (!statuses.length || statuses.every((status) => status === 'pending')) return 'pending';
  if (statuses.every((status) => status === 'cancelled')) return 'cancelled';
  if (statuses.every((status) => status === 'completed' || status === 'cancelled'))
    return 'completed';
  return 'confirmed';
}

export function customerOrderStatusSql() {
  return sql<string>`CASE
    WHEN bool_and(${vendorOrders.status} = 'cancelled') THEN 'Cancelled'
    WHEN bool_and(${vendorOrders.status} = 'completed') THEN 'Completed'
    WHEN bool_or(${vendorOrders.status} = 'cancelled') THEN 'Partially cancelled'
    WHEN bool_or(${vendorOrders.status} = 'completed') THEN 'Partially fulfilled'
    WHEN bool_or(${vendorOrders.status} = 'processing') THEN 'In progress'
    ELSE 'Order placed' END`;
}

export const cancellationReasonLabels = {
  OUT_OF_STOCK: 'Insufficient stock',
  QUALITY_ISSUE: 'Item damaged or failed quality check',
  LISTING_ERROR: 'Product details are incorrect',
  OPERATIONAL_ISSUE: 'Seller unable to prepare these items',
  OTHER: 'Seller unable to fulfill these items',
} as const;

export function publicCancellation(
  portion: Pick<
    typeof vendorOrders.$inferSelect,
    'cancellationSource' | 'cancellationReasonCode' | 'cancelledAt'
  >,
) {
  if (!portion.cancellationSource) return null;
  return {
    source: portion.cancellationSource,
    reasonCode: portion.cancellationReasonCode,
    reason: portion.cancellationReasonCode
      ? cancellationReasonLabels[portion.cancellationReasonCode]
      : 'Cancelled by customer',
    cancelledAt: portion.cancelledAt?.toISOString() ?? null,
  };
}

export function cancellationQuantities(
  item: Pick<
    typeof orderItems.$inferSelect,
    'cancellationReturnedQuantity' | 'cancellationDamagedQuantity' | 'cancellationMissingQuantity'
  >,
) {
  return item.cancellationReturnedQuantity === null ||
    item.cancellationDamagedQuantity === null ||
    item.cancellationMissingQuantity === null
    ? null
    : {
        returnedQuantity: item.cancellationReturnedQuantity,
        damagedQuantity: item.cancellationDamagedQuantity,
        missingQuantity: item.cancellationMissingQuantity,
      };
}

export async function lockOrder(tx: Transaction, orderId: string, userId?: string) {
  const [order] = await tx
    .select()
    .from(orders)
    .where(and(eq(orders.orderId, orderId), userId ? eq(orders.userId, userId) : undefined))
    .for('update')
    .limit(1);
  if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found.');
  const portions = await tx
    .select()
    .from(vendorOrders)
    .where(eq(vendorOrders.orderId, orderId))
    .orderBy(asc(vendorOrders.vendorOrderId));
  return { order, portions };
}

export async function restoreOrderStock(
  tx: Transaction,
  allocations: { productId: string; quantity: number }[],
) {
  const quantities = new Map<string, number>();
  for (const item of allocations)
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  const items = [...quantities].sort(([a], [b]) => a.localeCompare(b));
  // Every inventory writer locks products in the same order.
  for (const [productId, quantity] of items) {
    if (!quantity) continue;
    await tx
      .update(products)
      .set({ stock: sql`${products.stock} + ${quantity}`, updatedAt: new Date() })
      .where(eq(products.productId, productId));
  }
}

export async function refreshParentStatus(tx: Transaction, orderId: string) {
  const portions = await tx
    .select({ status: vendorOrders.status })
    .from(vendorOrders)
    .where(eq(vendorOrders.orderId, orderId));
  await tx
    .update(orders)
    .set({
      status: calculateParentOrderStatus(portions.map((p) => p.status)),
      updatedAt: new Date(),
    })
    .where(eq(orders.orderId, orderId));
}
