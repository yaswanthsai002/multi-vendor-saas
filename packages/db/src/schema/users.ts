import { pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['customer', 'vendor', 'admin']);

export const users = pgTable('users', {
  userId: serial('userId').primaryKey(),
  fullName: text('fullName').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('passwordHash'),
  emailVerifiedAt: timestamp('emailVerifiedAt', { withTimezone: true }),
  roles: userRoleEnum('roles').array().notNull().default(['customer']),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
});
