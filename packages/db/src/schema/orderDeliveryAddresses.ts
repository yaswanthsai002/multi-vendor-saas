import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { orders } from './orders.js';

export const orderDeliveryAddresses = pgTable('orderDeliveryAddresses', {
  deliveryAddressId: uuid('deliveryAddressId').defaultRandom().primaryKey(),
  orderId: uuid('orderId')
    .notNull()
    .unique()
    .references(() => orders.orderId, { onDelete: 'restrict' }),
  recipientName: text('recipientName').notNull(),
  phone: text('phone').notNull(),
  addressLine1: text('addressLine1').notNull(),
  addressLine2: text('addressLine2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postalCode').notNull(),
  country: text('country').notNull().default('US'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
});
