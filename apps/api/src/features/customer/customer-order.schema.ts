import { z } from 'zod';

export const checkoutLineSchema = z.strictObject({
  productId: z.uuid().transform((value) => value.toLowerCase()),
  quantity: z.number().int().min(1).max(2147483647),
  expectedUnitPrice: z.string().regex(/^(0|[1-9]\d{0,9})\.\d{2}$/),
});
export const placeCustomerOrderSchema = z
  .strictObject({
    addressId: z.uuid().transform((value) => value.toLowerCase()),
    lines: z.array(checkoutLineSchema).min(1).max(200),
  })
  .refine(
    (input) => new Set(input.lines.map((line) => line.productId)).size === input.lines.length,
    { message: 'Each product must appear only once.', path: ['lines'] },
  );
export const checkoutReviewQuerySchema = z.strictObject({
  addressId: z
    .uuid()
    .transform((value) => value.toLowerCase())
    .optional(),
});
export const customerOrderParamsSchema = z.strictObject({ orderId: z.uuid() });
export const customerOrderPaginationSchema = z
  .strictObject({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z
      .enum([
        'Order placed',
        'In progress',
        'Partially cancelled',
        'Partially fulfilled',
        'Completed',
        'Cancelled',
      ])
      .optional(),
    orderedFrom: z.iso
      .date()
      .refine((date) => !date.startsWith('0000-'), 'Year must be at least 0001.')
      .optional(),
    orderedTo: z.iso
      .date()
      .refine((date) => !date.startsWith('0000-'), 'Year must be at least 0001.')
      .optional(),
  })
  .refine(
    (query) => !query.orderedFrom || !query.orderedTo || query.orderedFrom <= query.orderedTo,
    {
      message: 'End date must be on or after start date.',
      path: ['orderedTo'],
    },
  );
export type CustomerOrderQuery = z.infer<typeof customerOrderPaginationSchema>;
export const idempotencyKeySchema = z.uuid().transform((value) => value.toLowerCase());
export type PlaceCustomerOrderInput = z.infer<typeof placeCustomerOrderSchema>;
