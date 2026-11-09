import { getDb } from '@repo/db';
import { carts, cartItems, mediaLibrary, products, vendors, users } from '@repo/db/schema';
import { and, eq, sql } from 'drizzle-orm';

import { AppError } from '../../shared/errors/AppError.js';
import { currentProductPriceSql } from '../../shared/pricing/current-product-price.js';
import { STORAGE_BUCKETS, storageService } from '../../shared/storage/storage.service.js';

type Transaction = Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0];

async function activeUser(userId: string) {
  const db = getDb();
  const [user] = await db
    .select({ userId: users.userId })
    .from(users)
    .where(and(eq(users.userId, userId), eq(users.status, 'active')))
    .limit(1);
  if (!user) throw new AppError(403, 'ACCOUNT_INACTIVE', 'Active account required.');
}

async function lockActiveUser(tx: Transaction, userId: string) {
  const [user] = await tx
    .select({ userId: users.userId })
    .from(users)
    .where(and(eq(users.userId, userId), eq(users.status, 'active')))
    .for('update')
    .limit(1);
  if (!user) throw new AppError(403, 'ACCOUNT_INACTIVE', 'Active account required.');
}

async function activeProduct(
  tx: Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0],
  productId: string,
) {
  const [product] = await tx
    .select({ productId: products.productId, stock: products.stock })
    .from(products)
    .innerJoin(vendors, eq(vendors.vendorId, products.vendorId))
    .innerJoin(users, eq(users.userId, vendors.userId))
    .where(
      and(
        eq(products.productId, productId),
        eq(products.published, true),
        eq(products.moderationStatus, 'approved'),
        eq(products.isSoftDeleted, false),
        eq(vendors.status, 'active'),
        eq(users.status, 'active'),
      ),
    )
    .for('update')
    .limit(1);
  if (!product) throw new AppError(404, 'PRODUCT_UNAVAILABLE', 'Product is unavailable.');
  return product;
}

export async function getCart(userId: string) {
  await activeUser(userId);
  const db = getDb();
  let [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  if (!cart) [cart] = await db.insert(carts).values({ userId }).onConflictDoNothing().returning();
  if (!cart) [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  const rows = await db
    .select({
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      name: products.name,
      slug: products.slug,
      price: currentProductPriceSql(products.productId, products.price),
      mrp: products.mrp,
      stock: products.stock,
      mediaId: mediaLibrary.mediaId,
      mediaVendorId: mediaLibrary.vendorId,
      vendorId: vendors.vendorId,
      vendorName: vendors.name,
      available: sql<boolean>`(${products.published} AND ${products.moderationStatus} = 'approved' AND NOT ${products.isSoftDeleted} AND ${products.stock} >= ${cartItems.quantity} AND ${vendors.status} = 'active' AND ${users.status} = 'active')`,
      lineTotal: sql<string>`CAST(${currentProductPriceSql(products.productId, products.price)} * ${cartItems.quantity} AS NUMERIC(12,2))`,
    })
    .from(cartItems)
    .leftJoin(products, eq(products.productId, cartItems.productId))
    .leftJoin(mediaLibrary, eq(mediaLibrary.mediaId, products.productImageId))
    .leftJoin(vendors, eq(vendors.vendorId, products.vendorId))
    .leftJoin(users, eq(users.userId, vendors.userId))
    .where(eq(cartItems.cartId, cart.cartId));
  const items = rows.map((row) => {
    if (!row.available) {
      return { productId: row.productId, quantity: row.quantity, available: false };
    }
    const imageUrl =
      row.mediaId && row.mediaVendorId
        ? storageService.resolveUrl(
            `vendors/${row.mediaVendorId}/media/${row.mediaId}/thumbnail.webp`,
            STORAGE_BUCKETS.productMedia,
          )
        : null;
    return {
      productId: row.productId,
      quantity: row.quantity,
      available: true,
      name: row.name,
      slug: row.slug,
      price: row.price,
      mrp: row.mrp,
      stock: row.stock,
      imageUrl,
      vendorId: row.vendorId,
      vendorName: row.vendorName,
      lineTotal: row.lineTotal,
    };
  });
  const [totals] = await db
    .select({
      subtotal: sql<string>`COALESCE(SUM(${currentProductPriceSql(products.productId, products.price)} * ${cartItems.quantity}), 0)::numeric(12,2)::text`,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.productId, cartItems.productId))
    .innerJoin(vendors, eq(vendors.vendorId, products.vendorId))
    .innerJoin(users, eq(users.userId, vendors.userId))
    .where(
      and(
        eq(cartItems.cartId, cart.cartId),
        eq(products.published, true),
        eq(products.moderationStatus, 'approved'),
        eq(products.isSoftDeleted, false),
        sql`${products.stock} >= ${cartItems.quantity}`,
        eq(vendors.status, 'active'),
        eq(users.status, 'active'),
      ),
    );
  return {
    items,
    subtotal: totals?.subtotal ?? '0.00',
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export async function addItem(userId: string, data: { productId: string; quantity: number }) {
  await activeUser(userId);
  const db = getDb();
  await db.insert(carts).values({ userId }).onConflictDoNothing();
  await db.transaction(async (tx) => {
    await lockActiveUser(tx, userId);
    const [cart] = await tx
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .for('update')
      .limit(1);
    const product = await activeProduct(tx, data.productId);
    const [line] = await tx
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cart.cartId), eq(cartItems.productId, data.productId)))
      .for('update')
      .limit(1);
    const quantity = (line?.quantity ?? 0) + data.quantity;
    if (quantity > product.stock)
      throw new AppError(409, 'INSUFFICIENT_STOCK', 'Requested quantity exceeds current stock.');
    if (line)
      await tx
        .update(cartItems)
        .set({ quantity, updatedAt: new Date() })
        .where(eq(cartItems.cartItemId, line.cartItemId));
    else
      await tx
        .insert(cartItems)
        .values({ cartId: cart.cartId, productId: data.productId, quantity });
  });
  return getCart(userId);
}

export async function setItem(userId: string, productId: string, quantity: number) {
  await activeUser(userId);
  const db = getDb();
  await db.transaction(async (tx) => {
    await lockActiveUser(tx, userId);
    const [cart] = await tx
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .for('update')
      .limit(1);
    if (!cart) throw new AppError(404, 'CART_ITEM_NOT_FOUND', 'Cart item not found.');
    const product = await activeProduct(tx, productId);
    if (quantity > product.stock)
      throw new AppError(409, 'INSUFFICIENT_STOCK', 'Requested quantity exceeds current stock.');
    const result = await tx
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(and(eq(cartItems.cartId, cart.cartId), eq(cartItems.productId, productId)))
      .returning();
    if (!result.length) throw new AppError(404, 'CART_ITEM_NOT_FOUND', 'Cart item not found.');
  });
  return getCart(userId);
}

export async function removeItem(userId: string, productId: string) {
  await activeUser(userId);
  const db = getDb();
  await db.transaction(async (tx) => {
    await lockActiveUser(tx, userId);
    const [cart] = await tx
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .for('update')
      .limit(1);
    if (cart)
      await tx
        .delete(cartItems)
        .where(and(eq(cartItems.cartId, cart.cartId), eq(cartItems.productId, productId)));
  });
}
