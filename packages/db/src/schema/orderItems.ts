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

import { products } from './products.ts';
import { vendorOrders } from './vendorOrders.ts';

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
    productPriceSnapshot: numeric('productPriceSnapshot', { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('order_items_productId_idx').on(table.productId),
    index('order_items_vendorOrderId_idx').on(table.vendorOrderId),
    check('order_items_product_quantity_check', sql`${table.productQuantity} >= 1`),
    check('order_items_product_price_check', sql`${table.productPriceSnapshot} >= 0`),
  ],
);
