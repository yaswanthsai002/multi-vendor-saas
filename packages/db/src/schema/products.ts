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

import { vendors } from './vendors.js';

export const products = pgTable(
  'products',
  {
    productId: uuid('productId').defaultRandom().primaryKey(),
    vendorId: uuid('vendorId')
      .notNull()
      .references(() => vendors.vendorId, {
        onDelete: 'restrict',
      }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    price: numeric('price', { precision: 12, scale: 2 }).notNull(),
    stock: integer('stock').notNull().default(0),
    deletedAt: timestamp('deletedAt', { withTimezone: true }),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('products_vendorId_idx').on(table.vendorId),
    check('products_price_nonnegative_check', sql`${table.price} >= 0`),
    check('products_stock_nonnegative_check', sql`${table.stock} >= 0`),
  ],
);
