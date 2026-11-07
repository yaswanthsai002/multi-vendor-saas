import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter at least 2 characters.').max(100),
});

export const deliveryPinSchema = z.object({
  postalCode: z
    .string()
    .trim()
    .regex(/^[1-9]\d{5}$/, 'Enter a valid six-digit Indian PIN code.'),
});

export const addressFormSchema = z.object({
  recipientName: z.string().trim().min(2, 'Enter recipient name.').max(100),
  phone: z.string().trim().min(7, 'Enter a valid phone number.').max(20),
  addressLine1: z.string().trim().min(3, 'Enter house, flat, or building details.').max(200),
  postalArea: z.string().trim().max(100),
  streetAddress: z.string().trim().max(200),
  city: z.string().trim().min(2, 'Enter city.').max(100),
  state: z.string().trim().min(2, 'Enter state.').max(100),
  postalCode: z
    .string()
    .trim()
    .regex(/^[1-9]\d{5}$/, 'Enter a valid six-digit PIN code.'),
  isDefault: z.boolean(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type DeliveryPinFormValues = z.infer<typeof deliveryPinSchema>;
export type AddressFormValues = z.infer<typeof addressFormSchema>;
