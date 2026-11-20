import { getDb } from '@repo/db';
import { orders, vendorOrderNotifications as notifications, vendorOrders } from '@repo/db/schema';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';

import { orderItemSummarySql } from '../../shared/orders/order-item-summary.js';

import type { NotificationListQuery } from './notifications.schema.js';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

type InboxRow = {
  notificationId: string;
  vendorOrderId: string;
  orderNumber: string;
  summary: { items: { name: string; quantity: number }[]; itemCount: number; productCount: number };
  type: typeof notifications.$inferSelect.type;
  createdAt: string;
  readAt: string | null;
};

// A surrounding single-table SELECT otherwise removes column qualification inside nested SQL.
const qualified = (column: AnyPgColumn) => sql`${column.table}.${sql.identifier(column.name)}`;

export async function listNotifications(
  vendorId: string,
  { limit, cursor }: NotificationListQuery,
) {
  const db = getDb();
  const position = cursor
    ? sql`AND (${qualified(notifications.createdAt)}, ${qualified(notifications.notificationId)}) < (${cursor.createdAt}::timestamptz, ${cursor.notificationId}::uuid)`
    : sql``;
  // Both subqueries use the same statement snapshot, including an empty page.
  const [result] = await db
    .select({
      items: sql<InboxRow[]>`COALESCE((SELECT json_agg(page) FROM (
      SELECT ${qualified(notifications.notificationId)}, ${qualified(notifications.vendorOrderId)}, ${qualified(orders.orderNumber)}, ${qualified(notifications.type)}, ${qualified(notifications.createdAt)}, ${qualified(notifications.readAt)}, ${orderItemSummarySql()} AS summary
      FROM ${notifications} INNER JOIN ${vendorOrders} ON ${qualified(vendorOrders.vendorOrderId)} = ${qualified(notifications.vendorOrderId)}
      INNER JOIN ${orders} ON ${qualified(orders.orderId)} = ${qualified(vendorOrders.orderId)}
      WHERE ${qualified(vendorOrders.vendorId)} = ${vendorId} ${position}
      ORDER BY ${qualified(notifications.createdAt)} DESC, ${qualified(notifications.notificationId)} DESC LIMIT ${limit + 1}
    ) page), '[]'::json)`,
      unreadCount: sql<number>`(SELECT count(*)::integer FROM ${notifications}
      INNER JOIN ${vendorOrders} ON ${qualified(vendorOrders.vendorOrderId)} = ${qualified(notifications.vendorOrderId)}
      WHERE ${qualified(vendorOrders.vendorId)} = ${vendorId} AND ${qualified(notifications.readAt)} IS NULL)`,
    })
    .from(sql`(SELECT 1) inbox`);
  const items = result.items.slice(0, limit).map((row) => ({
    ...row,
    createdAt: new Date(row.createdAt).toISOString(),
    readAt: row.readAt ? new Date(row.readAt).toISOString() : null,
  }));
  const last = items.at(-1);
  return {
    vendorId,
    items,
    unreadCount: result.unreadCount,
    nextCursor:
      result.items.length > limit && last
        ? Buffer.from(
            JSON.stringify({ createdAt: last.createdAt, notificationId: last.notificationId }),
          ).toString('base64url')
        : null,
  };
}

function ownedPortions(vendorId: string) {
  return getDb()
    .select({ vendorOrderId: vendorOrders.vendorOrderId })
    .from(vendorOrders)
    .where(eq(vendorOrders.vendorId, vendorId));
}

export async function readNotification(vendorId: string, notificationId: string) {
  await getDb()
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.notificationId, notificationId),
        isNull(notifications.readAt),
        inArray(notifications.vendorOrderId, ownedPortions(vendorId)),
      ),
    );
}

export async function deleteNotification(vendorId: string, notificationId: string) {
  await getDb()
    .delete(notifications)
    .where(
      and(
        eq(notifications.notificationId, notificationId),
        inArray(notifications.vendorOrderId, ownedPortions(vendorId)),
      ),
    );
}

export async function readOrderNotifications(
  vendorId: string,
  vendorOrderId: string,
  status: typeof vendorOrders.$inferSelect.status,
) {
  const ownedOrder = getDb()
    .select({ id: vendorOrders.vendorOrderId })
    .from(vendorOrders)
    .where(
      and(
        eq(vendorOrders.vendorId, vendorId),
        eq(vendorOrders.vendorOrderId, vendorOrderId),
        eq(vendorOrders.status, status),
      ),
    );
  // Match the displayed state so a concurrent cancellation stays unread until its details load.
  const changed = await getDb()
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(isNull(notifications.readAt), inArray(notifications.vendorOrderId, ownedOrder)))
    .returning({ id: notifications.notificationId });
  return changed.length > 0;
}
