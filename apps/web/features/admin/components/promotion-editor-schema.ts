import { z } from 'zod';

export const promotionFormSchema = z
  .object({
    eyebrow: z.string().trim().max(60),
    title: z.string().trim().min(1).max(120),
    subtitle: z.string().trim().max(240),
    imageUrl: z.string().trim(),
    mobileImageUrl: z.string().trim(),
    ctaLabel: z.string().trim().min(1).max(40),
    ctaHref: z
      .string()
      .trim()
      .regex(/^\/(?!\/)/, 'Enter a valid marketplace destination.'),
    startsAt: z
      .string()
      .min(1)
      .refine((value) => Number.isFinite(Date.parse(value)), 'Choose a valid start date and time.'),
    endsAt: z
      .string()
      .min(1)
      .refine((value) => Number.isFinite(Date.parse(value)), 'Choose a valid end date and time.'),
    position: z.coerce.number().int().min(1).max(1000),
    published: z.boolean(),
  })
  .refine((values) => new Date(values.endsAt) > new Date(values.startsAt), {
    message: 'End date must be after start date.',
    path: ['endsAt'],
  });

export type PromotionFormInput = z.input<typeof promotionFormSchema>;
export type PromotionFormValues = z.output<typeof promotionFormSchema>;

export const emptyPromotionForm: PromotionFormValues = {
  eyebrow: '',
  title: '',
  subtitle: '',
  imageUrl: '',
  mobileImageUrl: '',
  ctaLabel: '',
  ctaHref: '/products',
  startsAt: '',
  endsAt: '',
  position: 1,
  published: false,
};

export function localDateTime(value: string) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}
