import { randomBytes } from 'node:crypto';

import { getDb } from '@repo/db';
import {
  categories,
  orderItems,
  productCategories,
  products,
  vendorOrders,
  vendors,
} from '@repo/db/schema';
import { and, asc, count, desc, eq, gte, ilike, inArray, ne, or, sql } from 'drizzle-orm';

import { AppError } from '../../shared/errors/AppError.js';

import type {
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

  // 2. Validate category IDs if provided
  if (input.categoryIds && input.categoryIds.length > 0) {
    const validCategories = await db.query.categories.findMany({
      where: inArray(categories.categoryId, input.categoryIds),
    });

    if (validCategories.length !== input.categoryIds.length) {
      throw new AppError(400, 'INVALID_CATEGORY', 'One or more specified categories do not exist.');
    }
  }

  // 3. Insert product & category mappings
  const [createdProduct] = await db
    .insert(products)
    .values({
      vendorId,
      name: input.name,
      slug: finalSlug,
      description: input.description,
      images: input.images,
      videos: input.videos || [],
      price: input.price,
      stock: input.stock,
      isSoftDeleted: false,
    })
    .returning();

  if (input.categoryIds && input.categoryIds.length > 0) {
    await db.insert(productCategories).values(
      input.categoryIds.map((categoryId) => ({
        productId: createdProduct.productId,
        categoryId,
      })),
    );
  }

  return getVendorProductById(vendorId, createdProduct.productId);
}

/**
 * Lists products owned by the vendor with pagination, search, and category filtering.
 */
export async function getVendorProducts(vendorId: string, query: GetVendorProductsQuery) {
  const db = getDb();
  const { page, limit, search, categoryId, sortBy, sortOrder } = query;
  const offset = (page - 1) * limit;

  const conditions = [eq(products.vendorId, vendorId), eq(products.isSoftDeleted, false)];

  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(
      or(ilike(products.name, searchPattern), ilike(products.description, searchPattern))!,
    );
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

  const enrichedProducts = productList.map((p) => ({
    ...p,
    categories: categoriesByProductId[p.productId] || [],
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

  return {
    ...product,
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

  // 3. Validate categories if updated
  if (input.categoryIds !== undefined) {
    if (input.categoryIds.length > 0) {
      const validCategories = await db.query.categories.findMany({
        where: inArray(categories.categoryId, input.categoryIds),
      });

      if (validCategories.length !== input.categoryIds.length) {
        throw new AppError(
          400,
          'INVALID_CATEGORY',
          'One or more specified categories do not exist.',
        );
      }
    }

    // Replace category associations
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

  // 4. Update product fields
  const updatePayload: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) updatePayload.name = input.name;
  if (input.slug !== undefined) updatePayload.slug = input.slug;
  if (input.description !== undefined) updatePayload.description = input.description;
  if (input.images !== undefined) updatePayload.images = input.images;
  if (input.videos !== undefined) updatePayload.videos = input.videos;
  if (input.price !== undefined) updatePayload.price = input.price;
  if (input.stock !== undefined) updatePayload.stock = input.stock;

  await db.update(products).set(updatePayload).where(eq(products.productId, productId));

  return getVendorProductById(vendorId, productId);
}

/**
 * Soft deletes a product owned by the vendor.
 */
export async function deleteVendorProductById(vendorId: string, productId: string) {
  const db = getDb();

  const existingProduct = await db.query.products.findFirst({
    where: and(eq(products.productId, productId), eq(products.vendorId, vendorId)),
  });

  if (!existingProduct || existingProduct.isSoftDeleted) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
  }

  await db
    .update(products)
    .set({
      isSoftDeleted: true,
      softDeletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(products.productId, productId));

  return { message: 'Product deleted successfully.' };
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
      images: products.images,
      stock: products.stock,
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
    .where(
      and(
        eq(vendorOrders.vendorId, vendorId),
        ne(vendorOrders.status, 'cancelled'),
        eq(products.isSoftDeleted, false),
      ),
    )
    .groupBy(products.productId, products.name, products.images, products.stock)
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
    thumbnailUrl: product.images?.[0],
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
