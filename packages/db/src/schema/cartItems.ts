import { sql } from 'drizzle-orm';
import { pgTable, uuid, timestamp, integer, check, index, unique } from 'drizzle-orm/pg-core';

import { carts } from './carts.ts';
import { products } from './products.ts';

export const cartItems = pgTable(
  'cartItems',
  {
    cartItemId: uuid('cartItemId').defaultRandom().primaryKey(),
    cartId: uuid('cartId')
      .notNull()
      .references(() => carts.cartId, { onDelete: 'cascade' }),
    productId: uuid('productId')
      .notNull()
      .references(() => products.productId, { onDelete: 'restrict' }),
    quantity: integer().notNull().default(1),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('cartItems_cartId_idx').on(table.cartId),
    check('cartItems_quantity_positive_check', sql`${table.quantity} >= 1`),
    unique('cart_items_cart_product_unique').on(table.cartId, table.productId),
  ],
);
