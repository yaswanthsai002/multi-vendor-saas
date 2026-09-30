import { randomBytes } from 'node:crypto';

import { getDb } from '@repo/db';
import {
  categories,
  mediaLibrary,
  orderItems,
  productCategories,
  productMedia,
  products,
  vendorOrders,
  vendors,
} from '@repo/db/schema';
import { and, asc, count, desc, eq, gt, gte, ilike, inArray, ne, sql } from 'drizzle-orm';

import { AppError } from '../../shared/errors/AppError.js';
import { formatMediaResponse } from '../media/media.service.js';

import type {
  BulkProductActionInput,
  CreateProductInput,
  GetVendorDashboardQuery,
  GetVendorProductsQuery,
  UpdateProductInput,
} from './vendor.schema.js';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Validates that all category IDs exist and are leaf categories (no subcategories).
 */
async function validateLeafCategories(categoryIds: string[]): Promise<void> {
  const db = getDb();
  const validCategories = await db.query.categories.findMany({
    where: inArray(categories.categoryId, categoryIds),
  });

  if (validCategories.length !== categoryIds.length) {
    throw new AppError(400, 'INVALID_CATEGORY', 'One or more specified categories do not exist.');
  }

  const childCategories = await db.query.categories.findMany({
    where: inArray(categories.parentCategoryId, categoryIds),
  });

  if (childCategories.length > 0) {
    throw new AppError(
      400,
      'INVALID_CATEGORY',
      'Only leaf categories (categories without subcategories) can be assigned to a product.',
    );
  }
}

/**
 * Validates that all media IDs exist, are active, and belong to the vendor.
 */
async function validateVendorMedia(vendorId: string, mediaIds: string[]): Promise<void> {
  if (mediaIds.length === 0) return;
  const db = getDb();
  const uniqueIds = Array.from(new Set(mediaIds));

  const validMedia = await db.query.mediaLibrary.findMany({
    where: and(
      inArray(mediaLibrary.mediaId, uniqueIds),
      eq(mediaLibrary.vendorId, vendorId),
      eq(mediaLibrary.status, 'active'),
    ),
  });

  if (validMedia.length !== uniqueIds.length) {
    throw new AppError(
      400,
      'INVALID_MEDIA',
      'One or more specified media items do not exist, are inactive, or do not belong to you.',
    );
  }
}

/**
 * Creates a new product under the specified vendor.
 */
export async function createProduct(vendorId: string, input: CreateProductInput) {
  const db = getDb();

  // 1. Determine unique slug
  const baseSlug = input.slug ? input.slug : slugify(input.name);
  let finalSlug = baseSlug;

  const existingSlug = await db.query.products.findFirst({
    where: eq(products.slug, finalSlug),
  });

  if (existingSlug) {
    finalSlug = `${baseSlug}-${randomBytes(3).toString('hex')}`;
  }

  // 2. Validate media ownership & active status
  const mediaToValidate: string[] = [];
  if (input.productImageId) {
    mediaToValidate.push(input.productImageId);
  }
  if (input.galleryMediaIds && input.galleryMediaIds.length > 0) {
    mediaToValidate.push(...input.galleryMediaIds);
  }
  if (mediaToValidate.length > 0) {
    await validateVendorMedia(vendorId, mediaToValidate);
  }

  // 3. Validate category IDs if provided
  if (input.categoryIds && input.categoryIds.length > 0) {
    await validateLeafCategories(input.categoryIds);
  }

  // 4. Insert product
  const [createdProduct] = await db
    .insert(products)
    .values({
      vendorId,
      name: input.name,
      slug: finalSlug,
      description: input.description,
      productImageId: input.productImageId ?? null,
      price: input.price,
      stock: input.stock,
      isSoftDeleted: false,
    })
    .returning();

  // 5. Insert category associations
  if (input.categoryIds && input.categoryIds.length > 0) {
    await db.insert(productCategories).values(
      input.categoryIds.map((categoryId) => ({
        productId: createdProduct.productId,
        categoryId,
      })),
    );
  }

  // 6. Insert product media associations (primary image + gallery media per §22)
  const allMediaIds: string[] = [];
  if (input.productImageId) {
    allMediaIds.push(input.productImageId);
  }
  if (input.galleryMediaIds) {
    for (const gid of input.galleryMediaIds) {
      if (!allMediaIds.includes(gid)) {
        allMediaIds.push(gid);
      }
    }
  }

  if (allMediaIds.length > 0) {
    await db.insert(productMedia).values(
      allMediaIds.map((mediaId, sortOrder) => ({
        productId: createdProduct.productId,
        mediaId,
        sortOrder,
      })),
    );
  }

  return getVendorProductById(vendorId, createdProduct.productId);
}

/**
 * Validates whether a product meets all criteria required to be published.
 * Throws specific descriptive AppErrors if validation fails.
 */
export async function validateProductPublishability(
  vendorId: string,
  productId: string,
  pendingUpdates?: {
    name?: string;
    description?: string;
    price?: string;
    stock?: number;
    productImageId?: string | null;
  },
) {
  const db = getDb();

  const product = await db.query.products.findFirst({
    where: and(eq(products.productId, productId), eq(products.vendorId, vendorId)),
  });

  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
  }

  const name = pendingUpdates?.name ?? product.name;
  const description = pendingUpdates?.description ?? product.description;
  const price = pendingUpdates?.price ?? product.price;
  const stock = pendingUpdates?.stock ?? product.stock;
  const productImageId =
    pendingUpdates?.productImageId !== undefined
      ? pendingUpdates.productImageId
      : product.productImageId;

  if (!name || name.trim().length < 2) {
    throw new AppError(
      400,
      'PRODUCT_PUBLISH_INVALID_NAME',
      'Unable to publish product because the name must be at least 2 characters.',
    );
  }

  if (!description || description.trim().length < 10) {
    throw new AppError(
      400,
      'PRODUCT_PUBLISH_INVALID_DESCRIPTION',
      'Unable to publish product because the description must be at least 10 characters.',
    );
  }

  if (Number(price) < 0) {
    throw new AppError(
      400,
      'PRODUCT_PUBLISH_INVALID_PRICE',
      'Unable to publish product because the price cannot be negative.',
    );
  }

  if (stock < 0) {
    throw new AppError(
      400,
      'PRODUCT_PUBLISH_INVALID_STOCK',
      'Unable to publish product because stock cannot be negative.',
    );
  }

  // 1. Validate primary image
  if (!productImageId) {
    throw new AppError(
      400,
      'PRODUCT_PUBLISH_MISSING_IMAGE',
      'Unable to publish product because it is missing a primary image.',
    );
  }

  const image = await db.query.mediaLibrary.findFirst({
    where: and(
      eq(mediaLibrary.mediaId, productImageId),
      eq(mediaLibrary.vendorId, vendorId),
      eq(mediaLibrary.status, 'active'),
    ),
  });

  if (!image) {
    throw new AppError(
      400,
      'PRODUCT_PUBLISH_MISSING_IMAGE',
      'Unable to publish product because the primary image is missing or disabled.',
    );
  }

  // 2. Validate categories (at least 1 category)
  const categoryCount = await db
    .select({ count: count() })
    .from(productCategories)
    .where(eq(productCategories.productId, productId));

  if (!categoryCount[0] || Number(categoryCount[0].count) === 0) {
    throw new AppError(
      400,
      'PRODUCT_PUBLISH_MISSING_CATEGORY',
      'Unable to publish product because it must be assigned to at least one category.',
    );
  }
}

/**
 * Lists products owned by the vendor with pagination, search, status, and category filtering.
 */
export async function getVendorProducts(vendorId: string, query: GetVendorProductsQuery) {
  const db = getDb();
  const { page, limit, search, categoryId, stock, published, archived, sortBy, sortOrder } = query;
  const offset = (page - 1) * limit;

  const conditions = [eq(products.vendorId, vendorId)];

  if (archived === 'true') {
    conditions.push(eq(products.isSoftDeleted, true));
  } else {
    conditions.push(eq(products.isSoftDeleted, false));
  }

  if (published === 'true') {
    conditions.push(eq(products.published, true));
  } else if (published === 'false') {
    conditions.push(eq(products.published, false));
  }

  if (stock === 'in_stock') {
    conditions.push(gt(products.stock, 0));
  } else if (stock === 'out_of_stock') {
    conditions.push(eq(products.stock, 0));
  }

  if (search) {
    conditions.push(ilike(products.name, `%${search}%`));
  }

  if (categoryId) {
    conditions.push(
      inArray(
        products.productId,
        db
          .select({ productId: productCategories.productId })
          .from(productCategories)
          .where(eq(productCategories.categoryId, categoryId)),
      ),
    );
  }

  const sortColumn =
    {
      createdAt: products.createdAt,
      price: products.price,
      name: products.name,
      stock: products.stock,
    }[sortBy] || products.createdAt;

  const orderClause = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(products)
    .where(and(...conditions));

  const total = Number(totalCount);
  const totalPages = Math.ceil(total / limit) || 1;

  const productList = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  // Batch load categories for the returned products
  const productIds = productList.map((p) => p.productId);
  const categoriesByProductId: Record<
    string,
    Array<{ categoryId: string; name: string; slug: string }>
  > = {};

  if (productIds.length > 0) {
    const catRows = await db
      .select({
        productId: productCategories.productId,
        categoryId: categories.categoryId,
        name: categories.name,
        slug: categories.slug,
      })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.categoryId, categories.categoryId))
      .where(inArray(productCategories.productId, productIds));

    for (const row of catRows) {
      if (!categoriesByProductId[row.productId]) {
        categoriesByProductId[row.productId] = [];
      }
      categoriesByProductId[row.productId].push({
        categoryId: row.categoryId,
        name: row.name,
        slug: row.slug,
      });
    }
  }

  // Batch load primary images
  const imageIds = productList
    .map((p) => p.productImageId)
    .filter((id): id is string => Boolean(id));

  const primaryImageById = new Map<string, ReturnType<typeof formatMediaResponse>>();
  if (imageIds.length > 0) {
    const mediaRows = await db.query.mediaLibrary.findMany({
      where: inArray(mediaLibrary.mediaId, Array.from(new Set(imageIds))),
    });
    for (const row of mediaRows) {
      primaryImageById.set(row.mediaId, formatMediaResponse(row));
    }
  }

  const enrichedProducts = productList.map((p) => ({
    productId: p.productId,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription ?? null,
    description: p.description,
    price: p.price,
    stock: p.stock,
    published: p.published,
    isSoftDeleted: p.isSoftDeleted,
    rating: null, // review domain not yet built per section 14
    primaryImage: p.productImageId ? (primaryImageById.get(p.productImageId) ?? null) : null,
    categories: categoriesByProductId[p.productId] || [],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    softDeletedAt: p.softDeletedAt,
  }));

  return {
    products: enrichedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Retrieves a single product owned by the vendor.
 */
export async function getVendorProductById(vendorId: string, productId: string) {
  const db = getDb();

  const product = await db.query.products.findFirst({
    where: and(
      eq(products.productId, productId),
      eq(products.vendorId, vendorId),
      eq(products.isSoftDeleted, false),
    ),
  });

  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
  }

  const linkedCategories = await db
    .select({
      categoryId: categories.categoryId,
      name: categories.name,
      slug: categories.slug,
    })
    .from(productCategories)
    .innerJoin(categories, eq(productCategories.categoryId, categories.categoryId))
    .where(eq(productCategories.productId, productId));

  let primaryImage = null;
  if (product.productImageId) {
    const mediaRow = await db.query.mediaLibrary.findFirst({
      where: eq(mediaLibrary.mediaId, product.productImageId),
    });
    if (mediaRow) {
      primaryImage = formatMediaResponse(mediaRow);
    }
  }

  const galleryRows = await db
    .select({
      media: mediaLibrary,
      sortOrder: productMedia.sortOrder,
    })
    .from(productMedia)
    .innerJoin(mediaLibrary, eq(productMedia.mediaId, mediaLibrary.mediaId))
    .where(eq(productMedia.productId, productId))
    .orderBy(asc(productMedia.sortOrder));

  const galleryMedia = galleryRows.map((r) => formatMediaResponse(r.media));

  return {
    ...product,
    primaryImage,
    media: galleryMedia,
    categories: linkedCategories,
  };
}

/**
 * Updates a product owned by the vendor.
 */
export async function updateVendorProductById(
  vendorId: string,
  productId: string,
  input: UpdateProductInput,
) {
  const db = getDb();

  // 1. Verify existence, ownership, and non-deleted status
  const existingProduct = await db.query.products.findFirst({
    where: and(eq(products.productId, productId), eq(products.vendorId, vendorId)),
  });

  if (!existingProduct || existingProduct.isSoftDeleted) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
  }

  // 2. Validate slug uniqueness if updated
  if (input.slug && input.slug !== existingProduct.slug) {
    const slugConflict = await db.query.products.findFirst({
      where: and(eq(products.slug, input.slug), ne(products.productId, productId)),
    });

    if (slugConflict) {
      throw new AppError(409, 'SLUG_COLLISION', 'A product with this slug already exists.');
    }
  }

  // 3. Validate media if updated
  const mediaToValidate: string[] = [];
  if (input.productImageId) {
    mediaToValidate.push(input.productImageId);
  }
  if (input.galleryMediaIds && input.galleryMediaIds.length > 0) {
    mediaToValidate.push(...input.galleryMediaIds);
  }
  if (mediaToValidate.length > 0) {
    await validateVendorMedia(vendorId, mediaToValidate);
  }

  // 4. Update product media associations (primary image + gallery media per §22)
  if (input.galleryMediaIds !== undefined || input.productImageId !== undefined) {
    const targetPrimaryId =
      input.productImageId !== undefined ? input.productImageId : existingProduct.productImageId;

    let targetGalleryIds: string[];
    if (input.galleryMediaIds !== undefined) {
      targetGalleryIds = input.galleryMediaIds;
    } else {
      const existingMedia = await db
        .select({ mediaId: productMedia.mediaId })
        .from(productMedia)
        .where(eq(productMedia.productId, productId))
        .orderBy(asc(productMedia.sortOrder));
      targetGalleryIds = existingMedia.map((m) => m.mediaId);
    }

    const combinedMediaIds: string[] = [];
    if (targetPrimaryId) {
      combinedMediaIds.push(targetPrimaryId);
    }
    for (const gid of targetGalleryIds) {
      if (!combinedMediaIds.includes(gid)) {
        combinedMediaIds.push(gid);
      }
    }

    await db.delete(productMedia).where(eq(productMedia.productId, productId));
    if (combinedMediaIds.length > 0) {
      await db.insert(productMedia).values(
        combinedMediaIds.map((mediaId, sortOrder) => ({
          productId,
          mediaId,
          sortOrder,
        })),
      );
    }
  }

  // 5. Update category associations
  if (input.categoryIds !== undefined) {
    if (input.categoryIds.length > 0) {
      await validateLeafCategories(input.categoryIds);
    }

    await db.delete(productCategories).where(eq(productCategories.productId, productId));

    if (input.categoryIds.length > 0) {
      await db.insert(productCategories).values(
        input.categoryIds.map((categoryId) => ({
          productId,
          categoryId,
        })),
      );
    }
  }

  // 6. Update product fields
  const updatePayload: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (input.published !== undefined) {
    if (input.published === true && !existingProduct.published) {
      await validateProductPublishability(vendorId, productId, input);
    }
    updatePayload.published = input.published;
  }

  if (input.name !== undefined) updatePayload.name = input.name;
  if (input.slug !== undefined) updatePayload.slug = input.slug;
  if (input.description !== undefined) updatePayload.description = input.description;
  if (input.price !== undefined) updatePayload.price = input.price;
  if (input.stock !== undefined) updatePayload.stock = input.stock;
  if (input.productImageId !== undefined) updatePayload.productImageId = input.productImageId;

  await db.update(products).set(updatePayload).where(eq(products.productId, productId));

  return getVendorProductById(vendorId, productId);
}

/**
 * Archives a product owned by the vendor (soft delete, preserves published state).
 */
export async function archiveVendorProduct(vendorId: string, productId: string) {
  const db = getDb();

  const existingProduct = await db.query.products.findFirst({
    where: and(eq(products.productId, productId), eq(products.vendorId, vendorId)),
  });

  if (!existingProduct) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
  }

  if (existingProduct.isSoftDeleted) {
    throw new AppError(400, 'PRODUCT_ALREADY_ARCHIVED', 'Product is already archived.');
  }

  await db
    .update(products)
    .set({
      isSoftDeleted: true,
      softDeletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(products.productId, productId));

  return getVendorProductById(vendorId, productId);
}

/**
 * Restores an archived product owned by the vendor.
 */
export async function restoreVendorProduct(vendorId: string, productId: string) {
  const db = getDb();

  const existingProduct = await db.query.products.findFirst({
    where: and(eq(products.productId, productId), eq(products.vendorId, vendorId)),
  });

  if (!existingProduct) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
  }

  if (!existingProduct.isSoftDeleted) {
    throw new AppError(400, 'PRODUCT_NOT_ARCHIVED', 'Product is not archived.');
  }

  await db
    .update(products)
    .set({
      isSoftDeleted: false,
      softDeletedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(products.productId, productId));

  return getVendorProductById(vendorId, productId);
}

/**
 * Permanently deletes a product owned by the vendor.
 */
export async function deleteVendorProductById(vendorId: string, productId: string) {
  const db = getDb();

  const existingProduct = await db.query.products.findFirst({
    where: and(eq(products.productId, productId), eq(products.vendorId, vendorId)),
  });

  if (!existingProduct) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
  }

  await db.transaction(async (tx) => {
    await tx.delete(productCategories).where(eq(productCategories.productId, productId));
    await tx.delete(productMedia).where(eq(productMedia.productId, productId));
    await tx.delete(products).where(eq(products.productId, productId));
  });

  return { message: 'Product permanently deleted.' };
}

/**
 * Performs bulk actions (publish, unpublish, archive, restore, delete) on a list of vendor-owned product IDs.
 */
export async function bulkProductAction(vendorId: string, input: BulkProductActionInput) {
  const db = getDb();
  const { action, productIds } = input;
  const uniqueIds = Array.from(new Set(productIds));

  let processed = 0;
  const failed: { productId: string; reason: string }[] = [];

  for (const pid of uniqueIds) {
    try {
      if (action === 'publish') {
        await validateProductPublishability(vendorId, pid);
        await db
          .update(products)
          .set({ published: true, updatedAt: new Date() })
          .where(and(eq(products.productId, pid), eq(products.vendorId, vendorId)));
      } else if (action === 'unpublish') {
        await db
          .update(products)
          .set({ published: false, updatedAt: new Date() })
          .where(and(eq(products.productId, pid), eq(products.vendorId, vendorId)));
      } else if (action === 'archive') {
        await archiveVendorProduct(vendorId, pid);
      } else if (action === 'restore') {
        await restoreVendorProduct(vendorId, pid);
      } else if (action === 'delete') {
        await deleteVendorProductById(vendorId, pid);
      }
      processed++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      failed.push({ productId: pid, reason: message });
    }
  }

  return {
    action,
    total: uniqueIds.length,
    processed,
    failedCount: failed.length,
    failed,
    message: `Bulk ${action} completed: ${processed} succeeded, ${failed.length} failed.`,
  };
}

type DashboardPeriod = GetVendorDashboardQuery['period'];

type DashboardTimeframe = {
  days: number;
  numBuckets: number;
  currentStart: Date;
  bucketMs: number;
};

function resolveDashboardTimeframe(period: DashboardPeriod): DashboardTimeframe {
  const days = period === '90d' ? 90 : period === '30d' ? 30 : 7;

  const numBuckets = period === '90d' ? 12 : period === '30d' ? 10 : 7;

  const currentStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const bucketMs = (days * 24 * 60 * 60 * 1000) / numBuckets;

  return {
    days,
    numBuckets,
    currentStart,
    bucketMs,
  };
}

async function verifyVendorExists(vendorId: string) {
  const db = getDb();

  const vendor = await db.query.vendors.findFirst({
    where: eq(vendors.vendorId, vendorId),
    columns: {
      vendorId: true,
    },
  });

  if (!vendor) {
    throw new AppError(404, 'VENDOR_NOT_FOUND', 'Vendor profile not found.');
  }
}

async function getDashboardMetrics(vendorId: string, currentStart: Date) {
  const db = getDb();

  const [result] = await db
    .select({
      sales: sql<string>`
        COALESCE(
          SUM(
            ${orderItems.productPriceSnapshot}
            * ${orderItems.productQuantity}
          ),
          0
        )
      `,
      orders: sql<string>`
        COUNT(DISTINCT ${vendorOrders.vendorOrderId})
      `,
      unitsSold: sql<string>`
        COALESCE(
          SUM(${orderItems.productQuantity}),
          0
        )
      `,
    })
    .from(vendorOrders)
    .innerJoin(orderItems, eq(orderItems.vendorOrderId, vendorOrders.vendorOrderId))
    .where(
      and(
        eq(vendorOrders.vendorId, vendorId),
        gte(vendorOrders.createdAt, currentStart),
        ne(vendorOrders.status, 'cancelled'),
      ),
    );

  const sales = Math.round(Number(result?.sales ?? 0));
  const orders = Number(result?.orders ?? 0);
  const unitsSold = Number(result?.unitsSold ?? 0);

  return {
    sales,
    orders,
    unitsSold,
    avgOrderValue: orders > 0 ? Math.round(sales / orders) : 0,
  };
}

async function getDashboardChart(
  vendorId: string,
  period: DashboardPeriod,
  timeframe: DashboardTimeframe,
) {
  const db = getDb();

  const bucketSeconds = timeframe.bucketMs / 1000;

  const bucketIndex = sql<number>`
    FLOOR(
      EXTRACT(
        EPOCH FROM (
          ${vendorOrders.createdAt}
          - ${timeframe.currentStart}
        )
      ) / ${bucketSeconds}
    )
  `;

  const rows = await db
    .select({
      bucket: bucketIndex,
      sales: sql<string>`
        SUM(
          ${orderItems.productPriceSnapshot}
          * ${orderItems.productQuantity}
        )
      `,
    })
    .from(vendorOrders)
    .innerJoin(orderItems, eq(orderItems.vendorOrderId, vendorOrders.vendorOrderId))
    .where(
      and(
        eq(vendorOrders.vendorId, vendorId),
        gte(vendorOrders.createdAt, timeframe.currentStart),
        ne(vendorOrders.status, 'cancelled'),
      ),
    )
    .groupBy(bucketIndex)
    .orderBy(bucketIndex);

  const salesByBucket = new Map<number, number>();

  for (const row of rows) {
    salesByBucket.set(Number(row.bucket), Math.round(Number(row.sales)));
  }

  return Array.from({ length: timeframe.numBuckets }, (_, index) => {
    const bucketStart = new Date(timeframe.currentStart.getTime() + index * timeframe.bucketMs);

    const label =
      period === '7d'
        ? bucketStart.toLocaleDateString('en-US', {
            weekday: 'short',
          })
        : bucketStart.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

    return {
      label,
      date: bucketStart.toISOString().split('T')[0] ?? '',
      sales: salesByBucket.get(index) ?? 0,
    };
  });
}

async function getRecentOrders(vendorId: string) {
  const db = getDb();

  const rows = await db
    .select({
      vendorOrderId: vendorOrders.vendorOrderId,
      orderId: vendorOrders.orderId,
      status: vendorOrders.status,
      createdAt: vendorOrders.createdAt,
      itemsCount: sql<string>`
        SUM(${orderItems.productQuantity})
      `,
      amount: sql<string>`
        SUM(
          ${orderItems.productPriceSnapshot}
          * ${orderItems.productQuantity}
        )
      `,
    })
    .from(vendorOrders)
    .innerJoin(orderItems, eq(orderItems.vendorOrderId, vendorOrders.vendorOrderId))
    .where(eq(vendorOrders.vendorId, vendorId))
    .groupBy(
      vendorOrders.vendorOrderId,
      vendorOrders.orderId,
      vendorOrders.status,
      vendorOrders.createdAt,
    )
    .orderBy(desc(vendorOrders.createdAt))
    .limit(5);

  return rows.map((order) => ({
    vendorOrderId: order.vendorOrderId,
    orderId: order.orderId,
    itemsCount: Number(order.itemsCount),
    amount: Math.round(Number(order.amount)),
    status: order.status,
    thumbnailUrl: undefined,
    createdAt: order.createdAt.toISOString(),
  }));
}

async function getTopProducts(vendorId: string) {
  const db = getDb();

  const rows = await db
    .select({
      productId: products.productId,
      name: products.name,
      stock: products.stock,
      productImageId: products.productImageId,
      originalStorageKey: mediaLibrary.originalStorageKey,
      unitsSold: sql<string>`
        SUM(${orderItems.productQuantity})
      `,
      sales: sql<string>`
        SUM(
          ${orderItems.productPriceSnapshot}
          * ${orderItems.productQuantity}
        )
      `,
    })
    .from(orderItems)
    .innerJoin(vendorOrders, eq(orderItems.vendorOrderId, vendorOrders.vendorOrderId))
    .innerJoin(products, eq(orderItems.productId, products.productId))
    .leftJoin(mediaLibrary, eq(products.productImageId, mediaLibrary.mediaId))
    .where(
      and(
        eq(vendorOrders.vendorId, vendorId),
        ne(vendorOrders.status, 'cancelled'),
        eq(products.isSoftDeleted, false),
      ),
    )
    .groupBy(
      products.productId,
      products.name,
      products.stock,
      products.productImageId,
      mediaLibrary.originalStorageKey,
    )
    .orderBy(
      sql`
        SUM(${orderItems.productQuantity}) DESC
      `,
      sql`
        SUM(
          ${orderItems.productPriceSnapshot}
          * ${orderItems.productQuantity}
        ) DESC
      `,
    )
    .limit(5);

  return rows.map((product) => ({
    productId: product.productId,
    name: product.name,
    category: 'General',
    thumbnailUrl: product.originalStorageKey ? `/media/${product.originalStorageKey}` : undefined,
    unitsSold: Number(product.unitsSold),
    sales: Math.round(Number(product.sales)),
    stock: product.stock,
  }));
}

export async function getVendorDashboardData(vendorId: string, query: GetVendorDashboardQuery) {
  await verifyVendorExists(vendorId);

  const timeframe = resolveDashboardTimeframe(query.period);

  const [metrics, chart, recentOrders, topProducts] = await Promise.all([
    getDashboardMetrics(vendorId, timeframe.currentStart),
    getDashboardChart(vendorId, query.period, timeframe),
    getRecentOrders(vendorId),
    getTopProducts(vendorId),
  ]);

  return {
    metrics: {
      sales: {
        value: metrics.sales,
      },
      orders: {
        value: metrics.orders,
      },
      unitsSold: {
        value: metrics.unitsSold,
      },
      avgOrderValue: {
        value: metrics.avgOrderValue,
      },
    },
    chart,
    recentOrders,
    topProducts,
  };
}
