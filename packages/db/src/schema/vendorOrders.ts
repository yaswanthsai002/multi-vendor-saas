import { sql } from 'drizzle-orm';
import { check, index, pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { orders } from './orders.js';
import { users } from './users.js';
import { vendors } from './vendors.js';

export const cancellationSourceEnum = pgEnum('order_cancellation_source', ['customer', 'vendor']);
export const cancellationReasonCodeEnum = pgEnum('order_cancellation_reason', [
  'OUT_OF_STOCK',
  'QUALITY_ISSUE',
  'LISTING_ERROR',
  'OPERATIONAL_ISSUE',
  'OTHER',
]);

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
    cancellationSource: cancellationSourceEnum('cancellationSource'),
    cancellationReasonCode: cancellationReasonCodeEnum('cancellationReasonCode'),
    cancellationDetails: text('cancellationDetails'),
    cancelledByUserId: uuid('cancelledByUserId').references(() => users.userId, {
      onDelete: 'restrict',
    }),
    cancelledAt: timestamp('cancelledAt', { withTimezone: true, precision: 3 }),
    completedAt: timestamp('completedAt', { withTimezone: true }),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('vendor_orders_order_vendor_unique').on(table.orderId, table.vendorId),
    index('vendor_orders_vendorId_idx').on(table.vendorId),
    index('vendor_orders_status_idx').on(table.status),
    check(
      'vendor_orders_cancellation_state_check',
      sql`
      (${table.status} <> 'cancelled' AND ${table.cancellationSource} IS NULL AND ${table.cancelledByUserId} IS NULL AND ${table.cancelledAt} IS NULL AND ${table.cancellationReasonCode} IS NULL AND ${table.cancellationDetails} IS NULL)
      OR (${table.status} = 'cancelled' AND ${table.cancellationSource} IS NOT NULL AND ${table.cancelledByUserId} IS NOT NULL AND ${table.cancelledAt} IS NOT NULL AND
        ((${table.cancellationSource} = 'customer' AND ${table.cancellationReasonCode} IS NULL AND ${table.cancellationDetails} IS NULL)
        OR (${table.cancellationSource} = 'vendor' AND ${table.cancellationReasonCode} IS NOT NULL)))
    `,
    ),
    check(
      'vendor_orders_cancellation_details_check',
      sql`
      (${table.cancellationDetails} IS NULL OR (length(${table.cancellationDetails}) BETWEEN 1 AND 500 AND ${table.cancellationDetails} ~ '[^[:space:]]'))
      AND (${table.cancellationReasonCode} IS DISTINCT FROM 'OTHER' OR ${table.cancellationDetails} IS NOT NULL)
    `,
    ),
  ],
);
