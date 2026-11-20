import { z } from 'zod';

export const adminOrderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  search: z.string().trim().max(200).catch(''),
  status: z.enum(['all', 'pending', 'confirmed', 'completed', 'cancelled']).catch('all'),
});
export type AdminOrderQuery = z.infer<typeof adminOrderQuerySchema>;

const orderSummarySchema = z.object({
  total: z.string(),
  itemCount: z.number().int().nonnegative(),
  vendorCount: z.number().int().nonnegative(),
  cancelledVendorCount: z.number().int().nonnegative(),
  previews: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number().int().nonnegative(),
        imageUrl: z.string().nullable(),
      }),
    )
    .max(2),
});
export const adminOrdersSchema = z.object({
  orders: z.array(
    z.object({
      orderId: z.string(),
      orderNumber: z.string(),
      status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
      createdAt: z.string(),
      customer: z.object({ name: z.string(), email: z.string() }),
      summary: orderSummarySchema,
    }),
  ),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
});
export type AdminOrdersResponse = z.infer<typeof adminOrdersSchema>;
export type AdminOrderItem = AdminOrdersResponse['orders'][number];

const cancellationSchema = z.object({
  source: z.enum(['customer', 'vendor']),
  reasonCode: z.string().nullable(),
  reason: z.string(),
  cancelledAt: z.string().nullable(),
});
export const adminOrderDetailSchema = z.object({
  orderId: z.string(),
  orderNumber: z.string(),
  status: z.string(),
  createdAt: z.string(),
  summary: orderSummarySchema,
  customer: z.object({ userId: z.string(), name: z.string(), email: z.string() }).nullable(),
  deliveryAddress: z
    .object({
      recipientName: z.string(),
      phone: z.string(),
      addressLine1: z.string(),
      addressLine2: z.string().nullable(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string(),
    })
    .nullable(),
  fulfillments: z.array(
    z.object({
      vendorOrderId: z.string(),
      vendorName: z.string(),
      total: z.string(),
      status: z.string(),
      completedAt: z.string().nullable(),
      cancellation: cancellationSchema.nullable(),
      cancellationDetails: z.string().nullable(),
      cancelledByUserId: z.string().nullable(),
      items: z.array(
        z.object({
          orderItemId: z.string(),
          productName: z.string(),
          imageUrl: z.string().nullable(),
          subtotal: z.string(),
          unitPrice: z.string(),
          quantity: z.number(),
          cancellationReturnedQuantity: z.number().nullable(),
          cancellationDamagedQuantity: z.number().nullable(),
          cancellationMissingQuantity: z.number().nullable(),
        }),
      ),
    }),
  ),
});
export type AdminOrderDetail = z.infer<typeof adminOrderDetailSchema>;
