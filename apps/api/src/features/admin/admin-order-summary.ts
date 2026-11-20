import { orders } from '@repo/db/schema';
import { sql } from 'drizzle-orm';

import { STORAGE_BUCKETS, storageService } from '../../shared/storage/storage.service.js';

export type OrderSummary = {
  total: string;
  itemCount: number;
  vendorCount: number;
  cancelledVendorCount: number;
  previews: {
    name: string;
    quantity: number;
    mediaId: string | null;
    mediaVendorId: string | null;
    storageKey: string | null;
  }[];
};

export function adminOrderSummarySql() {
  const orderId = sql`${orders}.${sql.identifier(orders.orderId.name)}`;
  return sql<OrderSummary>`(SELECT json_build_object(
    'total', COALESCE(SUM(i."productPriceSnapshot" * i."productQuantity"), 0)::text,
    'itemCount', COALESCE(SUM(i."productQuantity"), 0),
    'vendorCount', COUNT(DISTINCT v."vendorOrderId"),
    'cancelledVendorCount', COUNT(DISTINCT v."vendorOrderId") FILTER (WHERE v.status = 'cancelled'),
    'previews', (SELECT COALESCE(json_agg(preview), '[]'::json) FROM (
      SELECT oi."productNameSnapshot" AS name, oi."productQuantity" AS quantity,
        m."mediaId" AS "mediaId", m."vendorId" AS "mediaVendorId", m."originalStorageKey" AS "storageKey"
      FROM "orderItems" oi JOIN "vendorOrders" vo ON vo."vendorOrderId" = oi."vendorOrderId"
      LEFT JOIN products p ON p."productId" = oi."productId"
      LEFT JOIN "mediaLibrary" m ON m."mediaId" = p."productImageId"
      WHERE vo."orderId" = ${orderId} ORDER BY oi."orderItemId" LIMIT 2
    ) preview)
  ) FROM "vendorOrders" v LEFT JOIN "orderItems" i ON i."vendorOrderId" = v."vendorOrderId"
    WHERE v."orderId" = ${orderId})`;
}

export function orderProductImage(media: {
  mediaId: string | null;
  mediaVendorId: string | null;
  storageKey: string | null;
}) {
  return media.mediaId && media.mediaVendorId && media.storageKey
    ? storageService.resolveUrl(
        `vendors/${media.mediaVendorId}/media/${media.mediaId}/thumbnail.webp`,
        STORAGE_BUCKETS.productMedia,
      )
    : null;
}

export function orderSummaryResponse(summary: OrderSummary) {
  return {
    total: summary.total,
    itemCount: summary.itemCount,
    vendorCount: summary.vendorCount,
    cancelledVendorCount: summary.cancelledVendorCount,
    previews: summary.previews.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      imageUrl: orderProductImage(item),
    })),
  };
}
