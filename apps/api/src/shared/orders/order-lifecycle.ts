import { type getDb } from '@repo/db';
import { orders, vendorOrders, orderItems, products } from '@repo/db/schema';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';

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

export function customerOrderStatus(statuses: Status[]) {
  if (statuses.length && statuses.every((status) => status === 'cancelled')) return 'Cancelled';
  if (statuses.length && statuses.every((status) => status === 'completed')) return 'Completed';
  if (statuses.includes('completed')) return 'Partially fulfilled';
  if (statuses.includes('cancelled')) return 'Partially cancelled';
  if (statuses.includes('processing')) return 'In progress';
  return 'Order placed';
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

export async function restoreOrderStock(tx: Transaction, portionIds: string[]) {
  if (!portionIds.length) return;
  const items = await tx
    .select({
      productId: orderItems.productId,
      quantity: sql<number>`SUM(${orderItems.productQuantity})::integer`,
    })
    .from(orderItems)
    .where(inArray(orderItems.vendorOrderId, portionIds))
    .groupBy(orderItems.productId)
    .orderBy(asc(orderItems.productId));
  // Every inventory writer locks products in the same order.
  for (const item of items) {
    await tx
      .update(products)
      .set({ stock: sql`${products.stock} + ${item.quantity}`, updatedAt: new Date() })
      .where(eq(products.productId, item.productId));
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
