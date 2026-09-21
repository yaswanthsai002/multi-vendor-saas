import { randomBytes } from 'node:crypto';

import { getDb } from '@repo/db';
import {
  categories,
  orderItems,
  orders,
  productCategories,
  products,
  vendorOrders,
  vendors,
} from '@repo/db/schema';
import { and, asc, count, desc, eq, gte, ilike, inArray, lt, ne, or, sql } from 'drizzle-orm';

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

/**
 * Resolves aggregated vendor dashboard analytics, time series chart data,
 * recent orders, and top performing products for the specified timeframe.
 */
export async function getVendorDashboardData(vendorId: string, query: GetVendorDashboardQuery) {
  const db = getDb();

  // 1. Resolve vendor details
  const vendor = await db.query.vendors.findFirst({
    where: eq(vendors.vendorId, vendorId),
  });

  if (!vendor) {
    throw new AppError(404, 'VENDOR_NOT_FOUND', 'Vendor profile not found.');
  }

  // 2. Determine timeframe windows
  const days = query.period === '90d' ? 90 : query.period === '30d' ? 30 : 7;
  const now = new Date();
  const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevStart = new Date(currentStart.getTime() - days * 24 * 60 * 60 * 1000);

  // 3. Current period order items & orders
  const currentItems = await db
    .select({
      vendorOrderId: orderItems.vendorOrderId,
      productId: orderItems.productId,
      quantity: orderItems.productQuantity,
      price: orderItems.productPriceSnapshot,
      createdAt: vendorOrders.createdAt,
    })
    .from(orderItems)
    .innerJoin(vendorOrders, eq(orderItems.vendorOrderId, vendorOrders.vendorOrderId))
    .where(
      and(
        eq(vendorOrders.vendorId, vendorId),
        gte(vendorOrders.createdAt, currentStart),
        ne(vendorOrders.status, 'cancelled'),
      ),
    );

  const currentOrders = await db
    .select({
      vendorOrderId: vendorOrders.vendorOrderId,
      status: vendorOrders.status,
    })
    .from(vendorOrders)
    .where(
      and(
        eq(vendorOrders.vendorId, vendorId),
        gte(vendorOrders.createdAt, currentStart),
        ne(vendorOrders.status, 'cancelled'),
      ),
    );

  const currentSales = Math.round(
    currentItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
  );
  const currentOrdersCount = currentOrders.length;
  const currentUnitsSold = currentItems.reduce((acc, item) => acc + item.quantity, 0);
  const currentAov = currentOrdersCount > 0 ? Math.round(currentSales / currentOrdersCount) : 0;

  // 4. Previous period for trend calculations
  const prevItems = await db
    .select({
      quantity: orderItems.productQuantity,
      price: orderItems.productPriceSnapshot,
    })
    .from(orderItems)
    .innerJoin(vendorOrders, eq(orderItems.vendorOrderId, vendorOrders.vendorOrderId))
    .where(
      and(
        eq(vendorOrders.vendorId, vendorId),
        gte(vendorOrders.createdAt, prevStart),
        lt(vendorOrders.createdAt, currentStart),
        ne(vendorOrders.status, 'cancelled'),
      ),
    );

  const prevOrders = await db
    .select({ vendorOrderId: vendorOrders.vendorOrderId })
    .from(vendorOrders)
    .where(
      and(
        eq(vendorOrders.vendorId, vendorId),
        gte(vendorOrders.createdAt, prevStart),
        lt(vendorOrders.createdAt, currentStart),
        ne(vendorOrders.status, 'cancelled'),
      ),
    );

  const prevSales = Math.round(
    prevItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
  );
  const prevOrdersCount = prevOrders.length;
  const prevUnitsSold = prevItems.reduce((acc, item) => acc + item.quantity, 0);
  const prevAov = prevOrdersCount > 0 ? Math.round(prevSales / prevOrdersCount) : 0;

  function calcChange(curr: number, prev: number): number {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  }

  // 5. Generate chart data points for the period
  const chartPoints: Array<{ label: string; date: string; sales: number }> = [];
  const numBuckets = query.period === '90d' ? 12 : query.period === '30d' ? 10 : 7;
  const bucketDurationMs = (days * 24 * 60 * 60 * 1000) / numBuckets;

  for (let i = 0; i < numBuckets; i++) {
    const bucketStart = new Date(currentStart.getTime() + i * bucketDurationMs);
    const bucketEnd = new Date(currentStart.getTime() + (i + 1) * bucketDurationMs);

    const bucketSales = Math.round(
      currentItems
        .filter((item) => {
          const itemDate = new Date(item.createdAt);
          return itemDate >= bucketStart && itemDate < bucketEnd;
        })
        .reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
    );

    const label =
      query.period === '7d'
        ? bucketStart.toLocaleDateString('en-US', { weekday: 'short' })
        : bucketStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    chartPoints.push({
      label,
      date: bucketStart.toISOString().split('T')[0] ?? '',
      sales: bucketSales,
    });
  }

  // 6. Recent Orders (up to 5)
  const recentOrdersRaw = await db
    .select({
      vendorOrderId: vendorOrders.vendorOrderId,
      orderId: vendorOrders.orderId,
      status: vendorOrders.status,
      createdAt: vendorOrders.createdAt,
    })
    .from(vendorOrders)
    .where(eq(vendorOrders.vendorId, vendorId))
    .orderBy(desc(vendorOrders.createdAt))
    .limit(5);

  const recentOrders = await Promise.all(
    recentOrdersRaw.map(async (ro, index) => {
      const items = await db
        .select({
          quantity: orderItems.productQuantity,
          price: orderItems.productPriceSnapshot,
          productId: orderItems.productId,
        })
        .from(orderItems)
        .where(eq(orderItems.vendorOrderId, ro.vendorOrderId));

      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = Math.round(
        items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
      );

      let thumbnailUrl: string | undefined;
      if (items.length > 0 && items[0]?.productId) {
        const prod = await db.query.products.findFirst({
          where: eq(products.productId, items[0].productId),
          columns: { images: true },
        });
        thumbnailUrl = prod?.images?.[0];
      }

      const orderNumber = `#${1001 + index}`;

      return {
        vendorOrderId: ro.vendorOrderId,
        orderId: ro.orderId,
        orderNumber,
        itemsCount: totalItems,
        amount: totalAmount,
        status: ro.status,
        thumbnailUrl,
        createdAt: ro.createdAt.toISOString(),
      };
    }),
  );

  // 7. Top Products (up to 5)
  const vendorProducts = await db
    .select({
      productId: products.productId,
      name: products.name,
      images: products.images,
      price: products.price,
      stock: products.stock,
    })
    .from(products)
    .where(and(eq(products.vendorId, vendorId), eq(products.isSoftDeleted, false)))
    .limit(10);

  const topProducts = await Promise.all(
    vendorProducts.map(async (prod) => {
      const prodItems = await db
        .select({
          quantity: orderItems.productQuantity,
          price: orderItems.productPriceSnapshot,
        })
        .from(orderItems)
        .innerJoin(vendorOrders, eq(orderItems.vendorOrderId, vendorOrders.vendorOrderId))
        .where(
          and(
            eq(orderItems.productId, prod.productId),
            eq(vendorOrders.vendorId, vendorId),
            ne(vendorOrders.status, 'cancelled'),
          ),
        );

      const unitsSold = prodItems.reduce((sum, item) => sum + item.quantity, 0);
      const sales = Math.round(
        prodItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
      );

      const catMappings = await db
        .select({
          categoryName: categories.name,
        })
        .from(productCategories)
        .innerJoin(categories, eq(productCategories.categoryId, categories.categoryId))
        .where(eq(productCategories.productId, prod.productId));

      const category = catMappings.map((c) => c.categoryName).join(' · ') || 'General';

      return {
        productId: prod.productId,
        name: prod.name,
        category,
        thumbnailUrl: prod.images?.[0],
        unitsSold,
        sales,
        stock: prod.stock,
      };
    }),
  );

  topProducts.sort((a, b) => b.unitsSold - a.unitsSold || b.sales - a.sales);

  return {
    vendor: {
      vendorId: vendor.vendorId,
      name: vendor.name,
      slug: vendor.slug,
      logoUrl: vendor.logoUrl,
    },
    metrics: {
      sales: {
        value: currentSales,
        changePercentage: calcChange(currentSales, prevSales),
      },
      orders: {
        value: currentOrdersCount,
        changePercentage: calcChange(currentOrdersCount, prevOrdersCount),
      },
      unitsSold: {
        value: currentUnitsSold,
        changePercentage: calcChange(currentUnitsSold, prevUnitsSold),
      },
      avgOrderValue: {
        value: currentAov,
        changePercentage: calcChange(currentAov, prevAov),
      },
    },
    chart: chartPoints,
    recentOrders,
    topProducts: topProducts.slice(0, 5),
  };
}
