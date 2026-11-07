import { getDb } from '@repo/db';
import { mediaLibrary, products, users, vendors, wishlistItems } from '@repo/db/schema';
import { and, aliasedTable, asc, desc, eq } from 'drizzle-orm';

import { AppError } from '../../shared/errors/AppError.js';
import { STORAGE_BUCKETS, storageService } from '../../shared/storage/storage.service.js';

type Transaction = Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0];
const vendorOwner = aliasedTable(users, 'vendor_owner');

async function lockActiveUser(tx: Transaction, userId: string) {
  const [user] = await tx
    .select({ userId: users.userId })
    .from(users)
    .where(and(eq(users.userId, userId), eq(users.status, 'active')))
    .for('update')
    .limit(1);
  if (!user) throw new AppError(403, 'ACCOUNT_INACTIVE', 'Active account required.');
}

export async function getWishlist(userId: string) {
  const db = getDb();
  const [user] = await db
    .select({ userId: users.userId })
    .from(users)
    .where(and(eq(users.userId, userId), eq(users.status, 'active')))
    .limit(1);
  if (!user) throw new AppError(403, 'ACCOUNT_INACTIVE', 'Active account required.');

  const rows = await db
    .select({
      productId: products.productId,
      name: products.name,
      slug: products.slug,
      price: products.price,
      mrp: products.mrp,
      stock: products.stock,
      imageId: mediaLibrary.mediaId,
      imageVendorId: mediaLibrary.vendorId,
      vendorName: vendors.name,
      createdAt: wishlistItems.createdAt,
    })
    .from(wishlistItems)
    .innerJoin(users, eq(users.userId, wishlistItems.userId))
    .innerJoin(products, eq(products.productId, wishlistItems.productId))
    .innerJoin(vendors, eq(vendors.vendorId, products.vendorId))
    .innerJoin(vendorOwner, eq(vendorOwner.userId, vendors.userId))
    .leftJoin(mediaLibrary, eq(mediaLibrary.mediaId, products.productImageId))
    .where(
      and(
        eq(wishlistItems.userId, userId),
        eq(users.status, 'active'),
        eq(products.published, true),
        eq(products.moderationStatus, 'approved'),
        eq(products.isSoftDeleted, false),
        eq(vendors.status, 'active'),
        eq(vendorOwner.status, 'active'),
      ),
    )
    .orderBy(desc(wishlistItems.createdAt), asc(wishlistItems.productId));

  return {
    items: rows.map((row) => ({
      productId: row.productId,
      name: row.name,
      slug: row.slug,
      price: row.price,
      mrp: row.mrp,
      stock: row.stock,
      imageUrl:
        row.imageId && row.imageVendorId
          ? storageService.resolveUrl(
              `vendors/${row.imageVendorId}/media/${row.imageId}/thumbnail.webp`,
              STORAGE_BUCKETS.productMedia,
            )
          : null,
      vendorName: row.vendorName,
      createdAt: row.createdAt,
    })),
  };
}

export async function addWishlistItem(userId: string, productId: string) {
  const db = getDb();
  await db.transaction(async (tx) => {
    await lockActiveUser(tx, userId);
    const [product] = await tx
      .select({ productId: products.productId })
      .from(products)
      .innerJoin(vendors, eq(vendors.vendorId, products.vendorId))
      .innerJoin(vendorOwner, eq(vendorOwner.userId, vendors.userId))
      .where(
        and(
          eq(products.productId, productId),
          eq(products.published, true),
          eq(products.moderationStatus, 'approved'),
          eq(products.isSoftDeleted, false),
          eq(vendors.status, 'active'),
          eq(vendorOwner.status, 'active'),
        ),
      )
      .for('update')
      .limit(1);
    if (!product) throw new AppError(404, 'PRODUCT_UNAVAILABLE', 'Product is unavailable.');

    await tx.insert(wishlistItems).values({ userId, productId }).onConflictDoNothing();
  });
}

export async function removeWishlistItem(userId: string, productId: string) {
  const db = getDb();
  await db.transaction(async (tx) => {
    await lockActiveUser(tx, userId);
    await tx
      .delete(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)));
  });
}
