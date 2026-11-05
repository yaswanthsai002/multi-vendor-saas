import { z } from 'zod';

export const initiateBulkImportSchema = z.object({
  filename: z
    .string()
    .trim()
    .min(1, 'Filename is required.')
    .max(255, 'Filename is too long.')
    .regex(/\.(xlsx|csv)$/i, 'Only Excel (.xlsx) and CSV (.csv) files are supported.'),
});

export const importIdParamSchema = z.object({
  importId: z.string().uuid('Invalid import ID format.'),
});

export const csvRowSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Product name must be at least 2 characters.')
      .max(255, 'Product name cannot exceed 255 characters.'),
    description: z
      .string()
      .trim()
      .min(10, 'Product description must be at least 10 characters.')
      .max(5000, 'Product description cannot exceed 5000 characters.'),
    price: z
      .string()
      .trim()
      .regex(
        /^\d{1,10}(\.\d{1,2})?$/,
        'Price must be a valid non-negative decimal with up to 2 decimal places.',
      ),
    mrp: z
      .string()
      .trim()
      .regex(
        /^$|^\d{1,10}(\.\d{1,2})?$/,
        'MRP must be a valid non-negative decimal with up to 2 decimal places.',
      )
      .min(1, 'MRP is required.'),
    stock: z.coerce.number().int('Stock must be an integer.').min(0, 'Stock cannot be negative.'),
    category: z
      .string()
      .trim()
      .min(1, 'Category slug is required.')
      .max(100, 'Category slug is too long.'),
  })
  .refine(
    (data) =>
      data.mrp.length === 0 ||
      Number.isNaN(Number(data.price)) ||
      Number.isNaN(Number(data.mrp)) ||
      Number(data.mrp) >= Number(data.price),
    {
      path: ['mrp'],
      message: 'MRP cannot be lower than selling price.',
    },
  );

export type InitiateBulkImportInput = z.infer<typeof initiateBulkImportSchema>;
export type ImportIdParam = z.infer<typeof importIdParamSchema>;
export type CsvRowInput = z.infer<typeof csvRowSchema>;
