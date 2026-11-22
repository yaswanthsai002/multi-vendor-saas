import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { products } from './products.js';
import { vendorOrders } from './vendorOrders.js';

export const orderItems = pgTable(
  'orderItems',
  {
    orderItemId: uuid('orderItemId').defaultRandom().primaryKey(),
    vendorOrderId: uuid('vendorOrderId')
      .notNull()
      .references(() => vendorOrders.vendorOrderId, { onDelete: 'restrict' }),
    productId: uuid('productId')
      .notNull()
      .references(() => products.productId, { onDelete: 'restrict' }),
    productNameSnapshot: text('productNameSnapshot').notNull(),
    productQuantity: integer('productQuantity').notNull(),
    reviewVersion: integer('reviewVersion').notNull().default(0),
    cancellationReturnedQuantity: integer('cancellationReturnedQuantity'),
    cancellationDamagedQuantity: integer('cancellationDamagedQuantity'),
    cancellationMissingQuantity: integer('cancellationMissingQuantity'),
    productPriceSnapshot: numeric('productPriceSnapshot', { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('order_items_productId_idx').on(table.productId),
    index('order_items_vendorOrderId_idx').on(table.vendorOrderId),
    check('order_items_product_quantity_check', sql`${table.productQuantity} >= 1`),
    check('order_items_review_version_check', sql`${table.reviewVersion} >= 0`),
    check('order_items_product_price_check', sql`${table.productPriceSnapshot} >= 0`),
    check(
      'order_items_cancellation_quantities_check',
      sql`
      (${table.cancellationReturnedQuantity} IS NULL AND ${table.cancellationDamagedQuantity} IS NULL AND ${table.cancellationMissingQuantity} IS NULL)
      OR (${table.cancellationReturnedQuantity} IS NOT NULL AND ${table.cancellationDamagedQuantity} IS NOT NULL AND ${table.cancellationMissingQuantity} IS NOT NULL
        AND ${table.cancellationReturnedQuantity} >= 0 AND ${table.cancellationDamagedQuantity} >= 0 AND ${table.cancellationMissingQuantity} >= 0
        AND ${table.cancellationReturnedQuantity}::bigint + ${table.cancellationDamagedQuantity}::bigint + ${table.cancellationMissingQuantity}::bigint = ${table.productQuantity})
    `,
    ),
  ],
);
