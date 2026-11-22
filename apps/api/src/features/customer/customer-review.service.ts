import { getDb } from '@repo/db';
import { orderItems, orders, productReviews, vendorOrders } from '@repo/db/schema';
import { and, eq, sql } from 'drizzle-orm';

import { AppError } from '../../shared/errors/AppError.js';
import { lockOrder } from '../../shared/orders/order-lifecycle.js';

import { activeCustomer } from './customer-access.js';

import type { SaveCustomerReviewInput } from './customer-review.schema.js';

const reviewFields = {
  reviewId: productReviews.reviewId,
  rating: productReviews.rating,
  reviewText: productReviews.reviewText,
  createdAt: productReviews.createdAt,
  updatedAt: productReviews.updatedAt,
};

function serializeReview(
  review: Pick<typeof productReviews.$inferSelect, keyof typeof reviewFields> | null,
) {
  return review
    ? {
        ...review,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      }
    : null;
}

export async function readCustomerReviewStates(userId: string, orderId: string) {
  const rows = await getDb()
    .select({
      orderItemId: orderItems.orderItemId,
      reviewVersion: orderItems.reviewVersion,
      status: vendorOrders.status,
      review: reviewFields,
    })
    .from(orderItems)
    .innerJoin(vendorOrders, eq(vendorOrders.vendorOrderId, orderItems.vendorOrderId))
    .innerJoin(orders, eq(orders.orderId, vendorOrders.orderId))
    .leftJoin(productReviews, eq(productReviews.orderItemId, orderItems.orderItemId))
    .where(and(eq(orders.orderId, orderId), eq(orders.userId, userId)));
  return rows.map(({ status, review, ...item }) => ({
    ...item,
    canReview: status === 'completed',
    review: serializeReview(review),
  }));
}

async function writeReview(
  userId: string,
  orderId: string,
  orderItemId: string,
  expectedVersion: number,
  input?: SaveCustomerReviewInput,
) {
  return getDb().transaction(async (tx) => {
    await activeCustomer(tx, userId, true);
    const { portions } = await lockOrder(tx, orderId, userId);
    const [item] = await tx
      .select()
      .from(orderItems)
      .innerJoin(vendorOrders, eq(vendorOrders.vendorOrderId, orderItems.vendorOrderId))
      .where(and(eq(orderItems.orderItemId, orderItemId), eq(vendorOrders.orderId, orderId)))
      .for('update', { of: orderItems })
      .limit(1);
    if (!item) throw new AppError(404, 'ORDER_ITEM_NOT_FOUND', 'Order item not found.');
    const savedItem = item.orderItems;
    if (
      !portions.some(
        (portion) =>
          portion.vendorOrderId === savedItem.vendorOrderId && portion.status === 'completed',
      )
    )
      throw new AppError(
        409,
        'REVIEW_NOT_ELIGIBLE',
        'Reviews are available after the seller completes these items.',
      );
    const [existing] = await tx
      .select(reviewFields)
      .from(productReviews)
      .where(eq(productReviews.orderItemId, orderItemId));
    const state = {
      orderItemId,
      reviewVersion: savedItem.reviewVersion,
      canReview: true,
      review: null,
    };
    if (!input && !existing) return state;
    if (expectedVersion !== savedItem.reviewVersion)
      throw new AppError(
        409,
        'REVIEW_VERSION_CONFLICT',
        'This review changed. Reload it before you save again.',
      );
    if (savedItem.reviewVersion === 2147483647)
      throw new AppError(409, 'REVIEW_VERSION_EXHAUSTED', 'This review cannot be changed further.');
    await tx
      .update(orderItems)
      .set({ reviewVersion: savedItem.reviewVersion + 1 })
      .where(eq(orderItems.orderItemId, orderItemId));
    if (!input) {
      await tx.delete(productReviews).where(eq(productReviews.orderItemId, orderItemId));
      return { ...state, reviewVersion: savedItem.reviewVersion + 1 };
    }
    const [review] = await tx
      .insert(productReviews)
      .values({
        orderItemId,
        userId,
        productId: savedItem.productId,
        rating: input.rating,
        reviewText: input.reviewText,
      })
      .onConflictDoUpdate({
        target: productReviews.orderItemId,
        set: {
          rating: input.rating,
          reviewText: input.reviewText,
          updatedAt: sql`statement_timestamp()`,
        },
      })
      .returning(reviewFields);
    return {
      ...state,
      reviewVersion: savedItem.reviewVersion + 1,
      review: serializeReview(review),
    };
  });
}

export function saveCustomerReview(
  userId: string,
  orderId: string,
  orderItemId: string,
  input: SaveCustomerReviewInput,
) {
  return writeReview(userId, orderId, orderItemId, input.expectedVersion, input);
}

export function deleteCustomerReview(
  userId: string,
  orderId: string,
  orderItemId: string,
  expectedVersion: number,
) {
  return writeReview(userId, orderId, orderItemId, expectedVersion);
}
