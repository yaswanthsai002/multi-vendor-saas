import { index, pgEnum, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { vendorOrders } from './vendorOrders.js';

export const vendorOrderNotificationTypeEnum = pgEnum('vendor_order_notification_type', [
  'new_order',
  'customer_cancelled',
]);

export const vendorOrderNotifications = pgTable(
  'vendorOrderNotifications',
  {
    notificationId: uuid('notificationId').defaultRandom().primaryKey(),
    vendorOrderId: uuid('vendorOrderId')
      .notNull()
      .references(() => vendorOrders.vendorOrderId, { onDelete: 'restrict' }),
    type: vendorOrderNotificationTypeEnum('type').notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true, precision: 3 }).notNull().defaultNow(),
    readAt: timestamp('readAt', { withTimezone: true, precision: 3 }),
  },
  (table) => [
    unique('vendor_order_notifications_portion_type_unique').on(table.vendorOrderId, table.type),
    index('vendor_order_notifications_created_id_idx').on(table.createdAt, table.notificationId),
  ],
);
