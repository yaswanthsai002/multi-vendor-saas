import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { mediaLibrary } from './mediaLibrary.js';

import type { AnyPgColumn } from 'drizzle-orm/pg-core';

export const categories = pgTable(
  'categories',
  {
    categoryId: uuid('categoryId').defaultRandom().primaryKey(),
    parentCategoryId: uuid('parentCategoryId').references(
      (): AnyPgColumn => categories.categoryId,
      {
        onDelete: 'restrict',
      },
    ),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    imageMediaId: uuid('imageMediaId').references(() => mediaLibrary.mediaId, {
      onDelete: 'restrict',
    }),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('categories_parentCategoryId_idx').on(table.parentCategoryId)],
);
