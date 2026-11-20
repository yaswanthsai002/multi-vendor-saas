import { z } from 'zod';

export const listVendorOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['all', 'pending', 'processing', 'completed', 'cancelled']).default('all'),
  search: z.string().trim().optional(),
  dateFrom: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional(),
  dateTo: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional(),
  sort: z.enum(['newest', 'oldest', 'total_desc', 'total_asc']).default('newest'),
});

export type ListVendorOrdersQuery = z.infer<typeof listVendorOrdersQuerySchema>;

export const vendorOrderIdParamSchema = z.object({
  vendorOrderId: z.string().uuid(),
});

export type VendorOrderIdParam = z.infer<typeof vendorOrderIdParamSchema>;

export const cancellationReasonCodeSchema = z.enum([
  'OUT_OF_STOCK',
  'QUALITY_ISSUE',
  'LISTING_ERROR',
  'OPERATIONAL_ISSUE',
  'OTHER',
]);
export const updateVendorOrderStatusSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('processing') }).strict(),
  z.object({ status: z.literal('completed') }).strict(),
  z
    .object({
      status: z.literal('cancelled'),
      cancellationReasonCode: cancellationReasonCodeSchema,
      cancellationDetails: z.string().trim().max(500).optional(),
      items: z
        .array(
          z
            .object({
              orderItemId: z.uuid(),
              damagedQuantity: z.number().int().min(0).max(2147483647),
              missingQuantity: z.number().int().min(0).max(2147483647),
            })
            .strict(),
        )
        .min(1),
    })
    .strict()
    .superRefine((value, ctx) => {
      if (value.cancellationReasonCode === 'OTHER' && !value.cancellationDetails)
        ctx.addIssue({
          code: 'custom',
          path: ['cancellationDetails'],
          message: 'Explain the other reason for administrators.',
        });
      if (new Set(value.items.map((item) => item.orderItemId)).size !== value.items.length)
        ctx.addIssue({
          code: 'custom',
          path: ['items'],
          message: 'Each order item must appear once.',
        });
    }),
]);

export type UpdateVendorOrderStatusInput = z.infer<typeof updateVendorOrderStatusSchema>;
