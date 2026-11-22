import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { orderItems } from './orderItems.js';
import { products } from './products.js';
import { users } from './users.js';

export const productReviews = pgTable(
  'productReviews',
  {
    reviewId: uuid('reviewId').primaryKey().defaultRandom(),
    productId: uuid('productId')
      .notNull()
      .references(() => products.productId, { onDelete: 'cascade' }),
    orderItemId: uuid('orderItemId')
      .notNull()
      .unique()
      .references(() => orderItems.orderItemId, { onDelete: 'restrict' }),
    userId: uuid('userId')
      .notNull()
      .references(() => users.userId, { onDelete: 'restrict' }),
    rating: integer('rating').notNull(),
    reviewText: text('reviewText'),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('product_reviews_rating_check', sql`${table.rating} BETWEEN 1 AND 5`),
    check('product_reviews_text_length_check', sql`char_length(${table.reviewText}) <= 2000`),
    index('product_reviews_product_created_idx').on(
      table.productId,
      table.createdAt,
      table.reviewId,
    ),
  ],
);
