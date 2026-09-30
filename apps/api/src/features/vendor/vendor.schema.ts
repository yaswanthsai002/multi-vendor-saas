import { z } from 'zod';

export const productIdParamSchema = z.object({
  productId: z.string().uuid('Invalid product ID format.'),
});

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Product name must be at least 2 characters.')
    .max(255, 'Product name cannot exceed 255 characters.'),
  description: z.string().trim().min(10, 'Product description must be at least 10 characters.'),
  price: z
    .string()
    .regex(
      /^\d{1,10}(\.\d{1,2})?$/,
      'Price must be a valid non-negative decimal with up to 2 decimal places.',
    ),
  stock: z.number().int('Stock must be an integer.').min(0, 'Stock cannot be negative.'),
  productImageId: z.string().uuid('Product image must be a valid UUID.').nullable().optional(),
  galleryMediaIds: z.array(z.string().uuid('Media ID must be a valid UUID.')).optional(),
  categoryIds: z.array(z.string().uuid('Category ID must be a valid UUID.')).optional(),
  slug: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must consist of lowercase alphanumeric characters separated by single hyphens.',
    )
    .optional(),
});

export const updateProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Product name must be at least 2 characters.')
      .max(255, 'Product name cannot exceed 255 characters.')
      .optional(),
    description: z
      .string()
      .trim()
      .min(10, 'Product description must be at least 10 characters.')
      .optional(),
    price: z
      .string()
      .regex(
        /^\d{1,10}(\.\d{1,2})?$/,
        'Price must be a valid non-negative decimal with up to 2 decimal places.',
      )
      .optional(),
    stock: z
      .number()
      .int('Stock must be an integer.')
      .min(0, 'Stock cannot be negative.')
      .optional(),
    productImageId: z.string().uuid('Product image must be a valid UUID.').nullable().optional(),
    galleryMediaIds: z.array(z.string().uuid('Media ID must be a valid UUID.')).optional(),
    categoryIds: z.array(z.string().uuid('Category ID must be a valid UUID.')).optional(),
    slug: z
      .string()
      .trim()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must consist of lowercase alphanumeric characters separated by single hyphens.',
      )
      .optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: 'At least one field must be provided for update.',
  });

export const getVendorProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  categoryId: z.string().uuid('Invalid category ID format.').optional(),
  sortBy: z.enum(['createdAt', 'price', 'name', 'stock']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const getVendorDashboardQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d']).default('7d'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type GetVendorProductsQuery = z.infer<typeof getVendorProductsQuerySchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;
export type GetVendorDashboardQuery = z.infer<typeof getVendorDashboardQuerySchema>;
