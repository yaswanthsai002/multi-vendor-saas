import { z } from 'zod';

const internalHref = z
  .string()
  .trim()
  .refine(
    (value) => value.startsWith('/') && !value.startsWith('//') && !value.includes('\\'),
    'Use an internal marketplace link.',
  );
const mediaId = z.string().uuid();
const draftHref = z
  .string()
  .max(512)
  .refine(
    (value) =>
      value === '' || (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')),
  );
const draftDateTime = z
  .string()
  .max(32)
  .refine(
    (value) => value === '' || Number.isFinite(Date.parse(value)),
    'Choose a valid date and time.',
  );
const draftDealPrice = z
  .string()
  .max(13)
  .refine(
    (value) =>
      value === '' || /^(?:0\.(?:0[1-9]|[1-9]\d?)|[1-9]\d{0,9}(?:\.\d{1,2})?)$/.test(value),
    'Enter a valid deal price.',
  );

export const promotionDraftPayloadSchema = z.strictObject({
  eyebrow: z.string().max(60).optional(),
  title: z.string().max(120).optional(),
  subtitle: z.string().max(240).optional(),
  imageMediaId: mediaId.nullable().optional(),
  mobileImageMediaId: mediaId.nullable().optional(),
  ctaLabel: z.string().max(40).optional(),
  ctaHref: draftHref.optional(),
  startsAt: draftDateTime.optional(),
  endsAt: draftDateTime.optional(),
  position: z.number().int().min(0).max(1000).optional(),
  products: z
    .array(
      z.strictObject({
        productId: z.string().uuid(),
        dealPrice: draftDealPrice,
      }),
    )
    .max(50)
    .refine((items) => new Set(items.map((item) => item.productId)).size === items.length)
    .optional(),
});

export const createPromotionDraftSchema = z.strictObject({
  sourceCampaignId: z.string().uuid().optional(),
});

export const promotionDraftIdParamsSchema = z.strictObject({
  campaignId: z.string().uuid(),
});

export const campaignListQuerySchema = z.strictObject({
  status: z.enum(['all', 'draft', 'published']).default('all'),
});

export type PromotionDraftPayload = z.infer<typeof promotionDraftPayloadSchema>;

export const saveCampaignSchema = z
  .strictObject({
    eyebrow: z.string().trim().min(1).max(60),
    title: z.string().trim().min(1).max(120),
    subtitle: z.string().trim().min(1).max(240),
    imageMediaId: mediaId,
    mobileImageMediaId: mediaId.nullable().optional(),
    ctaLabel: z.string().trim().min(1).max(40),
    ctaHref: internalHref,
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
    position: z.number().int().min(0).max(1000).default(0),
    published: z.boolean().default(false),
    products: z
      .array(
        z.strictObject({
          productId: z.string().uuid(),
          dealPrice: z
            .string()
            .max(13)
            .regex(/^(?:0\.(?:0[1-9]|[1-9]\d?)|[1-9]\d{0,9}(?:\.\d{1,2})?)$/),
        }),
      )
      .min(1)
      .max(50),
  })
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    message: 'Campaign end must be after its start.',
    path: ['endsAt'],
  })
  .refine(
    (data) => new Set(data.products.map((item) => item.productId)).size === data.products.length,
    {
      message: 'A product can appear only once in a campaign.',
      path: ['products'],
    },
  );

export type SaveCampaignInput = z.infer<typeof saveCampaignSchema>;
