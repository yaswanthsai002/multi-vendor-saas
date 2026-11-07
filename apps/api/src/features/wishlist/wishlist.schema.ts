import { z } from 'zod';

export const productIdSchema = z.object({ productId: z.uuid() });
