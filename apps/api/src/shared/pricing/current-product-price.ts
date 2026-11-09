import { campaignProducts, campaigns } from '@repo/db/schema';
import { sql, type SQLWrapper } from 'drizzle-orm';

export function currentProductPriceSql(productId: SQLWrapper, regularPrice: SQLWrapper) {
  return sql<string>`COALESCE((
    SELECT ${campaignProducts.dealPrice}
    FROM ${campaignProducts}
    INNER JOIN ${campaigns}
      ON ${campaigns.campaignId} = ${campaignProducts.campaignId}
    WHERE ${campaignProducts.productId} = ${productId}
      AND ${campaignProducts.dealPrice} < ${regularPrice}
      AND ${campaigns.status} = 'published'
      AND ${campaigns.startsAt} <= NOW()
      AND ${campaigns.endsAt} > NOW()
    ORDER BY ${campaigns.startsAt} DESC
    LIMIT 1
  ), ${regularPrice})`;
}
