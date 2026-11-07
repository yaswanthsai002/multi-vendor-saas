import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';

import { products } from './products.js';
import { users } from './users.js';

export const wishlistItems = pgTable(
  'wishlistItems',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    productId: uuid('productId')
      .notNull()
      .references(() => products.productId, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.productId] })],
);
