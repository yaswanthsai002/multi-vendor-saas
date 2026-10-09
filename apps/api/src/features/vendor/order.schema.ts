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

export const updateVendorOrderStatusSchema = z.object({
  status: z.enum(['processing', 'completed', 'cancelled']),
  cancellationReason: z.string().trim().min(1).max(500).optional().nullable(),
});

export type UpdateVendorOrderStatusInput = z.infer<typeof updateVendorOrderStatusSchema>;
