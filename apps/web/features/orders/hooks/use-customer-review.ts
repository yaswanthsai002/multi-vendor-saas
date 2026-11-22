'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';

import { fetchCustomerOrder } from '../services/customer-order.service';
import { deleteCustomerReview, saveCustomerReview } from '../services/customer-review.service';

import type { SaveCustomerReviewInput } from '../schemas/customer-review.schema';
import type { CustomerOrderDetail, CustomerReviewState } from '../types/customer-order.types';

type ReviewWrite =
  | { action: 'save'; input: SaveCustomerReviewInput }
  | { action: 'delete'; expectedVersion: number };
type ReviewResult =
  | { kind: 'saved'; state: CustomerReviewState }
  | { kind: 'conflict'; current: CustomerReviewState }
  | { kind: 'reload-failed' };

export function useCustomerReview(userId: string | number, orderId: string, orderItemId: string) {
  const client = useQueryClient();
  const key = queryKeys.customerOrders.detail(userId, orderId);
  async function reload() {
    await client.cancelQueries({ queryKey: key });
    const order = await client.query({
      queryKey: key,
      queryFn: ({ signal }) => fetchCustomerOrder(orderId, signal),
      staleTime: 0,
      retry: false,
    });
    const current = order.items.find((item) => item.orderItemId === orderItemId);
    if (!current) throw new Error('Order item is unavailable.');
    return current;
  }
  const mutation = useMutation({
    retry: false,
    mutationFn: async (write: ReviewWrite): Promise<ReviewResult> => {
      try {
        const state =
          write.action === 'save'
            ? await saveCustomerReview(orderId, orderItemId, write.input)
            : await deleteCustomerReview(orderId, orderItemId, write.expectedVersion);
        return { kind: 'saved', state };
      } catch (error) {
        if (!(error instanceof ApiError) || error.code !== 'REVIEW_VERSION_CONFLICT') throw error;
        try {
          return { kind: 'conflict', current: await reload() };
        } catch {
          return { kind: 'reload-failed' };
        }
      }
    },
    onSuccess: async (result) => {
      if (result.kind !== 'saved') return;
      await client.cancelQueries({ queryKey: key });
      client.setQueryData<CustomerOrderDetail>(key, (order) =>
        order
          ? {
              ...order,
              items: order.items.map((item) =>
                item.orderItemId === orderItemId ? { ...item, ...result.state } : item,
              ),
            }
          : order,
      );
      void client.invalidateQueries({ queryKey: key });
      void client.invalidateQueries({ queryKey: queryKeys.catalog.all() });
      void client.invalidateQueries({ queryKey: queryKeys.merchandising.homepage() });
    },
  });
  return { ...mutation, reload };
}
