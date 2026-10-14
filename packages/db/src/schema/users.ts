import { pgEnum, pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['customer', 'vendor', 'admin']);
export const userStatusEnum = pgEnum('user_status', ['active', 'suspended']);

export const users = pgTable('users', {
  userId: uuid('userId').defaultRandom().primaryKey(),
  fullName: text('fullName').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('passwordHash'),
  emailVerifiedAt: timestamp('emailVerifiedAt', { withTimezone: true }),
  roles: userRoleEnum('roles').array().notNull().default(['customer']),
  avatarUrl: text('avatarUrl'),
  status: userStatusEnum('status').notNull().default('active'),
  suspensionReason: text('suspensionReason'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
});
