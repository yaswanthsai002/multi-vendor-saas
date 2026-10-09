import { z } from 'zod';

export const updateVendorProfileSchema = z
  .object({
    // Store identity
    name: z
      .string()
      .trim()
      .min(2, 'Store name must be at least 2 characters.')
      .max(100, 'Store name cannot exceed 100 characters.')
      .optional(),
    tagline: z
      .string()
      .trim()
      .max(150, 'Tagline cannot exceed 150 characters.')
      .nullable()
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, 'Description cannot exceed 1000 characters.')
      .nullable()
      .optional(),
    logoUrl: z.string().url('Logo URL must be a valid URL.').nullable().optional(),
    bannerUrl: z.string().url('Banner URL must be a valid URL.').nullable().optional(),
    // Owner identity
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters.')
      .max(100, 'Full name cannot exceed 100 characters.')
      .optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: 'At least one field must be provided for update.',
  });

export type UpdateVendorProfileInput = z.infer<typeof updateVendorProfileSchema>;
