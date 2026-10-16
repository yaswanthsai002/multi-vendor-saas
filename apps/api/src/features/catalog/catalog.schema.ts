import { z } from 'zod';

export const listCatalogProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().max(100).optional(),
  category: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => {
      const items = Array.isArray(val) ? val : val.split(',');
      const cleaned = items.map((s) => s.trim()).filter(Boolean);
      return cleaned.length > 0 ? cleaned : undefined;
    })
    .optional(),
  vendor: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  isFeatured: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  sortBy: z.enum(['featured', 'price_asc', 'price_desc', 'newest']).default('featured'),
});

export type ListCatalogProductsQuery = z.infer<typeof listCatalogProductsQuerySchema>;

export const catalogProductParamsSchema = z.object({
  slug: z.string().trim().min(1),
});

export type CatalogProductParams = z.infer<typeof catalogProductParamsSchema>;
