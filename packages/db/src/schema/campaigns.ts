import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { products } from './products.js';
import { users } from './users.js';

export type CampaignStatus = 'draft' | 'published';

export const campaigns = pgTable(
  'campaigns',
  {
    campaignId: uuid('campaign_id').notNull().defaultRandom().primaryKey(),
    status: text('status').$type<CampaignStatus>().notNull().default('draft'),
    sourceCampaignId: uuid('source_campaign_id'),
    ownerUserId: uuid('owner_user_id').references(() => users.userId, { onDelete: 'cascade' }),
    draftPayload: jsonb('draft_payload').$type<Record<string, unknown>>(),
    draftDesktopBannerPrefix: text('draft_desktop_banner_prefix'),
    draftMobileBannerPrefix: text('draft_mobile_banner_prefix'),
    eyebrow: text('eyebrow'),
    title: text('title'),
    subtitle: text('subtitle'),
    imageUrl: text('image_url'),
    mobileImageUrl: text('mobile_image_url'),
    ctaLabel: text('cta_label'),
    ctaHref: text('cta_href'),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    position: integer('position').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.sourceCampaignId],
      foreignColumns: [table.campaignId],
      name: 'campaigns_source_campaign_id_campaigns_campaign_id_fk',
    }).onDelete('cascade'),
    index('campaigns_status_schedule_idx').on(
      table.status,
      table.startsAt,
      table.endsAt,
      table.position,
    ),
    index('campaigns_owner_updated_idx').on(table.ownerUserId, table.updatedAt),
    uniqueIndex('campaigns_owner_source_unique')
      .on(table.ownerUserId, table.sourceCampaignId)
      .where(sql`${table.sourceCampaignId} IS NOT NULL`),
    check('campaigns_status_check', sql`${table.status} IN ('draft', 'published')`),
    check(
      'campaigns_draft_payload_check',
      sql`${table.status} = 'published' OR ${table.draftPayload} IS NOT NULL`,
    ),
    check(
      'campaigns_published_fields_check',
      sql`${table.status} = 'draft' OR (
        ${table.eyebrow} IS NOT NULL AND ${table.title} IS NOT NULL AND
        ${table.subtitle} IS NOT NULL AND ${table.imageUrl} IS NOT NULL AND
        ${table.ctaLabel} IS NOT NULL AND ${table.ctaHref} IS NOT NULL AND
        ${table.startsAt} IS NOT NULL AND ${table.endsAt} IS NOT NULL AND
        ${table.endsAt} > ${table.startsAt}
      )`,
    ),
  ],
);

export const campaignProducts = pgTable(
  'campaign_products',
  {
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.campaignId, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.productId, { onDelete: 'cascade' }),
    dealPrice: numeric('deal_price', { precision: 12, scale: 2 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.campaignId, table.productId] }),
    index('campaign_products_product_id_idx').on(table.productId),
    check('campaign_products_deal_price_positive_check', sql`${table.dealPrice} > 0`),
  ],
);
