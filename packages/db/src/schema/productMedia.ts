import { index, integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { mediaLibrary } from './mediaLibrary.js';
import { products } from './products.js';

// ponytail: lean join table linking products and reusable vendor media assets
export const productMedia = pgTable(
  'productMedia',
  {
    productId: uuid('productId')
      .notNull()
      .references(() => products.productId, {
        onDelete: 'cascade',
      }),
    mediaId: uuid('mediaId')
      .notNull()
      .references(() => mediaLibrary.mediaId, {
        onDelete: 'restrict',
      }),
    sortOrder: integer('sortOrder').notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.mediaId] }),
    index('product_media_productId_idx').on(table.productId),
    index('product_media_mediaId_idx').on(table.mediaId),
  ],
);
