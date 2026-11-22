import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/lib/query-keys';

import { saveCustomerReview } from '../services/customer-review.service';

import { useCustomerReview } from './use-customer-review';

import type { CustomerOrderDetail, CustomerReviewState } from '../types/customer-order.types';

vi.mock('../services/customer-review.service', () => ({
  saveCustomerReview: vi.fn(),
}));
const reviewState: CustomerReviewState = {
  orderItemId: 'item',
  reviewVersion: 1,
  canReview: true,
  review: {
    reviewId: 'review',
    rating: 4,
    reviewText: 'Saved',
    createdAt: '2026-11-22T10:00:00Z',
    updatedAt: '2026-11-22T10:00:00Z',
  },
};
const order: CustomerOrderDetail = {
  orderId: 'order',
  orderNumber: 'PG-1',
  placedAt: '2026-11-22T10:00:00Z',
  status: 'Completed',
  total: '10.00',
  address: null,
  canCancel: false,
  fulfillments: [],
  items: [
    {
      ...reviewState,
      productId: 'product',
      productSlug: 'lamp',
      name: 'Lamp',
      imageUrl: null,
      quantity: 1,
      unitPrice: '10.00',
      subtotal: '10.00',
      status: 'completed',
    },
  ],
};
afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(queryKeys.customerOrders.detail('user', 'order'), order);
  const hook = renderHook(() => useCustomerReview('user', 'order', 'item'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
  return { ...hook, client };
}
describe('review mutation cache and conflicts', () => {
  it('updates only the owner cache and invalidates every review page, catalog and homepage ratings', async () => {
    const { result, client } = mount();
    client.setQueryData(queryKeys.customerOrders.detail('other-user', 'order'), order);
    client.setQueryData(queryKeys.catalog.reviews('lamp'), { pages: [1, 2] });
    client.setQueryData(queryKeys.catalog.list(), {});
    client.setQueryData(queryKeys.merchandising.homepage(), {});
    vi.mocked(saveCustomerReview).mockResolvedValue({ ...reviewState, reviewVersion: 2 });
    await act(async () => {
      await result.current.mutateAsync({
        action: 'save',
        input: { expectedVersion: 1, rating: 4, reviewText: null },
      });
    });
    expect(
      client.getQueryData<CustomerOrderDetail>(queryKeys.customerOrders.detail('user', 'order'))
        ?.items[0].reviewVersion,
    ).toBe(2);
    expect(
      client.getQueryData<CustomerOrderDetail>(
        queryKeys.customerOrders.detail('other-user', 'order'),
      )?.items[0].reviewVersion,
    ).toBe(1);
    for (const key of [
      queryKeys.catalog.reviews('lamp'),
      queryKeys.catalog.list(),
      queryKeys.merchandising.homepage(),
    ])
      expect(client.getQueryState(key)?.isInvalidated).toBe(true);
  });
});
