import { z } from 'zod';

const addressFields = {
  recipientName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  addressLine1: z.string().trim().min(3).max(200),
  addressLine2: z.string().trim().max(200).nullable(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z
    .string()
    .trim()
    .regex(/^[1-9]\d{5}$/, 'Enter a valid six-digit Indian PIN code.'),
};

export const createCustomerAddressSchema = z.strictObject({
  ...addressFields,
  addressLine2: addressFields.addressLine2.default(null),
  country: z.literal('IN').default('IN'),
  isDefault: z.boolean().default(false),
});

export const updateCustomerAddressSchema = z
  .strictObject({ ...addressFields, country: z.literal('IN'), isDefault: z.boolean() })
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required.');

export const customerAddressParamsSchema = z.strictObject({ addressId: z.uuid() });

export type CreateCustomerAddressInput = z.infer<typeof createCustomerAddressSchema>;
export type UpdateCustomerAddressInput = z.infer<typeof updateCustomerAddressSchema>;
