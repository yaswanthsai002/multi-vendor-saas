import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CustomerOrderFulfillments } from './customer-order-fulfillments';
import { OrderActionDialog } from './order-action-dialog';

const items = [
  {
    orderItemId: 'item',
    productId: 'product',
    productName: 'Desk lamp',
    productImageUrl: null,
    quantity: 2,
    unitPrice: '100.00',
    subtotal: '200.00',
    cancellationQuantities: null,
  },
];
afterEach(cleanup);

describe('fulfillment decisions', () => {
  it('requires an explanation for Other and keeps the form after a failed request', async () => {
    const onConfirm = vi.fn();
    const props = {
      isOpen: true,
      onClose: vi.fn(),
      action: 'cancel' as const,
      onConfirm,
      isLoading: false,
      items,
    };
    const { rerender } = render(<OrderActionDialog {...props} />);
    await userEvent.click(screen.getByRole('combobox', { name: 'Cancellation reason' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Other reason' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel order' }));
    expect(await screen.findByText('Explain the other reason for administrators.')).toBeDefined();
    expect(onConfirm).not.toHaveBeenCalled();
    const details = screen.getByLabelText('Additional details for administrators');
    await userEvent.type(details, 'Private explanation');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel order' }));
    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          cancellationReasonCode: 'OTHER',
          cancellationDetails: 'Private explanation',
        }),
      ),
    );
    rerender(<OrderActionDialog {...props} isLoading />);
    expect(screen.getByRole('button', { name: 'Saving...' })).toHaveProperty('disabled', true);
    rerender(<OrderActionDialog {...props} />);
    expect(screen.getByLabelText('Additional details for administrators')).toHaveProperty(
      'value',
      'Private explanation',
    );
  });
  it('rejects damaged and missing quantities above the ordered quantity', async () => {
    const onConfirm = vi.fn();
    render(
      <OrderActionDialog
        isOpen
        onClose={vi.fn()}
        action="cancel"
        onConfirm={onConfirm}
        isLoading={false}
        items={items}
      />,
    );
    const damaged = screen.getByLabelText('Damaged or unsuitable units');
    const missing = screen.getByLabelText('Missing units');
    await userEvent.clear(damaged);
    await userEvent.type(damaged, '2');
    await userEvent.clear(missing);
    await userEvent.type(missing, '1');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel order' }));
    expect(
      await screen.findByText('Damaged and missing units cannot exceed the ordered quantity.'),
    ).toBeDefined();
    expect(onConfirm).not.toHaveBeenCalled();
  });
  it('associates public seller updates with their items and identifies seller completion', () => {
    render(
      <CustomerOrderFulfillments
        fulfillments={[
          {
            vendorName: 'Lamp seller',
            status: 'completed',
            orderItemIds: ['item'],
            completedAt: '2026-11-19T00:00:00Z',
            completionSource: 'seller',
            cancellation: null,
          },
          {
            vendorName: 'Other seller',
            status: 'cancelled',
            orderItemIds: ['other'],
            completedAt: null,
            completionSource: null,
            cancellation: {
              source: 'vendor',
              reasonCode: 'OTHER',
              reason: 'Seller unable to fulfill these items',
              cancelledAt: '2026-11-19T00:00:00Z',
            },
          },
        ]}
        items={[
          {
            ...items[0],
            productSlug: 'desk-lamp',
            imageUrl: null,
            name: 'Desk lamp',
            status: 'completed',
          },
        ]}
      />,
    );
    expect(screen.getByText('Desk lamp - Quantity: 2')).toBeDefined();
    expect(screen.getByText(/Marked complete by the seller/)).toBeDefined();
    expect(screen.getByText(/Seller unable to fulfill these items/)).toBeDefined();
  });
});
