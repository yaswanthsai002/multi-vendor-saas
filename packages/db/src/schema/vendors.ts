import { pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { users } from './users.js';

export const vendorStatusEnum = pgEnum('vendor_status', [
  'pending',
  'active',
  'suspended',
  'rejected',
]);

export const vendors = pgTable(
  'vendors',
  {
    vendorId: uuid('vendorId').defaultRandom().primaryKey(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.userId, {
        onDelete: 'restrict',
      }),
    displayName: text('displayName').notNull(),
    slug: text('slug').notNull(),
    status: vendorStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('vendors_userId_unique').on(table.userId),
    unique('vendors_slug_unique').on(table.slug),
  ],
);
