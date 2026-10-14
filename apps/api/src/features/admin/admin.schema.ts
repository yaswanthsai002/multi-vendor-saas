import { z } from 'zod';

export const getDashboardPerformanceQuerySchema = z
  .object({
    days: z.coerce.number().int().optional(),
    period: z.enum(['7d', '30d', '90d']).optional(),
  })
  .transform((data) => {
    let days = 7;
    if (data.days && [7, 30, 90].includes(data.days)) {
      days = data.days;
    } else if (data.period) {
      days = data.period === '90d' ? 90 : data.period === '30d' ? 30 : 7;
    }
    return { days };
  });

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  role: z.enum(['customer', 'vendor', 'admin']).optional(),
  status: z.string().trim().optional(),
});

export const updateUserStatusSchema = z
  .object({
    status: z.enum(['active', 'suspended']),
    reason: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'suspended') {
        return Boolean(data.reason && data.reason.length >= 3);
      }
      return true;
    },
    {
      message: 'A reason of at least 3 characters is required when suspending a user account.',
      path: ['reason'],
    },
  );

export const updateVendorStatusSchema = z
  .object({
    status: z.enum(['pending', 'active', 'suspended', 'rejected']),
    reason: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'suspended' || data.status === 'rejected') {
        return Boolean(data.reason && data.reason.length >= 3);
      }
      return true;
    },
    {
      message:
        'A reason of at least 3 characters is required when suspending or rejecting a vendor.',
      path: ['reason'],
    },
  );

export const toggleFeatureSchema = z.object({
  isFeatured: z.boolean(),
});

export const listAdminVendorsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  status: z.enum(['all', 'pending', 'active', 'suspended', 'rejected']).default('all'),
  isFeatured: z.enum(['true', 'false']).optional(),
});

export const listAdminProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  vendorId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  moderationStatus: z.enum(['all', 'approved', 'hidden', 'rejected']).default('all'),
  isFeatured: z.enum(['all', 'true', 'false']).default('all'),
  published: z.enum(['all', 'true', 'false']).default('all'),
  sortBy: z.enum(['name', 'vendor', 'price', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const updateProductModerationSchema = z
  .object({
    status: z.enum(['approved', 'hidden', 'rejected']),
    reason: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'rejected') {
        return Boolean(data.reason && data.reason.length >= 3);
      }
      return true;
    },
    {
      message: 'A reason of at least 3 characters is required when rejecting a product.',
      path: ['reason'],
    },
  );

export const listAdminOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  status: z.enum(['all', 'pending', 'confirmed', 'completed', 'cancelled']).default('all'),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateVendorStatusInput = z.infer<typeof updateVendorStatusSchema>;
export type ToggleFeatureInput = z.infer<typeof toggleFeatureSchema>;
export type ListAdminVendorsQuery = z.infer<typeof listAdminVendorsQuerySchema>;
export type ListAdminProductsQuery = z.infer<typeof listAdminProductsQuerySchema>;
export type UpdateProductModerationInput = z.infer<typeof updateProductModerationSchema>;
export type ListAdminOrdersQuery = z.infer<typeof listAdminOrdersQuerySchema>;
