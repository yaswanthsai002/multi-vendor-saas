import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { mediaLibrary } from './mediaLibrary.js';
import { vendors } from './vendors.js';

export const products = pgTable(
  'products',
  {
    productId: uuid('productId').notNull().defaultRandom().primaryKey(),
    vendorId: uuid('vendorId')
      .notNull()
      .references(() => vendors.vendorId, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    shortDescription: text('shortDescription'),
    description: text('description').notNull(),
    productImageId: uuid('productImageId').references(() => mediaLibrary.mediaId, {
      onDelete: 'set null',
    }),
    price: numeric('price', { precision: 12, scale: 2 }).notNull(),
    stock: integer('stock').notNull().default(0),
    published: boolean('published').notNull().default(false),
    isSoftDeleted: boolean('isSoftDeleted').default(false),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
    softDeletedAt: timestamp('softDeletedAt', { withTimezone: true }),
  },
  (table) => [
    index('products_vendorId_idx').on(table.vendorId),
    index('products_productImageId_idx').on(table.productImageId),
    index('products_vendorId_published_idx').on(table.vendorId, table.published),
    check('products_price_nonnegative_check', sql`${table.price} >= 0`),
    check('products_stock_nonnegative_check', sql`${table.stock} >= 0`),
  ],
);
