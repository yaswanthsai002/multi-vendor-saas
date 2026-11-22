import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';

import { fetchCustomerOrder } from '../services/customer-order.service';
import { deleteCustomerReview, saveCustomerReview } from '../services/customer-review.service';

import { CustomerOrderItems } from './customer-order-items';
import { CustomerOrderReview } from './customer-order-review';

import type { CustomerOrderDetail, CustomerReviewState } from '../types/customer-order.types';

const { success } = vi.hoisted(() => ({ success: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success } }));
vi.mock('../services/customer-order.service', () => ({ fetchCustomerOrder: vi.fn() }));
vi.mock('../services/customer-review.service', () => ({
  saveCustomerReview: vi.fn(),
  deleteCustomerReview: vi.fn(),
}));
const savedReview: NonNullable<CustomerReviewState['review']> = {
  reviewId: 'review',
  rating: 3,
  reviewText: 'Saved feedback',
  createdAt: '2026-11-22T10:00:00Z',
  updatedAt: '2026-11-22T10:00:00Z',
};
function order(state: Partial<CustomerReviewState> = {}): CustomerOrderDetail {
  return {
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
        orderItemId: 'item',
        reviewVersion: 0,
        review: null,
        canReview: true,
        ...state,
        productId: 'product',
        productSlug: 'lamp',
        name: 'Lamp',
        imageUrl: null,
        quantity: 3,
        unitPrice: '10.00',
        subtotal: '30.00',
        status: 'completed',
      },
    ],
  };
}
function mount(state: Partial<CustomerReviewState> = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const initial = order(state);
  function Content() {
    const query = useQuery({
      queryKey: queryKeys.customerOrders.detail('user', 'order'),
      queryFn: () => fetchCustomerOrder('order'),
      initialData: initial,
      staleTime: Infinity,
    });
    return (
      <CustomerOrderItems
        items={query.data.items}
        renderReview={() => (
          <CustomerOrderReview userId="user" orderId="order" item={query.data.items[0]} />
        )}
      />
    );
  }
  vi.mocked(fetchCustomerOrder).mockResolvedValue(initial);
  return {
    ...render(
      <QueryClientProvider client={client}>
        <Content />
      </QueryClientProvider>,
    ),
    client,
  };
}
beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);

describe('inline purchase review', () => {
  it('hides submission for ineligible items', () => {
    mount({ canReview: false });
    expect(screen.queryByRole('button', { name: 'Submit a Review' })).toBeNull();
  });
  it('requires stars, keeps product links outside the form and cancels without a write', async () => {
    const user = userEvent.setup();
    mount();
    await user.click(screen.getByRole('button', { name: 'Submit a Review' }));
    const text = screen.getByRole('textbox', { name: /Your review/ });
    expect(text.closest('a')).toBeNull();
    expect(screen.getByRole('link', { name: 'View product: Lamp' }).getAttribute('href')).toBe(
      '/products/lamp',
    );
    await user.click(screen.getByRole('button', { name: 'Save review' }));
    expect(await screen.findByText('Select a rating from 1 to 5 stars.')).toBeDefined();
    await user.type(text, 'Unsubmitted draft');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(saveCustomerReview).not.toHaveBeenCalled();
  });
  it('supports keyboard rating selection and rating-only submission', async () => {
    const user = userEvent.setup();
    mount();
    vi.mocked(saveCustomerReview).mockResolvedValue({
      orderItemId: 'item',
      reviewVersion: 1,
      canReview: true,
      review: { ...savedReview, rating: 2, reviewText: null },
    });
    await user.click(screen.getByRole('button', { name: 'Submit a Review' }));
    screen.getByRole('radio', { name: '1 star' }).focus();
    await user.keyboard('[Space][ArrowRight]');
    expect(screen.getByRole('radio', { name: '2 stars' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'Save review' }));
    await waitFor(() =>
      expect(saveCustomerReview).toHaveBeenCalledWith('order', 'item', {
        expectedVersion: 0,
        rating: 2,
        reviewText: null,
      }),
    );
    expect(success).toHaveBeenCalledWith('Review saved.');
  });
  it('prefills an edit, permits text clearing and deletes the current review', async () => {
    const user = userEvent.setup();
    mount({ review: savedReview, reviewVersion: 1 });
    vi.mocked(saveCustomerReview).mockResolvedValue({
      orderItemId: 'item',
      reviewVersion: 2,
      canReview: true,
      review: { ...savedReview, reviewText: null },
    });
    vi.mocked(deleteCustomerReview).mockResolvedValue({
      orderItemId: 'item',
      reviewVersion: 2,
      canReview: true,
      review: null,
    });
    await user.click(screen.getByRole('button', { name: 'Edit review' }));
    expect(screen.getByRole('textbox')).toHaveProperty('value', 'Saved feedback');
    await user.clear(screen.getByRole('textbox'));
    await user.click(screen.getByRole('button', { name: 'Save review' }));
    await waitFor(() =>
      expect(saveCustomerReview).toHaveBeenCalledWith('order', 'item', {
        expectedVersion: 1,
        rating: 3,
        reviewText: null,
      }),
    );
    await user.click(await screen.findByRole('button', { name: 'Delete review' }));
    await waitFor(() => expect(deleteCustomerReview).toHaveBeenCalledWith('order', 'item', 1));
  });
  it('disables repeated writes while pending and keeps the draft after a network failure', async () => {
    const user = userEvent.setup();
    mount();
    let reject: (reason: Error) => void = () => {};
    vi.mocked(saveCustomerReview).mockReturnValue(
      new Promise((_resolve, fail) => {
        reject = fail;
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Submit a Review' }));
    await user.click(screen.getByRole('radio', { name: '5 stars' }));
    await user.type(screen.getByRole('textbox'), 'My draft');
    await user.click(screen.getByRole('button', { name: 'Save review' }));
    expect(screen.getByRole('button', { name: 'Save review' })).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveProperty('disabled', true);
    await act(async () => reject(new ApiError(0, 'NETWORK_ERROR', 'Offline')));
    expect(await screen.findByText('Could not save your changes. Please try again.')).toBeDefined();
    expect(screen.getByRole('textbox')).toHaveProperty('value', 'My draft');
    expect(saveCustomerReview).toHaveBeenCalledTimes(1);
    expect(success).not.toHaveBeenCalled();
  });
  it('preserves input on conflict and waits for a deliberate resubmission', async () => {
    const user = userEvent.setup();
    mount();
    vi.mocked(saveCustomerReview)
      .mockRejectedValueOnce(new ApiError(409, 'REVIEW_VERSION_CONFLICT', 'Changed'))
      .mockResolvedValueOnce({
        orderItemId: 'item',
        reviewVersion: 3,
        canReview: true,
        review: { ...savedReview, rating: 5, reviewText: 'My draft' },
      });
    vi.mocked(fetchCustomerOrder).mockResolvedValue(
      order({ reviewVersion: 2, review: savedReview }),
    );
    await user.click(screen.getByRole('button', { name: 'Submit a Review' }));
    await user.click(screen.getByRole('radio', { name: '5 stars' }));
    await user.type(screen.getByRole('textbox'), 'My draft');
    await user.click(screen.getByRole('button', { name: 'Save review' }));
    expect(await screen.findByText('Saved feedback')).toBeDefined();
    expect(screen.getByRole('textbox')).toHaveProperty('value', 'My draft');
    expect(saveCustomerReview).toHaveBeenCalledTimes(1);
    expect(success).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Save my changes' }));
    await waitFor(() =>
      expect(saveCustomerReview).toHaveBeenLastCalledWith('order', 'item', {
        expectedVersion: 2,
        rating: 5,
        reviewText: 'My draft',
      }),
    );
  });
  it('keeps input and blocks save after failed conflict refresh until reload succeeds', async () => {
    const user = userEvent.setup();
    mount();
    vi.mocked(saveCustomerReview).mockRejectedValue(
      new ApiError(409, 'REVIEW_VERSION_CONFLICT', 'Changed'),
    );
    vi.mocked(fetchCustomerOrder)
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValue(order({ reviewVersion: 2, review: savedReview }));
    await user.click(screen.getByRole('button', { name: 'Submit a Review' }));
    await user.click(screen.getByRole('radio', { name: '4 stars' }));
    await user.type(screen.getByRole('textbox'), 'Keep this draft');
    await user.click(screen.getByRole('button', { name: 'Save review' }));
    const reload = await screen.findByRole('button', { name: 'Reload saved review' });
    expect(screen.getByRole('button', { name: 'Save review' })).toHaveProperty('disabled', true);
    expect(screen.getByRole('textbox')).toHaveProperty('value', 'Keep this draft');
    await user.click(reload);
    expect(await screen.findByRole('button', { name: 'Save my changes' })).toHaveProperty(
      'disabled',
      false,
    );
    expect(screen.getByRole('textbox')).toHaveProperty('value', 'Keep this draft');
    expect(saveCustomerReview).toHaveBeenCalledTimes(1);
  });
});
