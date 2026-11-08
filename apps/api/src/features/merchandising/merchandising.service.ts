import { randomUUID } from 'node:crypto';

import { getDb } from '@repo/db';
import {
  campaignProducts,
  campaigns,
  mediaLibrary,
  productReviews,
  products,
  users,
  vendors,
} from '@repo/db/schema';
import { and, asc, count, desc, eq, gt, inArray, lt, sql } from 'drizzle-orm';

import { AppError } from '../../shared/errors/AppError.js';
import { processImage } from '../../shared/media/image-processor.js';
import { STORAGE_BUCKETS, storageService } from '../../shared/storage/storage.service.js';

import {
  campaignBannerCompleteSchema,
  promotionDraftPayloadSchema,
  saveCampaignSchema,
} from './merchandising.schema.js';

import type { PromotionDraftPayload, SaveCampaignInput } from './merchandising.schema.js';

type Transaction = Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0];
const CAMPAIGN_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_CAMPAIGN_IMAGE_BYTES = 10 * 1024 * 1024;

async function getOwnedDraft(ownerUserId: string, draftId: string) {
  const db = getDb();
  const [draft] = await db
    .select({
      desktopBannerPrefix: campaigns.draftDesktopBannerPrefix,
      mobileBannerPrefix: campaigns.draftMobileBannerPrefix,
    })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.campaignId, draftId),
        eq(campaigns.ownerUserId, ownerUserId),
        eq(campaigns.status, 'draft'),
      ),
    )
    .limit(1);
  if (!draft) throw new AppError(404, 'PROMOTION_DRAFT_NOT_FOUND', 'Promotion draft not found.');
  return draft;
}

export async function initiateCampaignBannerUpload(
  ownerUserId: string,
  draftId: string,
  slot: 'desktop' | 'mobile',
  input: { fileName: string; fileSizeBytes: number; mimeType: string },
) {
  if (!CAMPAIGN_IMAGE_MIMES.has(input.mimeType)) {
    throw new AppError(400, 'UNSUPPORTED_MEDIA_TYPE', 'Use a JPEG, PNG, or WebP banner image.');
  }
  if (input.fileSizeBytes > MAX_CAMPAIGN_IMAGE_BYTES) {
    throw new AppError(400, 'FILE_TOO_LARGE', 'Banner image must be 10 MB or smaller.');
  }
  await getOwnedDraft(ownerUserId, draftId);
  const storagePrefix = `homepage-campaign-drafts/${draftId}/${slot}/${randomUUID()}`;
  const storageKey = `${storagePrefix}/original`;
  return {
    uploadUrl: await storageService.generatePresignedPutUrl(
      storageKey,
      input.mimeType,
      900,
      STORAGE_BUCKETS.productMedia,
    ),
    storageKey,
    fileName: input.fileName,
    fileSizeBytes: input.fileSizeBytes,
    mimeType: input.mimeType,
  };
}

export async function completeCampaignBannerUpload(
  ownerUserId: string,
  draftId: string,
  slot: 'desktop' | 'mobile',
  rawInput: { storageKey: string; fileName: string; fileSizeBytes: number; mimeType: string },
) {
  const input = campaignBannerCompleteSchema.parse(rawInput);
  const prefixPattern = new RegExp(
    `^homepage-campaign-drafts/${draftId}/${slot}/[0-9a-f-]{36}/original$`,
    'i',
  );
  if (!prefixPattern.test(input.storageKey)) {
    throw new AppError(400, 'INVALID_STORAGE_KEY', 'Invalid campaign banner upload key.');
  }
  const draft = await getOwnedDraft(ownerUserId, draftId);
  const head = await storageService.headObject(input.storageKey, STORAGE_BUCKETS.productMedia);
  if (!head) throw new AppError(404, 'STORAGE_OBJECT_NOT_FOUND', 'Uploaded banner was not found.');
  if (head.contentLength !== input.fileSizeBytes || head.contentType !== input.mimeType) {
    throw new AppError(400, 'UPLOAD_METADATA_MISMATCH', 'Uploaded banner metadata did not match.');
  }
  const storagePrefix = input.storageKey.slice(0, -'/original'.length);
  try {
    const dimensions = await processImage(
      await storageService.getObjectBuffer(input.storageKey, STORAGE_BUCKETS.productMedia),
      storagePrefix,
    );
    const previousPrefix =
      slot === 'desktop' ? draft.desktopBannerPrefix : draft.mobileBannerPrefix;
    const updated = await getDb()
      .update(campaigns)
      .set({
        [slot === 'desktop' ? 'draftDesktopBannerPrefix' : 'draftMobileBannerPrefix']:
          storagePrefix,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(campaigns.campaignId, draftId),
          eq(campaigns.ownerUserId, ownerUserId),
          eq(campaigns.status, 'draft'),
        ),
      )
      .returning({ draftId: campaigns.campaignId });
    if (!updated.length)
      throw new AppError(404, 'PROMOTION_DRAFT_NOT_FOUND', 'Promotion draft not found.');
    if (previousPrefix && previousPrefix !== storagePrefix) {
      await storageService.deletePrefix(previousPrefix, STORAGE_BUCKETS.productMedia);
    }
    return {
      imageUrl: storageService.resolveUrl(
        `${storagePrefix}/large.webp`,
        STORAGE_BUCKETS.productMedia,
      ),
      ...dimensions,
    };
  } catch (error) {
    await storageService.deletePrefix(storagePrefix, STORAGE_BUCKETS.productMedia);
    throw error;
  }
}

function toMinorUnits(value: string) {
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
}

async function saveCampaignProducts(
  tx: Transaction,
  input: SaveCampaignInput,
  campaignId?: string,
) {
  const productIds = input.products.map((item) => item.productId);
  const publicProducts = await tx
    .select({ productId: products.productId, price: products.price })
    .from(products)
    .innerJoin(vendors, eq(vendors.vendorId, products.vendorId))
    .innerJoin(users, eq(users.userId, vendors.userId))
    .where(
      and(
        inArray(products.productId, productIds),
        eq(products.published, true),
        eq(products.moderationStatus, 'approved'),
        eq(products.isSoftDeleted, false),
        eq(vendors.status, 'active'),
        eq(users.status, 'active'),
      ),
    )
    .orderBy(asc(products.productId))
    .for('update');

  if (publicProducts.length !== productIds.length) {
    throw new AppError(400, 'CAMPAIGN_PRODUCT_UNAVAILABLE', 'Select only available products.');
  }

  const productPrices = new Map(
    publicProducts.map((product) => [product.productId, product.price]),
  );
  for (const item of input.products) {
    const regularPrice = productPrices.get(item.productId);
    if (!regularPrice || toMinorUnits(item.dealPrice) >= toMinorUnits(regularPrice)) {
      throw new AppError(400, 'INVALID_DEAL_PRICE', 'Deal price must be below regular price.');
    }
  }

  if (input.published) {
    const overlapConditions = [
      inArray(campaignProducts.productId, productIds),
      eq(campaigns.status, 'published'),
      lt(campaigns.startsAt, new Date(input.endsAt)),
      gt(campaigns.endsAt, new Date(input.startsAt)),
    ];
    if (campaignId) overlapConditions.push(sql`${campaigns.campaignId} <> ${campaignId}`);

    const overlappingProducts = await tx
      .select({ productId: campaignProducts.productId })
      .from(campaignProducts)
      .innerJoin(campaigns, eq(campaigns.campaignId, campaignProducts.campaignId))
      .where(and(...overlapConditions))
      .limit(1);

    if (overlappingProducts.length) {
      throw new AppError(
        409,
        'CAMPAIGN_DEAL_OVERLAP',
        'A product already has a deal during this campaign window.',
      );
    }
  }
}

function campaignValues(input: SaveCampaignInput) {
  return {
    status: input.published ? ('published' as const) : ('draft' as const),
    draftPayload: input.published
      ? null
      : {
          ...input,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
        },
    eyebrow: input.eyebrow,
    title: input.title,
    subtitle: input.subtitle,
    imageUrl: input.imageUrl,
    mobileImageUrl: input.mobileImageUrl ?? null,
    ctaLabel: input.ctaLabel,
    ctaHref: input.ctaHref,
    startsAt: new Date(input.startsAt),
    endsAt: new Date(input.endsAt),
    position: input.position,
    updatedAt: new Date(),
  };
}

async function replaceCampaignProducts(
  tx: Transaction,
  campaignId: string,
  input: SaveCampaignInput,
) {
  await tx.delete(campaignProducts).where(eq(campaignProducts.campaignId, campaignId));
  await tx.insert(campaignProducts).values(
    input.products.map((item) => ({
      campaignId,
      productId: item.productId,
      dealPrice: item.dealPrice,
    })),
  );
}

function campaignResponse(
  campaign: typeof campaigns.$inferSelect,
  products: Array<{
    productId: string;
    name: string;
    price: string;
    dealPrice: string;
    imageUrl: string | null;
    vendorName: string;
  }>,
) {
  return {
    campaignId: campaign.campaignId,
    eyebrow: campaign.eyebrow!,
    title: campaign.title!,
    subtitle: campaign.subtitle!,
    imageUrl: campaign.imageUrl!,
    mobileImageUrl: campaign.mobileImageUrl,
    ctaLabel: campaign.ctaLabel!,
    ctaHref: campaign.ctaHref!,
    startsAt: campaign.startsAt!,
    endsAt: campaign.endsAt!,
    position: campaign.position,
    published: campaign.status === 'published',
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    products,
  };
}

export async function listCampaigns() {
  const db = getDb();
  const rows = await db
    .select({
      campaignId: campaigns.campaignId,
      eyebrow: campaigns.eyebrow,
      title: campaigns.title,
      subtitle: campaigns.subtitle,
      imageUrl: campaigns.imageUrl,
      mobileImageUrl: campaigns.mobileImageUrl,
      ctaLabel: campaigns.ctaLabel,
      ctaHref: campaigns.ctaHref,
      startsAt: campaigns.startsAt,
      endsAt: campaigns.endsAt,
      position: campaigns.position,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
    })
    .from(campaigns)
    .where(eq(campaigns.status, 'published'))
    .orderBy(desc(campaigns.createdAt));
  if (!rows.length) return [];

  const items = await db
    .select({
      campaignId: campaignProducts.campaignId,
      productId: products.productId,
      name: products.name,
      price: products.price,
      dealPrice: campaignProducts.dealPrice,
    })
    .from(campaignProducts)
    .innerJoin(products, eq(products.productId, campaignProducts.productId))
    .where(
      inArray(
        campaignProducts.campaignId,
        rows.map((row) => row.campaignId),
      ),
    );
  const productsByCampaign = new Map<string, typeof items>();
  for (const item of items) {
    const campaignItems = productsByCampaign.get(item.campaignId) ?? [];
    campaignItems.push(item);
    productsByCampaign.set(item.campaignId, campaignItems);
  }

  return rows.map((row) => ({
    ...row,
    published: true,
    products: productsByCampaign.get(row.campaignId) ?? [],
  }));
}

export async function getCampaign(campaignId: string) {
  const db = getDb();
  const [campaign] = await db
    .select({
      campaignId: campaigns.campaignId,
      eyebrow: campaigns.eyebrow,
      title: campaigns.title,
      subtitle: campaigns.subtitle,
      imageUrl: campaigns.imageUrl,
      mobileImageUrl: campaigns.mobileImageUrl,
      ctaLabel: campaigns.ctaLabel,
      ctaHref: campaigns.ctaHref,
      startsAt: campaigns.startsAt,
      endsAt: campaigns.endsAt,
      position: campaigns.position,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
    })
    .from(campaigns)
    .where(and(eq(campaigns.campaignId, campaignId), eq(campaigns.status, 'published')))
    .limit(1);
  if (!campaign) throw new AppError(404, 'CAMPAIGN_NOT_FOUND', 'Promotion not found.');

  const items = await db
    .select({
      productId: products.productId,
      name: products.name,
      price: products.price,
      dealPrice: campaignProducts.dealPrice,
      mediaId: mediaLibrary.mediaId,
      mediaVendorId: mediaLibrary.vendorId,
      vendorName: vendors.name,
    })
    .from(campaignProducts)
    .innerJoin(products, eq(products.productId, campaignProducts.productId))
    .innerJoin(vendors, eq(vendors.vendorId, products.vendorId))
    .leftJoin(mediaLibrary, eq(mediaLibrary.mediaId, products.productImageId))
    .where(eq(campaignProducts.campaignId, campaignId));

  return {
    ...campaign,
    published: true,
    products: items.map(({ mediaId, mediaVendorId, ...product }) => ({
      ...product,
      imageUrl:
        mediaId && mediaVendorId ? formatImageUrl({ mediaId, vendorId: mediaVendorId }) : null,
    })),
  };
}

export async function createPromotionDraft(ownerUserId: string, campaignId?: string) {
  const db = getDb();
  if (campaignId) {
    const [existing] = await db
      .select({ draftId: campaigns.campaignId })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.ownerUserId, ownerUserId),
          eq(campaigns.sourceCampaignId, campaignId),
          eq(campaigns.status, 'draft'),
        ),
      )
      .limit(1);
    if (existing) return getPromotionDraft(ownerUserId, existing.draftId);

    const campaign = await getCampaign(campaignId);
    const payload = {
      eyebrow: campaign.eyebrow!,
      title: campaign.title!,
      subtitle: campaign.subtitle!,
      imageUrl: campaign.imageUrl!,
      mobileImageUrl: campaign.mobileImageUrl ?? '',
      ctaLabel: campaign.ctaLabel!,
      ctaHref: campaign.ctaHref!,
      startsAt: campaign.startsAt!.toISOString(),
      endsAt: campaign.endsAt!.toISOString(),
      position: campaign.position,
      products: campaign.products.map(({ productId, dealPrice }) => ({ productId, dealPrice })),
    } satisfies PromotionDraftPayload;
    const [created] = await db
      .insert(campaigns)
      .values({ status: 'draft', sourceCampaignId: campaignId, ownerUserId, draftPayload: payload })
      .onConflictDoNothing()
      .returning({ draftId: campaigns.campaignId });
    const draftId =
      created?.draftId ??
      (
        await db
          .select({ draftId: campaigns.campaignId })
          .from(campaigns)
          .where(
            and(
              eq(campaigns.ownerUserId, ownerUserId),
              eq(campaigns.sourceCampaignId, campaignId),
              eq(campaigns.status, 'draft'),
            ),
          )
          .limit(1)
      )[0]?.draftId;
    if (!draftId) throw new Error('Campaign draft could not be created.');
    return getPromotionDraft(ownerUserId, draftId);
  }

  const [created] = await db
    .insert(campaigns)
    .values({
      status: 'draft',
      ownerUserId,
      draftPayload: {
        eyebrow: '',
        title: '',
        subtitle: '',
        imageUrl: '',
        mobileImageUrl: '',
        ctaLabel: 'Shop now',
        ctaHref: '/products',
        startsAt: '',
        endsAt: '',
        position: 0,
        products: [],
      },
    })
    .returning({ draftId: campaigns.campaignId });
  return getPromotionDraft(ownerUserId, created.draftId);
}

export async function listPromotionDrafts(ownerUserId: string) {
  const rows = await getDb()
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.ownerUserId, ownerUserId), eq(campaigns.status, 'draft')))
    .orderBy(desc(campaigns.updatedAt));
  return rows.map((row) => ({
    draftId: row.campaignId,
    campaignId: row.sourceCampaignId,
    payload: promotionDraftPayloadSchema.parse(row.draftPayload),
    updatedAt: row.updatedAt,
  }));
}

export async function getPromotionDraft(ownerUserId: string, draftId: string) {
  const db = getDb();
  const [draft] = await db
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.campaignId, draftId),
        eq(campaigns.ownerUserId, ownerUserId),
        eq(campaigns.status, 'draft'),
      ),
    )
    .limit(1);
  if (!draft) throw new AppError(404, 'PROMOTION_DRAFT_NOT_FOUND', 'Promotion draft not found.');

  const payload = promotionDraftPayloadSchema.parse(draft.draftPayload);
  const selected = payload.products ?? [];
  const productIds = selected.map((item) => item.productId);
  const rows = productIds.length
    ? await db
        .select({
          productId: products.productId,
          name: products.name,
          price: products.price,
          imageId: mediaLibrary.mediaId,
          mediaVendorId: mediaLibrary.vendorId,
          vendorName: vendors.name,
        })
        .from(products)
        .innerJoin(vendors, eq(vendors.vendorId, products.vendorId))
        .leftJoin(mediaLibrary, eq(mediaLibrary.mediaId, products.productImageId))
        .where(inArray(products.productId, productIds))
    : [];
  const productsById = new Map(rows.map((row) => [row.productId, row]));

  return {
    draftId: draft.campaignId,
    campaignId: draft.sourceCampaignId,
    payload,
    products: selected.map((item) => {
      const product = productsById.get(item.productId);
      return {
        productId: item.productId,
        name: product?.name ?? 'Unavailable product',
        price: product?.price ?? '0.00',
        dealPrice: item.dealPrice,
        imageUrl:
          product?.imageId && product.mediaVendorId
            ? formatImageUrl({ mediaId: product.imageId, vendorId: product.mediaVendorId })
            : null,
        vendorName: product?.vendorName ?? 'Unavailable seller',
        unavailable: !product,
      };
    }),
    updatedAt: draft.updatedAt,
  };
}

export async function savePromotionDraft(
  ownerUserId: string,
  draftId: string,
  payload: PromotionDraftPayload,
) {
  const [draft] = await getDb()
    .update(campaigns)
    .set({ draftPayload: payload, updatedAt: new Date() })
    .where(
      and(
        eq(campaigns.campaignId, draftId),
        eq(campaigns.ownerUserId, ownerUserId),
        eq(campaigns.status, 'draft'),
      ),
    )
    .returning({ draftId: campaigns.campaignId });
  if (!draft) throw new AppError(404, 'PROMOTION_DRAFT_NOT_FOUND', 'Promotion draft not found.');
  return getPromotionDraft(ownerUserId, draftId);
}

export async function discardPromotionDraft(ownerUserId: string, draftId: string) {
  const [draft] = await getDb()
    .delete(campaigns)
    .where(
      and(
        eq(campaigns.campaignId, draftId),
        eq(campaigns.ownerUserId, ownerUserId),
        eq(campaigns.status, 'draft'),
      ),
    )
    .returning({
      desktopBannerPrefix: campaigns.draftDesktopBannerPrefix,
      mobileBannerPrefix: campaigns.draftMobileBannerPrefix,
    });
  if (!draft) throw new AppError(404, 'PROMOTION_DRAFT_NOT_FOUND', 'Promotion draft not found.');
  await Promise.all(
    [draft.desktopBannerPrefix, draft.mobileBannerPrefix]
      .filter((prefix): prefix is string => Boolean(prefix))
      .map((prefix) => storageService.deletePrefix(prefix, STORAGE_BUCKETS.productMedia)),
  );
}

export async function publishPromotionDraft(ownerUserId: string, draftId: string) {
  const db = getDb();
  const draft = await getPromotionDraft(ownerUserId, draftId);
  const payload = draft.payload;
  const startsAt = payload.startsAt ? new Date(payload.startsAt) : null;
  const endsAt = payload.endsAt ? new Date(payload.endsAt) : null;
  if (!payload.title?.trim())
    throw new AppError(400, 'PROMOTION_TITLE_REQUIRED', 'Add a promotion heading.');
  if (!payload.imageUrl)
    throw new AppError(400, 'PROMOTION_BANNER_REQUIRED', 'Choose a desktop banner.');
  if (!startsAt || !Number.isFinite(startsAt.getTime())) {
    throw new AppError(400, 'PROMOTION_START_REQUIRED', 'Choose a start date and time.');
  }
  if (!endsAt || !Number.isFinite(endsAt.getTime()) || endsAt <= startsAt) {
    throw new AppError(400, 'PROMOTION_END_REQUIRED', 'Choose an end date after the start date.');
  }
  if (!draft.products.length || draft.products.some((product) => !product.dealPrice.trim())) {
    throw new AppError(
      400,
      'PROMOTION_PRODUCTS_REQUIRED',
      'Add products and enter each deal price.',
    );
  }

  const input = saveCampaignSchema.parse({
    eyebrow: payload.eyebrow?.trim() || 'Promotion',
    title: payload.title.trim(),
    subtitle: payload.subtitle?.trim() ?? '',
    imageUrl: payload.imageUrl,
    mobileImageUrl: payload.mobileImageUrl || null,
    ctaLabel: payload.ctaLabel?.trim() || 'Shop now',
    ctaHref: payload.ctaHref || '/products',
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    position: payload.position ?? 0,
    published: true,
    products: draft.products.map(({ productId, dealPrice }) => ({ productId, dealPrice })),
  });

  return db.transaction(async (tx) => {
    const sourceCampaignId = draft.campaignId;
    let publishedCampaignId = draftId;
    if (sourceCampaignId) {
      const [source] = await tx
        .select({ campaignId: campaigns.campaignId })
        .from(campaigns)
        .where(and(eq(campaigns.campaignId, sourceCampaignId), eq(campaigns.status, 'published')))
        .for('update')
        .limit(1);
      if (!source) throw new AppError(404, 'CAMPAIGN_NOT_FOUND', 'Campaign not found.');
      await saveCampaignProducts(tx, input, sourceCampaignId);
      await tx
        .update(campaigns)
        .set(campaignValues(input))
        .where(eq(campaigns.campaignId, sourceCampaignId));
      await replaceCampaignProducts(tx, sourceCampaignId, input);
      await tx
        .delete(campaigns)
        .where(and(eq(campaigns.campaignId, draftId), eq(campaigns.ownerUserId, ownerUserId)));
      publishedCampaignId = sourceCampaignId;
    } else {
      await saveCampaignProducts(tx, input);
      await tx
        .update(campaigns)
        .set({
          ...campaignValues(input),
          ownerUserId: null,
          sourceCampaignId: null,
          draftDesktopBannerPrefix: null,
          draftMobileBannerPrefix: null,
        })
        .where(and(eq(campaigns.campaignId, draftId), eq(campaigns.ownerUserId, ownerUserId)));
      await replaceCampaignProducts(tx, draftId, input);
    }

    const [campaign] = await tx
      .select()
      .from(campaigns)
      .where(eq(campaigns.campaignId, publishedCampaignId))
      .limit(1);
    return campaignResponse(
      campaign,
      draft.products.map(({ productId, name, price, dealPrice, imageUrl, vendorName }) => ({
        productId,
        name,
        price,
        dealPrice,
        imageUrl,
        vendorName,
      })),
    );
  });
}

function formatImageUrl(media: { mediaId: string; vendorId: string } | null) {
  return media
    ? storageService.resolveUrl(
        `vendors/${media.vendorId}/media/${media.mediaId}/thumbnail.webp`,
        STORAGE_BUCKETS.productMedia,
      )
    : null;
}

export async function getHomepageCampaigns() {
  const db = getDb();
  const now = new Date();
  const campaignRows = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.status, 'published'), gt(campaigns.endsAt, now)))
    .orderBy(asc(campaigns.position), asc(campaigns.startsAt));

  const active = campaignRows.filter(
    (campaign) =>
      campaign.startsAt && campaign.endsAt && campaign.startsAt <= now && campaign.endsAt > now,
  );
  const upcoming = campaignRows
    .filter((campaign) => campaign.startsAt && campaign.startsAt > now)
    .slice(0, 3);
  const selected = [...active.slice(0, 5), ...upcoming];
  if (!selected.length) return { active: [], upcoming: [] };

  const itemRows = await db
    .select({
      campaignId: campaignProducts.campaignId,
      productId: products.productId,
      name: products.name,
      slug: products.slug,
      regularPrice: products.price,
      mrp: products.mrp,
      stock: products.stock,
      dealPrice: campaignProducts.dealPrice,
      mediaId: mediaLibrary.mediaId,
      mediaVendorId: mediaLibrary.vendorId,
      vendorId: vendors.vendorId,
      vendorName: vendors.name,
      vendorSlug: vendors.slug,
      rating: sql<string | null>`AVG(${productReviews.rating})`,
      ratingCount: count(productReviews.reviewId),
    })
    .from(campaignProducts)
    .innerJoin(products, eq(products.productId, campaignProducts.productId))
    .innerJoin(vendors, eq(vendors.vendorId, products.vendorId))
    .innerJoin(users, eq(users.userId, vendors.userId))
    .leftJoin(mediaLibrary, eq(mediaLibrary.mediaId, products.productImageId))
    .leftJoin(productReviews, eq(productReviews.productId, products.productId))
    .where(
      and(
        inArray(
          campaignProducts.campaignId,
          selected.map((campaign) => campaign.campaignId),
        ),
        eq(products.published, true),
        eq(products.moderationStatus, 'approved'),
        eq(products.isSoftDeleted, false),
        sql`${campaignProducts.dealPrice} < ${products.price}`,
        eq(vendors.status, 'active'),
        eq(users.status, 'active'),
      ),
    )
    .groupBy(
      campaignProducts.campaignId,
      products.productId,
      mediaLibrary.mediaId,
      mediaLibrary.vendorId,
      vendors.vendorId,
    );
  const itemMap = new Map<string, typeof itemRows>();
  for (const row of itemRows) {
    const items = itemMap.get(row.campaignId) ?? [];
    items.push(row);
    itemMap.set(row.campaignId, items);
  }
  const formatCampaign = (campaign: (typeof selected)[number]) => ({
    campaignId: campaign.campaignId,
    eyebrow: campaign.eyebrow!,
    title: campaign.title!,
    subtitle: campaign.subtitle!,
    imageUrl: campaign.imageUrl!,
    mobileImageUrl: campaign.mobileImageUrl,
    ctaLabel: campaign.ctaLabel!,
    ctaHref: campaign.ctaHref!,
    startsAt: campaign.startsAt!,
    endsAt: campaign.endsAt!,
    products: (itemMap.get(campaign.campaignId) ?? []).map((item) => ({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      regularPrice: item.regularPrice,
      dealPrice: item.dealPrice,
      mrp: item.mrp,
      stock: item.stock,
      imageUrl: formatImageUrl(
        item.mediaId && item.mediaVendorId
          ? { mediaId: item.mediaId, vendorId: item.mediaVendorId }
          : null,
      ),
      rating: item.rating ? Number(item.rating) : null,
      ratingCount: Number(item.ratingCount),
      vendor: { vendorId: item.vendorId, name: item.vendorName, slug: item.vendorSlug },
    })),
  });

  return {
    active: active.slice(0, 5).map(formatCampaign),
    upcoming: upcoming.map(formatCampaign),
  };
}
