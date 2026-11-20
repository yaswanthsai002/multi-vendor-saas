import { z } from 'zod';

export const vendorOrderStatusSchema = z.enum(['pending', 'processing', 'completed', 'cancelled']);
export const publicCancellationSchema = z.object({
  source: z.enum(['customer', 'vendor']),
  reasonCode: z
    .enum(['OUT_OF_STOCK', 'QUALITY_ISSUE', 'LISTING_ERROR', 'OPERATIONAL_ISSUE', 'OTHER'])
    .nullable(),
  reason: z.string(),
  cancelledAt: z.string().nullable(),
});
export const cancellationQuantitiesSchema = z.object({
  returnedQuantity: z.number().int().nonnegative(),
  damagedQuantity: z.number().int().nonnegative(),
  missingQuantity: z.number().int().nonnegative(),
});
export const orderItemDetailSchema = z.object({
  orderItemId: z.string(),
  productId: z.string(),
  productName: z.string(),
  productImageUrl: z.string().nullable(),
  unitPrice: z.string(),
  quantity: z.number(),
  subtotal: z.string(),
  cancellationQuantities: cancellationQuantitiesSchema.nullable(),
});
export const deliveryAddressDetailSchema = z.object({
  recipientName: z.string(),
  phone: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
});
export const vendorOrderDetailSchema = z.object({
  order: z.object({ orderNumber: z.string(), placedAt: z.string(), overallStatus: z.string() }),
  fulfillment: z.object({
    vendorOrderId: z.string(),
    status: vendorOrderStatusSchema,
    updatedAt: z.string(),
    completedAt: z.string().nullable(),
    cancellation: publicCancellationSchema.nullable(),
    allowedActions: z.array(z.enum(['process', 'complete', 'cancel'])),
  }),
  customer: z.object({ name: z.string(), email: z.string(), phone: z.string().nullable() }),
  deliveryAddress: deliveryAddressDetailSchema.nullable(),
  items: z.array(orderItemDetailSchema),
  summary: z.object({ itemCount: z.number(), total: z.string() }),
});
export const vendorOrdersListSchema = z.object({
  items: z.array(
    z.object({
      vendorOrderId: z.string(),
      orderNumber: z.string(),
      summary: z.object({
        items: z
          .array(z.object({ name: z.string(), quantity: z.number().int().nonnegative() }))
          .max(2),
        itemCount: z.number().int().nonnegative(),
        productCount: z.number().int().nonnegative(),
      }),
      customer: z.object({ name: z.string(), email: z.string() }),
      itemCount: z.number(),
      total: z.string(),
      placedAt: z.string(),
      status: vendorOrderStatusSchema,
    }),
  ),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
  statusCounts: z.object({
    all: z.number(),
    pending: z.number(),
    processing: z.number(),
    completed: z.number(),
    cancelled: z.number(),
  }),
});
