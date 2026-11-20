import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { VendorOrderDetailView } from './vendor-order-detail-view';

const { mutate, fulfillment } = vi.hoisted(() => ({
  mutate: vi.fn(),
  fulfillment: { status: 'pending', allowedActions: ['process', 'cancel'], cancellation: null },
}));
vi.mock('../hooks/use-orders', () => ({
  useVendorOrderDetail: () => ({
    isPending: false,
    isError: false,
    data: {
      order: { orderNumber: 'PG-12345678-long-reference', placedAt: '2026-11-19T00:00:00Z' },
      fulfillment,
      customer: { name: 'Customer', email: 'customer@example.com', phone: null },
      deliveryAddress: null,
      items: [
        {
          orderItemId: 'item',
          productId: 'product',
          productName: 'Desk lamp',
          quantity: 2,
          unitPrice: '100.00',
          subtotal: '200.00',
          productImageUrl: null,
        },
      ],
      summary: { itemCount: 2, total: '200.00' },
    },
  }),
  useUpdateOrderStatus: () => ({ mutate, isPending: false }),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  fulfillment.status = 'pending';
  fulfillment.allowedActions = ['process', 'cancel'];
});

describe('vendor order actions', () => {
  it('starts processing directly without a confirmation dialog', async () => {
    render(<VendorOrderDetailView vendorOrderId="portion" />);
    await userEvent.click(screen.getByRole('button', { name: 'Start processing' }));
    expect(mutate).toHaveBeenCalledWith(
      { vendorOrderId: 'portion', data: { status: 'processing' } },
      expect.any(Object),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('marks complete directly without a confirmation dialog', async () => {
    fulfillment.status = 'processing';
    fulfillment.allowedActions = ['complete', 'cancel'];
    render(<VendorOrderDetailView vendorOrderId="portion" />);
    await userEvent.click(screen.getByRole('button', { name: 'Mark complete' }));
    expect(mutate).toHaveBeenCalledWith(
      { vendorOrderId: 'portion', data: { status: 'completed' } },
      expect.any(Object),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('opens cancellation review without sending an order action', async () => {
    render(<VendorOrderDetailView vendorOrderId="portion" />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel order' }));
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByLabelText('Cancellation reason')).toBeDefined();
    expect(mutate).not.toHaveBeenCalled();
  });
});
