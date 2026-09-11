import { pgTable, primaryKey, uuid, index } from 'drizzle-orm/pg-core';

import { categories } from './categories.js';
import { products } from './products.js';

export const productCategories = pgTable(
  'productCategories',
  {
    productId: uuid('productId')
      .notNull()
      .references(() => products.productId, {
        onDelete: 'cascade',
      }),
    categoryId: uuid('categoryId')
      .notNull()
      .references(() => categories.categoryId, {
        onDelete: 'cascade',
      }),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.categoryId] }),
    index('productCategories_categoryId_idx').on(table.categoryId),
  ],
);
