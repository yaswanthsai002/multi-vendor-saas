import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';

import { users } from './users.ts';

export const carts = pgTable('carts', {
  cartId: uuid('cartId').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .unique()
    .references(() => users.userId, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
});
