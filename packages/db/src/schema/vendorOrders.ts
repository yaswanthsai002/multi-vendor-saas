import { index, pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { orders } from './orders.js';
import { vendors } from './vendors.js';

export const vendorOrderStatusEnum = pgEnum('vendor_order_status', [
  'pending',
  'processing',
  'completed',
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
    cancellationReason: text('cancellationReason'),
    completedAt: timestamp('completedAt', { withTimezone: true }),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('vendor_orders_order_vendor_unique').on(table.orderId, table.vendorId),
    index('vendor_orders_vendorId_idx').on(table.vendorId),
    index('vendor_orders_status_idx').on(table.status),
  ],
);
