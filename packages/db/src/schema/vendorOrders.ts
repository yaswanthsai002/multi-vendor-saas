import { pgEnum, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { orders } from './orders.ts';
import { vendors } from './vendors.ts';

export const vendorOrderStatusEnum = pgEnum('vendor_order_status', [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

export const vendorOrders = pgTable(
  'vendorOrders',
  {
    vendorOrderId: uuid('vendorOrderId').defaultRandom().primaryKey(),
    orderId: uuid('orderId')
      .notNull()
      .references(() => orders.orderId, { onDelete: 'restrict' }),
    vendorId: uuid('vendorId')
      .notNull()
      .references(() => vendors.vendorId, { onDelete: 'restrict' }),
    status: vendorOrderStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('vendor_orders_order_vendor_unique').on(table.orderId, table.vendorId)],
);
