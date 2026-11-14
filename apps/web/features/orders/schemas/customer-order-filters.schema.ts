import { z } from 'zod';

export const CUSTOMER_ORDER_STATUSES = [
  'Order placed',
  'In progress',
  'Partially cancelled',
  'Partially fulfilled',
  'Completed',
  'Cancelled',
] as const;

export const customerOrderListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    status: z.enum(CUSTOMER_ORDER_STATUSES).optional(),
    orderedFrom: z.iso
      .date()
      .refine((date) => !date.startsWith('0000-'), 'Choose a valid year')
      .optional(),
    orderedTo: z.iso
      .date()
      .refine((date) => !date.startsWith('0000-'), 'Choose a valid year')
      .optional(),
  })
  .refine(
    (query) => !query.orderedFrom || !query.orderedTo || query.orderedFrom <= query.orderedTo,
    { message: 'End date must be on or after start date.', path: ['orderedTo'] },
  );

export const customerOrderFiltersSchema = z
  .object({
    status: z.union([z.literal(''), z.enum(CUSTOMER_ORDER_STATUSES)]),
    orderedFrom: z.union([
      z.literal(''),
      z.iso
        .date('Choose a valid start date')
        .refine((date) => !date.startsWith('0000-'), 'Choose a valid year'),
    ]),
    orderedTo: z.union([
      z.literal(''),
      z.iso
        .date('Choose a valid end date')
        .refine((date) => !date.startsWith('0000-'), 'Choose a valid year'),
    ]),
  })
  .refine(
    (query) => !query.orderedFrom || !query.orderedTo || query.orderedFrom <= query.orderedTo,
    { message: 'End date must be on or after start date', path: ['orderedTo'] },
  );

export type CustomerOrderQuery = z.infer<typeof customerOrderListQuerySchema>;
export type CustomerOrderFilterValues = z.infer<typeof customerOrderFiltersSchema>;
