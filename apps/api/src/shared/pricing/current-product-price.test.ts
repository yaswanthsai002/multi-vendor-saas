import { products } from '@repo/db/schema';
import { sql } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';

import { currentProductPriceSql } from './current-product-price.js';

describe('currentProductPriceSql', () => {
  it('uses the captured checkout time for both eligibility bounds', () => {
    const at = '2026-11-13T12:00:00.000Z';
    const query = new PgDialect().sqlToQuery(
      currentProductPriceSql(products.productId, products.price, sql`${at}::timestamptz`),
    );
    expect(query.params).toEqual([at, at]);
    expect(query.sql).not.toContain('NOW()');
  });
  it('uses only active published deal prices below regular price and falls back to regular price', () => {
    const query = new PgDialect().sqlToQuery(
      currentProductPriceSql(products.productId, products.price),
    );

    expect(query.sql).toContain('FROM "campaign_products"');
    expect(query.sql).toContain('"campaigns"."status" = \'published\'');
    expect(query.sql).toContain('"campaigns"."starts_at" <= NOW()');
    expect(query.sql).toContain('"campaigns"."ends_at" > NOW()');
    expect(query.sql).toContain('"campaign_products"."deal_price" < "products"."price"');
    expect(query.sql).toContain('ORDER BY');
    expect(query.sql).toContain('LIMIT 1');
    expect(query.sql).toContain('COALESCE');
    expect(query.params).toEqual([]);
  });
});
