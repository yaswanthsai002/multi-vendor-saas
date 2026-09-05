import { pgTable, serial, integer, text, timestamp, unique } from 'drizzle-orm/pg-core';

import { users } from './users.js';

export const authAccounts = pgTable(
  'authAccounts',
  {
    authAccountId: serial('authAccountId').primaryKey(),
    userId: integer('userId')
      .notNull()
      .references(() => users.userId, {
        onDelete: 'cascade',
      }),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('authAccounts_provider_providerAccountId_unique').on(
      table.provider,
      table.providerAccountId,
    ),
  ],
);
