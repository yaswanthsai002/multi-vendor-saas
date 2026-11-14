import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as service from '../services/customer-order.service';

import { CheckoutReviewPage } from './checkout-review';
import { CustomerOrderDetail } from './customer-order-detail';
import { CustomerOrderProgress } from './customer-order-progress';
import { CustomerOrdersView } from './customer-orders-view';

import type { CustomerOrderQuery } from '../schemas/customer-order-filters.schema';
import type { CheckoutReview, CustomerOrder } from '../types/customer-order.types';

import { ApiError } from '@/lib/api-client';

const { replace, push, toast, toastError, toastInfo, auth } = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  toast: vi.fn(),
  toastError: vi.fn(),
  toastInfo: vi.fn(),
  auth: {
    data: { user: { userId: '11111111-1111-4111-8111-111111111111' } },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, push }) }));
vi.mock('@/shared/hooks/use-current-user', () => ({ useCurrentUser: () => auth }));
vi.mock('../services/customer-order.service', () => ({
  fetchCheckoutReview: vi.fn(),
  placeCustomerOrder: vi.fn(),
  fetchCustomerOrders: vi.fn(),
  fetchCustomerOrder: vi.fn(),
  cancelCustomerOrder: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { success: toast, error: toastError, info: toastInfo } }));
const userId = '11111111-1111-4111-8111-111111111111';
const productId = '22222222-2222-4222-8222-222222222222';
const addressId = '33333333-3333-4333-8333-333333333333';
const orderId = '44444444-4444-4444-8444-444444444444';
const storageKey = `perigee.checkout.${userId}`;
const review: CheckoutReview = {
  lines: [
    {
      productId,
      name: 'Desk lamp',
      imageUrl: '/assets/images/auth/signup-hero.jpg',
      quantity: 2,
      stock: 5,
      unitPrice: '100.10',
      subtotal: '200.20',
      available: true,
    },
  ],
  addresses: [
    {
      addressId,
      recipientName: 'Customer',
      phone: '9876543210',
      addressLine1: 'Street 1',
      addressLine2: null,
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500001',
      country: 'IN',
      isDefault: true,
    },
  ],
  addressId,
  addressEligible: true,
  total: '200.20',
};
const order: CustomerOrder = {
  orderId,
  orderNumber: 'PG-order',
  placedAt: '2026-11-13T10:00:00Z',
  status: 'Order placed',
  total: '200.20',
  canCancel: true,
  address: review.addresses[0],
  items: [
    {
      orderItemId: orderId,
      productSlug: 'desk-lamp',
      imageUrl: '/assets/images/auth/signup-hero.jpg',
      productId,
      name: 'Desk lamp',
      quantity: 2,
      unitPrice: '100.10',
      subtotal: '200.20',
      status: 'pending',
    },
  ],
};

function mount(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const result = render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
  return { ...result, client };
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  vi.mocked(service.fetchCheckoutReview).mockResolvedValue(review);
  vi.mocked(service.placeCustomerOrder).mockResolvedValue(order);
  vi.mocked(service.fetchCustomerOrder).mockResolvedValue(order);
  vi.mocked(service.fetchCustomerOrders).mockResolvedValue({
    items: [order],
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
  });
  vi.mocked(service.cancelCustomerOrder).mockResolvedValue({
    ...order,
    status: 'Cancelled',
    canCancel: false,
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('customer checkout', () => {
  it('replaces a failed thumbnail with an accessible fallback', async () => {
    mount(<CheckoutReviewPage />);
    const image = await screen.findByRole('img', { name: 'Desk lamp' });
    fireEvent.error(image);
    expect(screen.getByRole('img', { name: 'No image available for Desk lamp' })).toBeDefined();
  });
  it('retries server failure with the same Place order action and key', async () => {
    vi.mocked(service.placeCustomerOrder)
      .mockRejectedValueOnce(new ApiError(500, 'REQUEST_FAILED', 'Internal failure'))
      .mockResolvedValue(order);
    mount(<CheckoutReviewPage />);
    await screen.findByText('Desk lamp');
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        'Something went wrong. Please try again.',
        expect.anything(),
      ),
    );
    expect(screen.queryByText('Internal failure')).toBeNull();
    expect(screen.queryByText(/Abandon saved attempt/)).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await waitFor(() => expect(replace).toHaveBeenCalled());
    expect(vi.mocked(service.placeCustomerOrder).mock.calls[1][0]).toEqual(
      vi.mocked(service.placeCustomerOrder).mock.calls[0][0],
    );
  });

  it('shows missing-image fallback and blocks unavailable items', async () => {
    vi.mocked(service.fetchCheckoutReview).mockResolvedValue({
      ...review,
      lines: [{ ...review.lines[0], imageUrl: null, stock: 0, available: false }],
    });
    mount(<CheckoutReviewPage />);
    expect(
      await screen.findByRole('img', { name: 'No image available for Desk lamp' }),
    ).toBeDefined();
    expect(screen.getByText(/Only 0 available/)).toBeDefined();
    expect(screen.getByRole('button', { name: 'Place order' })).toHaveProperty('disabled', true);
  });
  it('shows readable address options and changes address using keyboard', async () => {
    const next = {
      ...review.addresses[0],
      addressId: orderId,
      recipientName: 'Work address',
      addressLine1: 'A long office address that must wrap within the dropdown',
      isDefault: false,
    };
    vi.mocked(service.fetchCheckoutReview).mockResolvedValue({
      ...review,
      addresses: [...review.addresses, next],
    });
    mount(<CheckoutReviewPage />);
    const select = await screen.findByRole('combobox', { name: 'Delivery address' });
    await userEvent.click(select);
    expect(await screen.findByRole('option', { name: /Work address/ })).toBeDefined();
    await userEvent.keyboard('{End}{Enter}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(screen.getByText(next.addressLine1, { selector: 'address p' })).toBeDefined();
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await waitFor(() => expect(service.placeCustomerOrder).toHaveBeenCalled());
    expect(vi.mocked(service.placeCustomerOrder).mock.calls[0][0].request.addressId).toBe(orderId);
  });

  it('retries a saved attempt through Place order even when cart review fails', async () => {
    const saved = {
      key: orderId,
      request: { addressId, lines: [{ productId, quantity: 2, expectedUnitPrice: '100.10' }] },
    };
    localStorage.setItem(storageKey, JSON.stringify(saved));
    vi.mocked(service.fetchCheckoutReview).mockRejectedValue(new Error('Offline'));
    mount(<CheckoutReviewPage />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Place order' })).toHaveProperty('disabled', false),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await waitFor(() => expect(replace).toHaveBeenCalled());
    expect(vi.mocked(service.placeCustomerOrder).mock.calls[0][0]).toEqual(saved);
  });

  it('shows current prices, address and total, persists request before sending and confirms', async () => {
    vi.mocked(service.placeCustomerOrder).mockImplementation(async (pending) => {
      expect(JSON.parse(localStorage.getItem(storageKey) ?? 'null')).toEqual(pending);
      return order;
    });
    mount(<CheckoutReviewPage />);
    expect(await screen.findByText('Desk lamp')).toBeDefined();
    expect(screen.getByRole('img', { name: 'Desk lamp' })).toBeDefined();
    expect(screen.getByText('Quantity')).toBeDefined();
    expect(screen.getByText('Unit price')).toBeDefined();
    expect(screen.getAllByText(/200[.]20/)).toHaveLength(3);
    expect(screen.getByRole('combobox', { name: 'Delivery address' })).toBeDefined();
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith(`/orders/${orderId}?confirmed=1`));
    expect(localStorage.getItem(storageKey)).toBeNull();
    expect(service.placeCustomerOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        request: { addressId, lines: [{ productId, quantity: 2, expectedUnitPrice: '100.10' }] },
      }),
      expect.anything(),
    );
  });

  it('disables duplicate submission until response arrives', async () => {
    let finish!: (value: CustomerOrder) => void;
    vi.mocked(service.placeCustomerOrder).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    mount(<CheckoutReviewPage />);
    await screen.findByText('Desk lamp');
    await userEvent.dblClick(screen.getByRole('button', { name: 'Place order' }));
    expect(screen.getByRole('button', { name: 'Placing order...' })).toHaveProperty(
      'disabled',
      true,
    );
    expect(service.placeCustomerOrder).toHaveBeenCalledTimes(1);
    await act(async () => finish(order));
  });

  it('keeps exact request after network failure and browser remount, retries same key', async () => {
    vi.mocked(service.placeCustomerOrder)
      .mockRejectedValueOnce(new ApiError(0, 'NETWORK_ERROR', 'Offline'))
      .mockResolvedValue(order);
    const mounted = mount(<CheckoutReviewPage />);
    await screen.findByText('Desk lamp');
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        'Something went wrong. Please try again.',
        expect.anything(),
      ),
    );
    expect(screen.queryByRole('button', { name: 'Retry saved order' })).toBeNull();
    expect(screen.queryByText(/Saved request:/)).toBeNull();
    const saved = localStorage.getItem(storageKey);
    expect(saved).not.toBeNull();
    mounted.unmount();
    mount(<CheckoutReviewPage />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Place order' })).toHaveProperty('disabled', false),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await waitFor(() => expect(replace).toHaveBeenCalled());
    expect(vi.mocked(service.placeCustomerOrder).mock.calls[0][0]).toEqual(
      vi.mocked(service.placeCustomerOrder).mock.calls[1][0],
    );
  });

  it('refreshes conflict values, highlights affected lines, requires review before a new key', async () => {
    vi.mocked(service.placeCustomerOrder)
      .mockRejectedValueOnce(
        new ApiError(409, 'CHECKOUT_CONFLICT', 'Price changed.', {
          lines: [{ productId, stock: 5, unitPrice: '101.00', available: true }],
        }),
      )
      .mockResolvedValue(order);
    vi.mocked(service.fetchCheckoutReview)
      .mockResolvedValueOnce(review)
      .mockResolvedValue({
        ...review,
        lines: [{ ...review.lines[0], unitPrice: '101.00', subtotal: '202.00' }],
        total: '202.00',
      });
    mount(<CheckoutReviewPage />);
    await screen.findByText('Desk lamp');
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('Price changed.', expect.anything()),
    );
    expect(await screen.findByText(/Price or availability changed/)).toBeDefined();
    const first = vi.mocked(service.placeCustomerOrder).mock.calls[0][0];
    expect(screen.queryByRole('button', { name: 'Review updated details' })).toBeNull();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Place order' })).toHaveProperty('disabled', false),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await waitFor(() => expect(service.placeCustomerOrder).toHaveBeenCalledTimes(2));
    const second = vi.mocked(service.placeCustomerOrder).mock.calls[1][0];
    expect(second.key).not.toBe(first.key);
    expect(second.request.lines[0].expectedUnitPrice).toBe('101.00');
  });

  it('shows address rejection beside associated control', async () => {
    vi.mocked(service.placeCustomerOrder).mockRejectedValue(
      new ApiError(422, 'INVALID_DELIVERY_ADDRESS', 'Choose an Indian address.'),
    );
    mount(<CheckoutReviewPage />);
    await screen.findByText('Desk lamp');
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await waitFor(() =>
      expect(
        screen.getByRole('combobox', { name: 'Delivery address' }).getAttribute('aria-describedby'),
      ).toBe('address-error'),
    );
    expect(document.getElementById('address-error')?.textContent).toBe('Choose an Indian address.');
  });

  it('blocks submission when request cannot be persisted', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    mount(<CheckoutReviewPage />);
    await screen.findByText('Desk lamp');
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        'Could not save checkout request. Enable browser storage and try again.',
        expect.anything(),
      ),
    );
    expect(service.placeCustomerOrder).not.toHaveBeenCalled();
  });

  it('shows retry for load failure and keeps empty cart distinct', async () => {
    vi.mocked(service.fetchCheckoutReview)
      .mockRejectedValueOnce(new Error('private transport error'))
      .mockResolvedValue({ ...review, lines: [] });
    mount(<CheckoutReviewPage />);
    expect(await screen.findByText('Could not load checkout. Your cart is saved.')).toBeDefined();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText(/Your cart is empty/)).toBeDefined();
  });

  it('keeps another customer’s pending attempt separate', async () => {
    localStorage.setItem(
      'perigee.checkout.other-user',
      JSON.stringify({ key: orderId, request: { addressId, lines: [] } }),
    );
    mount(<CheckoutReviewPage />);
    await screen.findByText('Desk lamp');
    expect(screen.queryByRole('button', { name: 'Retry saved order' })).toBeNull();
  });

  it('explains checkout line limit before allowing a rejected request', async () => {
    vi.mocked(service.fetchCheckoutReview).mockResolvedValue({
      ...review,
      lines: Array.from({ length: 201 }, () => ({
        ...review.lines[0],
        productId: crypto.randomUUID(),
      })),
    });
    mount(<CheckoutReviewPage />);
    expect(await screen.findByText(/Checkout supports up to 200 different products/)).toBeDefined();
    expect(screen.getByRole('button', { name: 'Place order' })).toHaveProperty('disabled', true);
    expect(service.placeCustomerOrder).not.toHaveBeenCalled();
  });
});

describe('customer order views', () => {
  it('applies status and date filters, resets page, and validates reversed date ranges', async () => {
    mount(<CustomerOrdersView query={{ page: 3 }} />);
    await screen.findByRole('table', { name: 'Your orders' });
    await userEvent.click(screen.getByRole('combobox', { name: 'Order status' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Completed' }));
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-11-20' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-11-01' } });
    await userEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(await screen.findByText('End date must be on or after start date')).toBeDefined();
    expect(push).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-11-30' } });
    await userEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/orders?page=1&status=Completed&orderedFrom=2026-11-20&orderedTo=2026-11-30',
      ),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(push).toHaveBeenLastCalledWith('/orders');
  });
  it('preserves filters across numbered pages and sends them to the server', async () => {
    vi.mocked(service.fetchCustomerOrders).mockResolvedValue({
      items: [order],
      pagination: { page: 2, limit: 20, total: 140, totalPages: 7 },
    });
    const query = {
      page: 2,
      status: 'Completed',
      orderedFrom: '2026-11-01',
      orderedTo: '2026-11-30',
    } satisfies CustomerOrderQuery;
    mount(<CustomerOrdersView query={query} />);
    const next = await screen.findByRole('link', { name: 'Next page' });
    expect(next).toHaveProperty(
      'href',
      'http://localhost:3000/orders?page=3&status=Completed&orderedFrom=2026-11-01&orderedTo=2026-11-30',
    );
    expect(screen.getByRole('link', { name: 'Page 7' })).toHaveProperty(
      'href',
      'http://localhost:3000/orders?page=7&status=Completed&orderedFrom=2026-11-01&orderedTo=2026-11-30',
    );
    expect(screen.getByText(/Showing 21.*40 of 140 orders/)).toBeDefined();
    expect(service.fetchCustomerOrders).toHaveBeenCalledWith(query, expect.any(AbortSignal));
  });
  it('keeps filters available when no orders match', async () => {
    vi.mocked(service.fetchCustomerOrders).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    });
    mount(<CustomerOrdersView query={{ page: 1, status: 'Completed' }} />);
    expect(
      await screen.findByRole('heading', { name: 'No orders match these filters' }),
    ).toBeDefined();
    expect(screen.getByRole('combobox', { name: 'Order status' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Clear filters' })).toHaveProperty(
      'href',
      'http://localhost:3000/orders',
    );
  });
  it.each([
    {
      status: 'Order placed',
      description: 'Your order has been received',
      finished: 1,
      current: 'Order placed',
    },
    {
      status: 'In progress',
      description: 'Your order is being processed',
      finished: 1,
      current: 'In progress',
    },
    {
      status: 'Partially cancelled',
      description: 'Some items have been cancelled. Check each item for its current status.',
      finished: 1,
      current: 'Order placed',
    },
    {
      status: 'Partially fulfilled',
      description: 'Some items are completed. Check each item for its current status.',
      finished: 1,
      current: 'In progress',
    },
    {
      status: 'Completed',
      description: 'All items in this order are completed',
      finished: 3,
      current: 'Completed',
    },
    {
      status: 'Cancelled',
      description: 'All items in this order have been cancelled',
      finished: 1,
      current: 'Cancelled',
    },
  ] satisfies {
    status: CustomerOrder['status'];
    description: string;
    finished: number;
    current: string;
  }[])(
    'shows truthful $status updates without invented shipping events',
    ({ status, description, finished, current }) => {
      render(
        <CustomerOrderProgress status={status} placedAt={order.placedAt} items={order.items} />,
      );
      expect(screen.getByText(description)).toBeDefined();
      expect(screen.getByText(status)).toBeDefined();
      const updates = screen.getByRole('list', { name: 'Order timeline' });
      expect(updates.querySelectorAll('time')).toHaveLength(1);
      expect(updates.querySelector('time')).toHaveProperty('dateTime', order.placedAt);
      expect(updates.querySelector('time')?.textContent).not.toMatch(/\d+:\d+|\b[ap]m\b/i);
      expect(updates.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
      expect(updates.querySelector('[aria-current="step"]')?.textContent).toContain(current);
      expect(screen.getAllByText('Step completed')).toHaveLength(finished);
      expect(screen.getByText('Order placed')).toBeDefined();
      expect(screen.getByText('In progress')).toBeDefined();
      expect(screen.getByText('Completed')).toBeDefined();
      expect(
        screen.queryByText(/Shipped|Out for delivery|Estimated delivery|Download invoice/),
      ).toBeNull();
    },
  );
  it('uses item state to position a partially cancelled order without marking processing complete', () => {
    render(
      <CustomerOrderProgress
        status="Partially cancelled"
        placedAt={order.placedAt}
        items={[
          { ...order.items[0], status: 'processing' },
          { ...order.items[0], orderItemId: 'cancelled', status: 'cancelled' },
        ]}
      />,
    );
    const timeline = screen.getByRole('list', { name: 'Order timeline' });
    expect(timeline.querySelector('[aria-current="step"]')?.textContent).toContain('In progress');
    expect(screen.getAllByText('Step completed')).toHaveLength(1);
    expect(screen.getByText('Not completed')).toBeDefined();
  });
  it('previews products, formats totals and counts remaining quantities in history', async () => {
    vi.mocked(service.fetchCustomerOrders).mockResolvedValue({
      items: [
        {
          ...order,
          items: [
            order.items[0],
            { ...order.items[0], orderItemId: 'second', name: 'Wall clock', quantity: 1 },
            { ...order.items[0], orderItemId: 'third', name: 'Hidden preview', quantity: 4 },
          ],
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    mount(<CustomerOrdersView query={{ page: 1 }} />);
    expect(await screen.findByRole('img', { name: 'Desk lamp' })).toBeDefined();
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Wall clock' })).toBeDefined();
    expect(screen.queryByText('Hidden preview')).toBeNull();
    expect(screen.queryByText('+4 more items')).toBeNull();
    expect(screen.getByText('7 items')).toBeDefined();
    expect(screen.getByText('\u20b9200.20')).toBeDefined();
    expect(screen.getByRole('navigation', { name: 'Order pages' })).toBeDefined();
    expect(
      screen
        .getByRole('region', { name: 'Order results' })
        .contains(screen.getByRole('navigation', { name: 'Order pages' })),
    ).toBe(true);
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveProperty('disabled', true);
  });
  it('shows single-item quantities and a missing lead-photo fallback in history', async () => {
    vi.mocked(service.fetchCustomerOrders).mockResolvedValue({
      items: [{ ...order, items: [{ ...order.items[0], quantity: 1, imageUrl: null }] }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    mount(<CustomerOrdersView query={{ page: 1 }} />);
    expect(
      await screen.findByRole('img', { name: 'No image available for Desk lamp' }),
    ).toBeDefined();
    expect(screen.getByText('1 item')).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Desk lamp' })).toBeDefined();
    expect(screen.getByRole('link', { name: /^View order: Desk lamp/ })).toHaveProperty(
      'href',
      `http://localhost:3000/orders/${orderId}`,
    );
  });
  it('links previous and next history pages and recovers from an empty later page', async () => {
    vi.mocked(service.fetchCustomerOrders).mockResolvedValue({
      items: [order],
      pagination: { page: 2, limit: 20, total: 41, totalPages: 3 },
    });
    const view = mount(<CustomerOrdersView query={{ page: 2 }} />);
    expect(await screen.findByRole('link', { name: 'Previous page' })).toHaveProperty(
      'href',
      'http://localhost:3000/orders?page=1',
    );
    expect(screen.getByRole('link', { name: 'Next page' })).toHaveProperty(
      'href',
      'http://localhost:3000/orders?page=3',
    );
    expect(screen.getByRole('link', { name: 'Page 2' }).getAttribute('aria-current')).toBe('page');
    view.unmount();
    vi.mocked(service.fetchCustomerOrders).mockResolvedValue({
      items: [],
      pagination: { page: 3, limit: 20, total: 1, totalPages: 1 },
    });
    mount(<CustomerOrdersView query={{ page: 3 }} />);
    expect(await screen.findByRole('heading', { name: 'No orders on this page' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Back to latest orders' })).toHaveProperty(
      'href',
      'http://localhost:3000/orders?page=1',
    );
  });
  it('shows order identity, product photo, quantities, formatted prices and address', async () => {
    mount(<CustomerOrderDetail orderId={orderId} />);
    expect(await screen.findByRole('heading', { name: 'Order details' })).toBeDefined();
    expect(screen.getByText('PG-order')).toBeDefined();
    expect(screen.getByRole('link', { name: 'View product: Desk lamp' })).toHaveProperty(
      'href',
      'http://localhost:3000/products/desk-lamp',
    );
    expect(screen.getByRole('img', { name: 'Desk lamp' })).toBeDefined();
    expect(screen.getByText('Quantity')).toBeDefined();
    expect(screen.getByText('Unit price')).toBeDefined();
    expect(screen.getByText('Subtotal')).toBeDefined();
    expect(screen.getByText('₹100.10')).toBeDefined();
    expect(screen.getAllByText('₹200.20')).toHaveLength(2);
    expect(screen.getByText('Street 1')).toBeDefined();
  });
  it('shows unavailable image and address fallbacks without inventing delivery details', async () => {
    vi.mocked(service.fetchCustomerOrder).mockResolvedValue({
      ...order,
      address: null,
      items: [{ ...order.items[0], imageUrl: null, productSlug: null }],
    });
    mount(<CustomerOrderDetail orderId={orderId} />);
    expect(
      await screen.findByRole('img', { name: 'No image available for Desk lamp' }),
    ).toBeDefined();
    expect(screen.getByText('Delivery address unavailable for this order')).toBeDefined();
    expect(screen.queryByRole('link', { name: 'View product: Desk lamp' })).toBeNull();
  });
  it('keeps cancelled orders accurate when opened with an old confirmation URL', async () => {
    vi.mocked(service.fetchCustomerOrder).mockResolvedValue({
      ...order,
      status: 'Cancelled',
      canCancel: false,
      items: [{ ...order.items[0], status: 'cancelled' }],
    });
    mount(<CustomerOrderDetail orderId={orderId} confirmed />);
    expect(await screen.findByRole('heading', { name: 'Order details' })).toBeDefined();
    expect(screen.getAllByText('Cancelled')).toHaveLength(2);
    expect(screen.queryByText('Your order is confirmed')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cancel whole order' })).toBeNull();
  });
  it('shows history, customer status and detail links', async () => {
    mount(<CustomerOrdersView query={{ page: 1 }} />);
    expect(await screen.findByRole('link', { name: /^View order: Desk lamp/ })).toHaveProperty(
      'href',
      `http://localhost:3000/orders/${orderId}`,
    );
    expect(screen.getAllByText('Placed').length).toBeGreaterThan(0);
    expect(screen.queryByText('PG-order')).toBeNull();
  });
  it('shows history empty and page-level errors', async () => {
    vi.mocked(service.fetchCustomerOrders)
      .mockRejectedValueOnce(new Error('private failure'))
      .mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      });
    mount(<CustomerOrdersView query={{ page: 1 }} />);
    expect(await screen.findByText('Could not load your orders. Try again.')).toBeDefined();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('No orders here yet')).toBeDefined();
  });
  it('keeps cancellation dialog open on failure, closes with success toast on retry', async () => {
    vi.mocked(service.cancelCustomerOrder)
      .mockRejectedValueOnce(
        new ApiError(409, 'ORDER_CANNOT_CANCEL', 'Vendor completed this order. Refresh details.'),
      )
      .mockResolvedValue({ ...order, status: 'Cancelled', canCancel: false });
    mount(<CustomerOrderDetail orderId={orderId} confirmed />);
    expect(await screen.findByText('Your order is confirmed')).toBeDefined();
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel whole order' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirm cancellation' }));
    expect(await screen.findByText('Vendor completed this order. Refresh details.')).toBeDefined();
    expect(screen.getByRole('dialog')).toBeDefined();
    await userEvent.click(screen.getByRole('button', { name: 'Confirm cancellation' }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith('Order cancelled.'));
  });
  it('hides cancellation after completion and shows detail error with retry/navigation', async () => {
    vi.mocked(service.fetchCustomerOrder)
      .mockRejectedValueOnce(new ApiError(404, 'ORDER_NOT_FOUND', 'Not found'))
      .mockResolvedValue({ ...order, status: 'Completed', canCancel: false });
    mount(<CustomerOrderDetail orderId={orderId} />);
    expect(await screen.findByText(/Could not load this order/)).toBeDefined();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Completed')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Cancel whole order' })).toBeNull();
  });
});
