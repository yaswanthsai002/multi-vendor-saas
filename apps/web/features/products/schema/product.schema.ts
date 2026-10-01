import { z } from 'zod';

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Product name must be at least 2 characters.')
    .max(255, 'Product name cannot exceed 255 characters.'),
  shortDescription: z
    .string()
    .trim()
    .max(500, 'Short description cannot exceed 500 characters.')
    .optional()
    .nullable(),
  description: z.string().default(''),
  price: z
    .string()
    .min(1, 'Price is required.')
    .regex(/^\d{1,10}(\.\d{1,2})?$/, 'Please enter a valid price (e.g. 1299.00).'),
  stock: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? val : num;
    },
    z
      .number({ message: 'Stock is required.' })
      .int('Stock must be an integer.')
      .min(1, 'Stock must be at least 1.'),
  ),
  productImageId: z.string().uuid().nullable().optional(),
  galleryMediaIds: z.array(z.string().uuid()).default([]),
  categoryIds: z.array(z.string().uuid()).max(1, 'Only one category can be selected.').default([]),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
