import { vendorOrders } from '@repo/db/schema';
import { sql } from 'drizzle-orm';

type OrderItemSummary = {
  items: { name: string; quantity: number }[];
  itemCount: number;
  productCount: number;
};

export function orderItemSummarySql() {
  // Explicit qualification survives embedding inside another single-table SELECT.
  const portion = sql`${vendorOrders}.${sql.identifier(vendorOrders.vendorOrderId.name)}`;
  return sql<OrderItemSummary>`(
    SELECT json_build_object(
      'items', (SELECT COALESCE(json_agg(preview), '[]'::json) FROM (
        SELECT "productNameSnapshot" AS name, "productQuantity" AS quantity
        FROM "orderItems" WHERE "vendorOrderId" = ${portion}
        ORDER BY "orderItemId" LIMIT 2
      ) preview),
      'itemCount', COALESCE(SUM("productQuantity"), 0),
      'productCount', COUNT(*)
    ) FROM "orderItems" WHERE "vendorOrderId" = ${portion}
  )`;
}
