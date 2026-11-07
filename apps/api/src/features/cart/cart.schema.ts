import { z } from 'zod';

export const addSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(999),
});
export const quantitySchema = z.object({ quantity: z.number().int().min(1).max(999) });
export const itemParamsSchema = z.object({ productId: z.string().uuid() });
