import { z } from 'zod';

const version = z.number().int().min(0).max(2147483647);
const reviewText = z
  .string()
  .trim()
  .refine(
    (value) =>
      !value.includes('\u0000') &&
      !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value),
    'Feedback contains invalid characters.',
  )
  .refine((value) => Array.from(value).length <= 2000, 'Use 2,000 characters or fewer.')
  .nullish()
  .transform((value) => value || null);

export const saveCustomerReviewSchema = z.strictObject({
  expectedVersion: version,
  rating: z.number().int().min(1).max(5),
  reviewText,
});
export type SaveCustomerReviewInput = z.infer<typeof saveCustomerReviewSchema>;
