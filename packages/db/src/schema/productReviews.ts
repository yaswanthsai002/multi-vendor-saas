import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { products } from './products.js';

export const productReviews = pgTable(
  'productReviews',
  {
    reviewId: uuid('reviewId').primaryKey().defaultRandom(),
    productId: uuid('productId')
      .notNull()
      .references(() => products.productId, { onDelete: 'cascade' }),
    authorName: text('authorName').notNull(),
    rating: integer('rating').notNull(),
    reviewText: text('reviewText'),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('product_reviews_rating_check', sql`${table.rating} BETWEEN 1 AND 5`),
    index('product_reviews_product_created_idx').on(
      table.productId,
      table.createdAt,
      table.reviewId,
    ),
  ],
);
