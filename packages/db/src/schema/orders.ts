import { pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { users } from './users.js';

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]);

export const orders = pgTable(
  'orders',
  {
    orderId: uuid('orderId').defaultRandom().primaryKey(),
    orderNumber: text('orderNumber').notNull().unique(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.userId, { onDelete: 'restrict' }),
    status: orderStatusEnum('status').notNull().default('pending'),
    requestKey: uuid('requestKey').notNull(),
    requestFingerprint: text('requestFingerprint').notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('orders_user_request_key_unique').on(table.userId, table.requestKey)],
);
