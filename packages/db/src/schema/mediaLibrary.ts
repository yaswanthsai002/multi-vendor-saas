import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './users.js';
import { vendors } from './vendors.js';

export const mediaTypeEnum = pgEnum('media_type', ['image', 'video']);
export const mediaStatusEnum = pgEnum('media_status', ['active', 'disabled']);

// ponytail: single consolidated table for media library assets, no redundant variants table
export const mediaLibrary = pgTable(
  'mediaLibrary',
  {
    mediaId: uuid('mediaId').defaultRandom().primaryKey(),
    vendorId: uuid('vendorId')
      .notNull()
      .references(() => vendors.vendorId, { onDelete: 'restrict' }),
    createdBy: uuid('createdBy')
      .notNull()
      .references(() => users.userId, { onDelete: 'restrict' }),
    mediaType: mediaTypeEnum('mediaType').notNull(),
    originalFileName: text('originalFileName').notNull(),
    mimeType: text('mimeType').notNull(),
    fileSizeBytes: bigint('fileSizeBytes', { mode: 'number' }).notNull(),
    width: integer('width'),
    height: integer('height'),
    durationSeconds: integer('durationSeconds'),
    originalStorageKey: text('originalStorageKey').notNull(),
    status: mediaStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
    disabledAt: timestamp('disabledAt', { withTimezone: true }),
  },
  (table) => [
    index('media_library_vendorId_idx').on(table.vendorId),
    index('media_library_vendorId_status_idx').on(table.vendorId, table.status),
    index('media_library_vendorId_mediaType_idx').on(table.vendorId, table.mediaType),
    check('media_library_file_size_positive_check', sql`${table.fileSizeBytes} > 0`),
  ],
);
