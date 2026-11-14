import { campaignProducts, campaigns } from '@repo/db/schema';
import { sql, type SQLWrapper } from 'drizzle-orm';

export function currentProductPriceSql(
  productId: SQLWrapper,
  regularPrice: SQLWrapper,
  at: SQLWrapper = sql`NOW()`,
) {
  return sql<string>`COALESCE((
    SELECT ${campaignProducts.dealPrice}
    FROM ${campaignProducts}
    INNER JOIN ${campaigns}
      ON ${campaigns.campaignId} = ${campaignProducts.campaignId}
    WHERE ${campaignProducts.productId} = ${productId}
      AND ${campaignProducts.dealPrice} < ${regularPrice}
      AND ${campaigns.status} = 'published'
      AND ${campaigns.startsAt} <= ${at}
      AND ${campaigns.endsAt} > ${at}
    ORDER BY ${campaigns.startsAt} DESC
    LIMIT 1
  ), ${regularPrice})`;
}
