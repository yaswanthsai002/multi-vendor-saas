import { getDb } from '@repo/db';
import {
  categories,
  mediaLibrary,
  productCategories,
  productMedia,
  products,
  vendors,
} from '@repo/db/schema';
import { and, count, desc, eq, exists, gt, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm';

import { AppError } from '../../shared/errors/AppError.js';
import { STORAGE_BUCKETS, storageService } from '../../shared/storage/storage.service.js';

import type { ListCatalogProductsQuery } from './catalog.schema.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ponytail: helper to resolve image storage key into public CDN/API URL
function resolveImageUrl(media: {
  mediaId: string;
  vendorId: string;
  originalStorageKey: string;
}): string {
  const dirPrefix = `vendors/${media.vendorId}/media/${media.mediaId}`;
  return storageService.resolveUrl(`${dirPrefix}/thumbnail.webp`, STORAGE_BUCKETS.productMedia);
}

function resolveFullImageUrl(media: {
  mediaId: string;
  vendorId: string;
  originalStorageKey: string;
}): string {
  const dirPrefix = `vendors/${media.vendorId}/media/${media.mediaId}`;
  return storageService.resolveUrl(`${dirPrefix}/original.webp`, STORAGE_BUCKETS.productMedia);
}

export async function listCatalogProducts(query: ListCatalogProductsQuery) {
  const db = getDb();
  const { page, limit, search, category, vendor, minPrice, maxPrice, inStock, isFeatured, sortBy } =
    query;

  const offset = (page - 1) * limit;

  // Base security constraints: only active vendors, published, approved, non-deleted products
  const conditions = [
    eq(products.published, true),
    eq(products.moderationStatus, 'approved'),
    eq(products.isSoftDeleted, false),
    eq(vendors.status, 'active'),
  ];

  if (search) {
    conditions.push(
      or(
        ilike(products.name, `%${search}%`),
        ilike(products.shortDescription, `%${search}%`),
        ilike(products.description, `%${search}%`),
      )!,
    );
  }

  if (vendor) {
    if (UUID_REGEX.test(vendor)) {
      conditions.push(eq(products.vendorId, vendor));
    } else {
      conditions.push(eq(vendors.slug, vendor));
    }
  }

  if (category && category.length > 0) {
    // ponytail: match product against any specified category or subcategory
    const categoryUuids = category.filter((c) => UUID_REGEX.test(c));
    const categorySlugs = category.filter((c) => !UUID_REGEX.test(c));

    const categoryFilters = [];
    if (categoryUuids.length > 0) {
      categoryFilters.push(inArray(categories.categoryId, categoryUuids));
    }
    if (categorySlugs.length > 0) {
      categoryFilters.push(inArray(categories.slug, categorySlugs));
    }

    if (categoryFilters.length > 0) {
      const categoryCondition = exists(
        db
          .select({ id: productCategories.productId })
          .from(productCategories)
          .innerJoin(categories, eq(categories.categoryId, productCategories.categoryId))
          .where(and(eq(productCategories.productId, products.productId), or(...categoryFilters))),
      );
      conditions.push(categoryCondition);
    }
  }

  if (minPrice !== undefined) {
    conditions.push(gte(products.price, minPrice.toString()));
  }

  if (maxPrice !== undefined) {
    conditions.push(lte(products.price, maxPrice.toString()));
  }

  if (inStock) {
    conditions.push(gt(products.stock, 0));
  }

  if (isFeatured) {
    conditions.push(eq(products.isFeatured, true));
  }

  const whereClause = and(...conditions);

  // Sorting
  let orderByClause = [desc(products.isFeatured), desc(products.createdAt)];
  if (sortBy === 'price_asc') {
    orderByClause = [sql`CAST(${products.price} AS NUMERIC) ASC`];
  } else if (sortBy === 'price_desc') {
    orderByClause = [sql`CAST(${products.price} AS NUMERIC) DESC`];
  } else if (sortBy === 'newest') {
    orderByClause = [desc(products.createdAt)];
  }

  // Count total for pagination
  const [totalRow] = await db
    .select({ total: count() })
    .from(products)
    .innerJoin(vendors, eq(vendors.vendorId, products.vendorId))
    .where(whereClause);

  const total = Number(totalRow?.total ?? 0);
  const totalPages = Math.ceil(total / limit);

  // Fetch paginated products
  const rows = await db
    .select({
      productId: products.productId,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      stock: products.stock,
      isFeatured: products.isFeatured,
      createdAt: products.createdAt,
      vendorId: vendors.vendorId,
      vendorName: vendors.name,
      vendorSlug: vendors.slug,
      vendorLogoUrl: vendors.logoUrl,
      mediaId: mediaLibrary.mediaId,
      mediaVendorId: mediaLibrary.vendorId,
      mediaStorageKey: mediaLibrary.originalStorageKey,
    })
    .from(products)
    .innerJoin(vendors, eq(vendors.vendorId, products.vendorId))
    .leftJoin(mediaLibrary, eq(mediaLibrary.mediaId, products.productImageId))
    .where(whereClause)
    .orderBy(...orderByClause)
    .limit(limit)
    .offset(offset);

  // Fetch categories for all fetched products in one batch
  const productIds = rows.map((r) => r.productId);
  const categoryMap = new Map<string, { categoryId: string; name: string; slug: string }[]>();

  if (productIds.length > 0) {
    const categoryRows = await db
      .select({
        productId: productCategories.productId,
        categoryId: categories.categoryId,
        name: categories.name,
        slug: categories.slug,
      })
      .from(productCategories)
      .innerJoin(categories, eq(categories.categoryId, productCategories.categoryId))
      .where(inArray(productCategories.productId, productIds));

    for (const c of categoryRows) {
      const list = categoryMap.get(c.productId) ?? [];
      list.push({ categoryId: c.categoryId, name: c.name, slug: c.slug });
      categoryMap.set(c.productId, list);
    }
  }

  const items = rows.map((r) => {
    let imageUrl: string | null = null;
    if (r.mediaStorageKey && r.mediaId && r.mediaVendorId) {
      imageUrl = resolveImageUrl({
        mediaId: r.mediaId,
        vendorId: r.mediaVendorId,
        originalStorageKey: r.mediaStorageKey,
      });
    }

    return {
      productId: r.productId,
      name: r.name,
      slug: r.slug,
      shortDescription: r.shortDescription,
      price: r.price,
      compareAtPrice: r.compareAtPrice,
      stock: r.stock,
      isFeatured: r.isFeatured,
      createdAt: r.createdAt,
      imageUrl,
      vendor: {
        vendorId: r.vendorId,
        name: r.vendorName,
        slug: r.vendorSlug,
        logoUrl: r.vendorLogoUrl,
      },
      categories: categoryMap.get(r.productId) ?? [],
    };
  });

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function getCatalogProductBySlug(slug: string) {
  const db = getDb();

  const [row] = await db
    .select({
      productId: products.productId,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      description: products.description,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      stock: products.stock,
      isFeatured: products.isFeatured,
      createdAt: products.createdAt,
      vendorId: vendors.vendorId,
      vendorName: vendors.name,
      vendorSlug: vendors.slug,
      vendorLogoUrl: vendors.logoUrl,
      vendorTagline: vendors.tagline,
      vendorDescription: vendors.description,
      primaryMediaId: mediaLibrary.mediaId,
      primaryMediaVendorId: mediaLibrary.vendorId,
      primaryMediaStorageKey: mediaLibrary.originalStorageKey,
    })
    .from(products)
    .innerJoin(vendors, eq(vendors.vendorId, products.vendorId))
    .leftJoin(mediaLibrary, eq(mediaLibrary.mediaId, products.productImageId))
    .where(
      and(
        eq(products.slug, slug),
        eq(products.published, true),
        eq(products.moderationStatus, 'approved'),
        eq(products.isSoftDeleted, false),
        eq(vendors.status, 'active'),
      ),
    )
    .limit(1);

  if (!row) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found or currently unavailable.');
  }

  // Fetch gallery media
  const galleryRows = await db
    .select({
      mediaId: mediaLibrary.mediaId,
      vendorId: mediaLibrary.vendorId,
      originalStorageKey: mediaLibrary.originalStorageKey,
      sortOrder: productMedia.sortOrder,
    })
    .from(productMedia)
    .innerJoin(mediaLibrary, eq(mediaLibrary.mediaId, productMedia.mediaId))
    .where(eq(productMedia.productId, row.productId))
    .orderBy(productMedia.sortOrder);

  const gallery = galleryRows.map((g) => ({
    mediaId: g.mediaId,
    url: resolveFullImageUrl(g),
    sortOrder: g.sortOrder,
  }));

  // Fetch categories
  const categoryRows = await db
    .select({
      categoryId: categories.categoryId,
      name: categories.name,
      slug: categories.slug,
    })
    .from(productCategories)
    .innerJoin(categories, eq(categories.categoryId, productCategories.categoryId))
    .where(eq(productCategories.productId, row.productId));

  let primaryImage: string | null = null;
  if (row.primaryMediaStorageKey && row.primaryMediaId && row.primaryMediaVendorId) {
    primaryImage = resolveFullImageUrl({
      mediaId: row.primaryMediaId,
      vendorId: row.primaryMediaVendorId,
      originalStorageKey: row.primaryMediaStorageKey,
    });
  }

  return {
    productId: row.productId,
    name: row.name,
    slug: row.slug,
    shortDescription: row.shortDescription,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compareAtPrice,
    stock: row.stock,
    isFeatured: row.isFeatured,
    createdAt: row.createdAt,
    primaryImage,
    gallery,
    categories: categoryRows,
    vendor: {
      vendorId: row.vendorId,
      name: row.vendorName,
      slug: row.vendorSlug,
      logoUrl: row.vendorLogoUrl,
      tagline: row.vendorTagline,
      description: row.vendorDescription,
    },
  };
}

// ponytail: facets aggregator returning categories with product counts and global price range
export async function getCatalogFacets() {
  const db = getDb();

  const activeProductCondition = and(
    eq(products.published, true),
    eq(products.moderationStatus, 'approved'),
    eq(products.isSoftDeleted, false),
    eq(vendors.status, 'active'),
  );

  const [priceStats] = await db
    .select({
      minPrice: sql<string>`MIN(CAST(${products.price} AS NUMERIC))`,
      maxPrice: sql<string>`MAX(CAST(${products.price} AS NUMERIC))`,
    })
    .from(products)
    .innerJoin(vendors, eq(vendors.vendorId, products.vendorId))
    .where(activeProductCondition);

  const categoryCounts = await db
    .select({
      categoryId: categories.categoryId,
      name: categories.name,
      slug: categories.slug,
      parentCategoryId: categories.parentCategoryId,
      productCount: sql<number>`COALESCE(COUNT(DISTINCT ${products.productId}), 0)`,
    })
    .from(categories)
    .leftJoin(productCategories, eq(productCategories.categoryId, categories.categoryId))
    .leftJoin(
      products,
      and(
        eq(products.productId, productCategories.productId),
        eq(products.published, true),
        eq(products.moderationStatus, 'approved'),
        eq(products.isSoftDeleted, false),
      ),
    )
    .leftJoin(vendors, and(eq(vendors.vendorId, products.vendorId), eq(vendors.status, 'active')))
    .groupBy(categories.categoryId, categories.name, categories.slug, categories.parentCategoryId)
    .orderBy(desc(sql`COUNT(DISTINCT ${products.productId})`), categories.name);

  return {
    priceRange: {
      min: Math.floor(Number(priceStats?.minPrice ?? 0)),
      max: Math.ceil(Number(priceStats?.maxPrice ?? 10000)),
    },
    categories: categoryCounts.map((c) => ({
      categoryId: c.categoryId,
      name: c.name,
      slug: c.slug,
      parentCategoryId: c.parentCategoryId,
      productCount: Number(c.productCount),
    })),
  };
}
