import { randomUUID } from 'node:crypto';

import { getDb } from '@repo/db';
import {
  campaigns,
  campaignProducts,
  mediaLibrary,
  orderItems,
  orders,
  productReviews,
  products,
  users,
  vendorOrders,
  vendors,
} from '@repo/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { checkoutTestDatabaseUrl } from '../../shared/config/test-database.js';
import { getProductReviews, listCatalogProducts } from '../catalog/catalog.service.js';
import { getHomepageCampaigns } from '../merchandising/merchandising.service.js';

import { getCustomerOrder, listCustomerOrders } from './customer-order.service.js';
import { saveCustomerReviewSchema } from './customer-review.schema.js';
import { deleteCustomerReview, saveCustomerReview } from './customer-review.service.js';

async function fixture() {
  const db = getDb();
  const [customer] = await db
    .insert(users)
    .values({ fullName: 'Review customer', email: `${randomUUID()}@example.test` })
    .returning();
  const [owner] = await db
    .insert(users)
    .values({ fullName: 'Seller', email: `${randomUUID()}@example.test`, roles: ['vendor'] })
    .returning();
  const [vendor] = await db
    .insert(vendors)
    .values({ userId: owner.userId, name: 'Seller', slug: randomUUID(), status: 'active' })
    .returning();
  const [product] = await db
    .insert(products)
    .values({
      vendorId: vendor.vendorId,
      name: 'Review lamp',
      slug: randomUUID(),
      description: 'Lamp',
      price: '100.00',
      mrp: '120.00',
      stock: 10,
      published: true,
      moderationStatus: 'approved',
    })
    .returning();
  const [order] = await db
    .insert(orders)
    .values({
      userId: customer.userId,
      orderNumber: randomUUID(),
      requestKey: randomUUID(),
      requestFingerprint: 'review-test',
      status: 'completed',
    })
    .returning();
  const [portion] = await db
    .insert(vendorOrders)
    .values({
      orderId: order.orderId,
      vendorId: vendor.vendorId,
      status: 'completed',
      completedAt: new Date(),
    })
    .returning();
  const [item] = await db
    .insert(orderItems)
    .values({
      vendorOrderId: portion.vendorOrderId,
      productId: product.productId,
      productNameSnapshot: product.name,
      productQuantity: 3,
      productPriceSnapshot: '100.00',
    })
    .returning();
  return { customer, owner, vendor, product, order, portion, item };
}
let f: Awaited<ReturnType<typeof fixture>>;
const fixtures: Awaited<ReturnType<typeof fixture>>[] = [];
function save(expectedVersion: number, rating = 5, reviewText: string | null = 'Good lamp') {
  return saveCustomerReview(f.customer.userId, f.order.orderId, f.item.orderItemId, {
    expectedVersion,
    rating,
    reviewText,
  });
}
function remove(expectedVersion: number) {
  return deleteCustomerReview(
    f.customer.userId,
    f.order.orderId,
    f.item.orderItemId,
    expectedVersion,
  );
}
function reviews(page = 1, limit = 20) {
  return getProductReviews(f.product.slug, { page, limit });
}

describe
  .skipIf(!checkoutTestDatabaseUrl)
  .sequential('purchase-linked reviews PostgreSQL integration', () => {
    beforeAll(async () => {
      if (!checkoutTestDatabaseUrl) throw new Error('Explicit test database required.');
      const target = new URL(checkoutTestDatabaseUrl);
      if (
        !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) ||
        target.pathname !== '/perigee_test'
      )
        throw new Error('Use a disposable local perigee_test database.');
      target.searchParams.set('options', '-clock_timeout=10000');
      vi.stubEnv('DATABASE_URL', target.toString());
      await getDb().execute(sql`SELECT "reviewVersion" FROM "orderItems" LIMIT 1`);
    });
    beforeEach(async () => {
      f = await fixture();
      fixtures.push(f);
    });
    afterAll(async () => {
      const db = getDb();
      for (const entry of fixtures.reverse()) {
        const itemIds = db
          .select({ id: orderItems.orderItemId })
          .from(orderItems)
          .where(eq(orderItems.vendorOrderId, entry.portion.vendorOrderId));
        await db.delete(productReviews).where(inArray(productReviews.orderItemId, itemIds));
        await db
          .delete(orderItems)
          .where(eq(orderItems.vendorOrderId, entry.portion.vendorOrderId));
        await db.delete(vendorOrders).where(eq(vendorOrders.orderId, entry.order.orderId));
        await db.delete(orders).where(eq(orders.orderId, entry.order.orderId));
        await db.delete(products).where(eq(products.productId, entry.product.productId));
        await db.delete(vendors).where(eq(vendors.vendorId, entry.vendor.vendorId));
        await db
          .delete(users)
          .where(inArray(users.userId, [entry.customer.userId, entry.owner.userId]));
      }
      await db.$client.end();
      vi.unstubAllEnvs();
    });

    it('creates one review per line, preserves creation on edit and replaces its rating', async () => {
      const first = await save(0);
      expect(first.reviewVersion).toBe(1);
      expect(first.review?.createdAt).toBe(first.review?.updatedAt);
      await new Promise((resolve) => setTimeout(resolve, 5));
      const edited = await save(1, 2, null);
      expect(edited.review).toMatchObject({
        reviewId: first.review?.reviewId,
        createdAt: first.review?.createdAt,
        rating: 2,
        reviewText: null,
      });
      expect(edited.review?.updatedAt).not.toBe(first.review?.updatedAt);
      const publicState = await reviews();
      expect(publicState).toMatchObject({ ratingCount: 1, averageRating: 2 });
      expect(publicState.items[0]).toMatchObject({
        authorName: 'Review customer',
        authorAvatarUrl: null,
      });
      expect(Object.keys(publicState.items[0]).sort()).toEqual([
        'authorAvatarUrl',
        'authorName',
        'createdAt',
        'rating',
        'reviewId',
        'reviewText',
      ]);
      const [stored] = await getDb()
        .select()
        .from(productReviews)
        .where(eq(productReviews.orderItemId, f.item.orderItemId));
      expect(stored).toMatchObject({ userId: f.customer.userId, productId: f.product.productId });
      const detail = await getCustomerOrder(f.customer.userId, f.order.orderId);
      expect(detail.items[0]).toMatchObject(edited);
      const history = await listCustomerOrders(f.customer.userId, { page: 1, limit: 20 });
      expect(history.items[0].items[0]).not.toHaveProperty('reviewVersion');
    });

    it('allows one of two concurrent connections to commit and rejects replay', async () => {
      const results = await Promise.allSettled([save(0, 5), save(0, 2)]);
      expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
      expect(results.find((result) => result.status === 'rejected')).toMatchObject({
        reason: { code: 'REVIEW_VERSION_CONFLICT' },
      });
      await expect(save(0)).rejects.toMatchObject({ code: 'REVIEW_VERSION_CONFLICT' });
      expect((await reviews()).ratingCount).toBe(1);
    });

    it('keeps versions after delete and protects a replacement from delayed requests', async () => {
      await save(0);
      expect(await remove(1)).toMatchObject({ review: null, reviewVersion: 2 });
      expect(await remove(0)).toMatchObject({ review: null, reviewVersion: 2 });
      expect(await reviews()).toMatchObject({
        items: [],
        ratingCount: 0,
        averageRating: null,
        distribution: [1, 2, 3, 4, 5].map((rating) => ({ rating, count: 0 })),
      });
      const replacement = await save(2, 3);
      await expect(remove(1)).rejects.toMatchObject({ code: 'REVIEW_VERSION_CONFLICT' });
      await expect(save(1)).rejects.toMatchObject({ code: 'REVIEW_VERSION_CONFLICT' });
      expect((await getCustomerOrder(f.customer.userId, f.order.orderId)).items[0]).toMatchObject(
        replacement,
      );
    });

    it('rolls back version and timestamps when a DB constraint rejects content', async () => {
      const before = await save(0);
      await expect(save(1, 6)).rejects.toThrow();
      await expect(save(1, 5, 'x'.repeat(2001))).rejects.toThrow();
      expect((await getCustomerOrder(f.customer.userId, f.order.orderId)).items[0]).toMatchObject(
        before,
      );
      expect((await reviews()).ratingCount).toBe(1);
    });

    it('rejects inactive accounts, wrong roles, wrong owners and mismatched item paths', async () => {
      await expect(
        saveCustomerReview(f.owner.userId, f.order.orderId, f.item.orderItemId, {
          expectedVersion: 0,
          rating: 5,
          reviewText: null,
        }),
      ).rejects.toMatchObject({ code: 'CUSTOMER_REQUIRED' });
      const other = await fixture();
      fixtures.push(other);
      await expect(
        saveCustomerReview(other.customer.userId, f.order.orderId, f.item.orderItemId, {
          expectedVersion: 0,
          rating: 5,
          reviewText: null,
        }),
      ).rejects.toMatchObject({ code: 'ORDER_NOT_FOUND' });
      await expect(
        saveCustomerReview(f.customer.userId, f.order.orderId, other.item.orderItemId, {
          expectedVersion: 0,
          rating: 5,
          reviewText: null,
        }),
      ).rejects.toMatchObject({ code: 'ORDER_ITEM_NOT_FOUND' });
      await getDb()
        .update(users)
        .set({ status: 'suspended' })
        .where(eq(users.userId, f.customer.userId));
      await expect(save(0)).rejects.toMatchObject({ code: 'ACCOUNT_INACTIVE' });
      await expect(remove(0)).rejects.toMatchObject({ code: 'ACCOUNT_INACTIVE' });
    });

    it.each(['pending', 'processing', 'cancelled'] as const)(
      'rejects %s portions even with a completed parent',
      async (status) => {
        await getDb()
          .update(vendorOrders)
          .set({
            status,
            completedAt: null,
            ...(status === 'cancelled'
              ? {
                  cancellationSource: 'customer',
                  cancelledByUserId: f.customer.userId,
                  cancelledAt: new Date(),
                }
              : {}),
          })
          .where(eq(vendorOrders.vendorOrderId, f.portion.vendorOrderId));
        await expect(save(0)).rejects.toMatchObject({ code: 'REVIEW_NOT_ELIGIBLE' });
        await expect(remove(0)).rejects.toMatchObject({ code: 'REVIEW_NOT_ELIGIBLE' });
        expect(
          (await getCustomerOrder(f.customer.userId, f.order.orderId)).items[0].canReview,
        ).toBe(false);
      },
    );

    it('joins current profiles and retains feedback from suspended authors', async () => {
      await save(0);
      await getDb()
        .update(users)
        .set({
          fullName: 'New name',
          avatarUrl: 'https://example.test/avatar.webp',
          status: 'suspended',
        })
        .where(eq(users.userId, f.customer.userId));
      expect((await reviews()).items[0]).toMatchObject({
        authorName: 'New name',
        authorAvatarUrl: 'https://example.test/avatar.webp',
      });
      await getDb()
        .update(users)
        .set({ avatarUrl: null })
        .where(eq(users.userId, f.customer.userId));
      expect((await reviews()).items[0].authorAvatarUrl).toBeNull();
      await expect(save(1)).rejects.toMatchObject({ code: 'ACCOUNT_INACTIVE' });
    });

    it('allows private feedback on unlisted and soft-deleted products without public access', async () => {
      await getDb()
        .update(products)
        .set({ published: false, isSoftDeleted: true })
        .where(eq(products.productId, f.product.productId));
      await save(0);
      await expect(reviews()).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND' });
      await save(1, 4);
      await getDb()
        .update(products)
        .set({ published: true, isSoftDeleted: false })
        .where(eq(products.productId, f.product.productId));
      expect((await reviews()).averageRating).toBe(4);
    });

    it('enforces DB uniqueness, references, Unicode length and non-negative versions', async () => {
      const input = {
        orderItemId: f.item.orderItemId,
        userId: f.customer.userId,
        productId: f.product.productId,
        rating: 5,
      };
      await expect(
        getDb()
          .insert(productReviews)
          .values({ ...input, userId: randomUUID() }),
      ).rejects.toThrow();
      await expect(
        getDb()
          .insert(productReviews)
          .values({ ...input, rating: sql`NULL` }),
      ).rejects.toThrow();
      await save(0, 5, '😀'.repeat(2000));
      const row = {
        orderItemId: f.item.orderItemId,
        userId: f.customer.userId,
        productId: f.product.productId,
        rating: 5,
      };
      await expect(getDb().insert(productReviews).values(row)).rejects.toThrow();
      await expect(
        getDb()
          .insert(productReviews)
          .values({ ...row, orderItemId: randomUUID() }),
      ).rejects.toThrow();
      await expect(
        getDb().delete(users).where(eq(users.userId, f.customer.userId)),
      ).rejects.toThrow();
      await expect(
        getDb().delete(orderItems).where(eq(orderItems.orderItemId, f.item.orderItemId)),
      ).rejects.toThrow();
      await expect(
        getDb()
          .update(orderItems)
          .set({ reviewVersion: -1 })
          .where(eq(orderItems.orderItemId, f.item.orderItemId)),
      ).rejects.toThrow();
    });

    it('rejects writes at the maximum version but permits absent deletion', async () => {
      const first = await save(0);
      await getDb()
        .update(orderItems)
        .set({ reviewVersion: 2147483647 })
        .where(eq(orderItems.orderItemId, f.item.orderItemId));
      await expect(save(2147483647)).rejects.toMatchObject({ code: 'REVIEW_VERSION_EXHAUSTED' });
      await expect(remove(2147483647)).rejects.toMatchObject({ code: 'REVIEW_VERSION_EXHAUSTED' });
      expect((await getCustomerOrder(f.customer.userId, f.order.orderId)).items[0]).toMatchObject({
        ...first,
        reviewVersion: 2147483647,
      });
      await getDb()
        .delete(productReviews)
        .where(eq(productReviews.orderItemId, f.item.orderItemId));
      expect(await remove(0)).toMatchObject({ review: null, reviewVersion: 2147483647 });
    });

    it('accepts a distinct later purchase and pages by creation without duplicate ratings', async () => {
      const initial = await save(0, 2);
      const later = await fixture();
      fixtures.push(later);
      await getDb()
        .update(orders)
        .set({ userId: f.customer.userId })
        .where(eq(orders.orderId, later.order.orderId));
      await getDb()
        .update(vendorOrders)
        .set({ vendorId: f.vendor.vendorId })
        .where(eq(vendorOrders.vendorOrderId, later.portion.vendorOrderId));
      await getDb()
        .update(orderItems)
        .set({ productId: f.product.productId })
        .where(eq(orderItems.orderItemId, later.item.orderItemId));
      const next = await saveCustomerReview(
        f.customer.userId,
        later.order.orderId,
        later.item.orderItemId,
        saveCustomerReviewSchema.parse({ expectedVersion: 0, rating: 4 }),
      );
      await save(1, 5);
      expect(await reviews(1, 1)).toMatchObject({
        ratingCount: 2,
        averageRating: 4.5,
        pagination: { totalPages: 2, hasMore: true },
      });
      expect((await reviews(1, 1)).items[0].reviewId).toBe(next.review?.reviewId);
      expect((await reviews(2, 1)).items[0].reviewId).toBe(initial.review?.reviewId);
    });

    it('keeps catalog and homepage aggregates current across buyers, edits and deletion', async () => {
      const db = getDb();
      const [banner] = await db
        .insert(mediaLibrary)
        .values({
          vendorId: null,
          createdBy: f.owner.userId,
          mediaType: 'image',
          originalFileName: 'banner.webp',
          mimeType: 'image/webp',
          fileSizeBytes: 1024,
          originalStorageKey: `admin/media/${randomUUID()}/original.webp`,
        })
        .returning();
      const [campaign] = await db
        .insert(campaigns)
        .values({
          status: 'published',
          ownerUserId: f.owner.userId,
          eyebrow: 'Reviews',
          title: 'Reviews',
          subtitle: 'Reviews',
          desktopMediaId: banner.mediaId,
          ctaLabel: 'Shop',
          ctaHref: '/products',
          startsAt: new Date(Date.now() - 60000),
          endsAt: new Date(Date.now() + 3600000),
          position: -1000,
        })
        .returning();
      await db.insert(campaignProducts).values({
        campaignId: campaign.campaignId,
        productId: f.product.productId,
        dealPrice: '90.00',
      });
      const other = await fixture();
      fixtures.push(other);
      await db
        .update(vendorOrders)
        .set({ vendorId: f.vendor.vendorId })
        .where(eq(vendorOrders.vendorOrderId, other.portion.vendorOrderId));
      await db
        .update(orderItems)
        .set({ productId: f.product.productId })
        .where(eq(orderItems.orderItemId, other.item.orderItemId));
      await save(0, 2);
      await saveCustomerReview(other.customer.userId, other.order.orderId, other.item.orderItemId, {
        expectedVersion: 0,
        rating: 4,
        reviewText: null,
      });
      async function assertRatings(rating: number | null, ratingCount: number) {
        const catalog = await listCatalogProducts({
          page: 1,
          limit: 20,
          sortBy: 'newest',
          vendor: f.vendor.vendorId,
        });
        expect(catalog.items.find((item) => item.productId === f.product.productId)).toMatchObject({
          rating,
          ratingCount,
        });
        const homepage = await getHomepageCampaigns();
        expect(
          homepage.active.find((entry) => entry.campaignId === campaign.campaignId)?.products[0],
        ).toMatchObject({ rating, ratingCount });
      }
      await assertRatings(3, 2);
      await save(1, 5);
      await assertRatings(4.5, 2);
      await remove(2);
      await assertRatings(4, 1);
      await deleteCustomerReview(
        other.customer.userId,
        other.order.orderId,
        other.item.orderItemId,
        1,
      );
      await assertRatings(null, 0);
      await db.update(users).set({ status: 'suspended' }).where(eq(users.userId, f.owner.userId));
      await expect(reviews()).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND' });
      await db.delete(campaigns).where(eq(campaigns.campaignId, campaign.campaignId));
      await db.delete(mediaLibrary).where(eq(mediaLibrary.mediaId, banner.mediaId));
    });
  });
