import { z } from 'zod';

export const vendorProfileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Store name must be at least 2 characters.')
    .max(100, 'Store name cannot exceed 100 characters.'),
  tagline: z
    .string()
    .trim()
    .max(150, 'Tagline cannot exceed 150 characters.')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .trim()
    .max(1000, 'Description cannot exceed 1000 characters.')
    .optional()
    .or(z.literal('')),
  logoUrl: z.string().url('Logo must be a valid image URL.').optional().or(z.literal('')),
  bannerUrl: z.string().url('Banner must be a valid image URL.').optional().or(z.literal('')),
  fullName: z
    .string()
    .trim()
    .min(2, 'Owner full name must be at least 2 characters.')
    .max(100, 'Owner full name cannot exceed 100 characters.'),
});

export type VendorProfileFormData = z.infer<typeof vendorProfileFormSchema>;
