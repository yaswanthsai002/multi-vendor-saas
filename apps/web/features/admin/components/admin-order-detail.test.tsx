import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminOrderDetail } from './admin-order-detail';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('../hooks/use-admin', () => ({ useAdminOrderDetail: query }));
afterEach(cleanup);

describe('administrator order detail', () => {
  it('shows private cancellation evidence under the correct vendor', () => {
    query.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        orderId: 'order',
        orderNumber: 'PG-1',
        summary: {
          total: '300.00',
          itemCount: 3,
          vendorCount: 1,
          cancelledVendorCount: 1,
          previews: [],
        },
        status: 'cancelled',
        createdAt: '2026-11-19T00:00:00Z',
        customer: null,
        deliveryAddress: null,
        fulfillments: [
          {
            vendorOrderId: 'portion',
            vendorName: 'Lamp seller',
            total: '300.00',
            status: 'cancelled',
            completedAt: null,
            cancellation: {
              source: 'vendor',
              reasonCode: 'OTHER',
              reason: 'Seller unable to fulfill these items',
              cancelledAt: '2026-11-19T00:00:00Z',
            },
            cancellationDetails: 'Private audit detail',
            cancelledByUserId: 'actor',
            items: [
              {
                orderItemId: 'item',
                productName: 'Lamp',
                imageUrl: null,
                subtotal: '300.00',
                unitPrice: '100.00',
                quantity: 3,
                cancellationReturnedQuantity: 1,
                cancellationDamagedQuantity: 1,
                cancellationMissingQuantity: 1,
              },
            ],
          },
        ],
      },
    });
    render(<AdminOrderDetail orderId="order" />);
    expect(screen.getByRole('heading', { name: 'Lamp seller' })).toBeDefined();
    expect(screen.getByText('Private audit detail')).toBeDefined();
    const quantities = screen.getByLabelText('Cancellation quantities for Lamp');
    expect(within(quantities).getByText('Returned to stock')).toBeDefined();
    expect(within(quantities).getByText('Damaged')).toBeDefined();
    expect(within(quantities).getAllByText('1')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Back to orders' }).getAttribute('href')).toBe(
      '/admin/orders',
    );
  });
  it('shows loading and provides recovery after a request failure', async () => {
    query.mockReturnValue({ isPending: true });
    const { rerender } = render(<AdminOrderDetail orderId="order" />);
    expect(screen.getByRole('status').textContent).toContain('Loading');
    const refetch = vi.fn();
    query.mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
      error: new Error('Unavailable'),
      refetch,
    });
    rerender(<AdminOrderDetail orderId="order" />);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledOnce();
  });
});
