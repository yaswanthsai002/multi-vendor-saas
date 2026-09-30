import { z } from 'zod';

export const listCategoriesQuerySchema = z.object({
  parentCategoryId: z.string().uuid('Invalid parentCategoryId format').optional(),
});

export const categoryIdParamSchema = z.object({
  categoryId: z.string().uuid('Invalid categoryId format'),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  parentCategoryId: z.string().uuid('Invalid parentCategoryId format').nullable().optional(),
  imageUrl: z.string().url('Invalid imageUrl format').nullable().optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(100, 'Name must be 100 characters or fewer')
    .optional(),
  parentCategoryId: z.string().uuid('Invalid parentCategoryId format').nullable().optional(),
  imageUrl: z.string().url('Invalid imageUrl format').nullable().optional(),
});

export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;
export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
