import { z } from 'zod';

export const postalCodeParamsSchema = z.strictObject({
  postalCode: z.string().regex(/^[1-9]\d{5}$/, 'Enter a valid six-digit Indian PIN code.'),
});
