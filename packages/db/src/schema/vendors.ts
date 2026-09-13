import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users.ts';

export const vendorStatusEnum = pgEnum('vendor_status', [
  'pending',
  'active',
  'suspended',
  'rejected',
]);

export const vendors = pgTable('vendors', {
  vendorId: uuid('vendorId').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.userId, { onDelete: 'restrict' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  tagline: text('tagline'),
  description: text('description'),
  logoUrl: text('logoUrl'),
  status: vendorStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
});
