import { z } from 'zod';

export const checkoutAddressSchema = z.object({
  addressId: z.uuid('Choose a saved delivery address.'),
});
export const checkoutRequestSchema = checkoutAddressSchema.extend({
  lines: z
    .array(
      z.strictObject({
        productId: z.uuid(),
        quantity: z.number().int().positive(),
        expectedUnitPrice: z.string().regex(/^(0|[1-9]\d{0,9})\.\d{2}$/),
      }),
    )
    .min(1)
    .max(200),
});
export const pendingCheckoutSchema = z.strictObject({
  key: z.uuid(),
  request: checkoutRequestSchema,
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export type PendingCheckout = z.infer<typeof pendingCheckoutSchema>;
