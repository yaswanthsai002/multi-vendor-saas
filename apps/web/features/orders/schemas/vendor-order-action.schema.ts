import { z } from 'zod';

export const cancellationReasons = [
  { value: 'OUT_OF_STOCK', label: 'Insufficient stock' },
  { value: 'QUALITY_ISSUE', label: 'Item damaged or failed quality check' },
  { value: 'LISTING_ERROR', label: 'Product details are incorrect' },
  { value: 'OPERATIONAL_ISSUE', label: 'Unable to prepare the order' },
  { value: 'OTHER', label: 'Other reason' },
] satisfies { value: string; label: string }[];

export const vendorOrderActionSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('processing') }).strict(),
  z.object({ status: z.literal('completed') }).strict(),
  z
    .object({
      status: z.literal('cancelled'),
      cancellationReasonCode: z.enum([
        'OUT_OF_STOCK',
        'QUALITY_ISSUE',
        'LISTING_ERROR',
        'OPERATIONAL_ISSUE',
        'OTHER',
      ]),
      cancellationDetails: z.string().trim().max(500).optional(),
      items: z
        .array(
          z
            .object({
              orderItemId: z.string(),
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
    }),
]);

export type VendorOrderAction = z.infer<typeof vendorOrderActionSchema>;
