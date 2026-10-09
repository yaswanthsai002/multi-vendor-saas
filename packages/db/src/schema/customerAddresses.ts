import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users.js';

export const customerAddresses = pgTable(
  'customerAddresses',
  {
    addressId: uuid('addressId').defaultRandom().primaryKey(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    recipientName: text('recipientName').notNull(),
    phone: text('phone').notNull(),
    addressLine1: text('addressLine1').notNull(),
    addressLine2: text('addressLine2'),
    city: text('city').notNull(),
    state: text('state').notNull(),
    postalCode: text('postalCode').notNull(),
    country: text('country').notNull().default('US'),
    isDefault: boolean('isDefault').notNull().default(false),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('customer_addresses_userId_idx').on(table.userId)],
);
