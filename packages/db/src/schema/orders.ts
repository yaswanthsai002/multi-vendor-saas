import { pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users.ts';

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]);

export const orders = pgTable('orders', {
  orderId: uuid('orderId').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.userId, { onDelete: 'restrict' }),
  status: orderStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
});
