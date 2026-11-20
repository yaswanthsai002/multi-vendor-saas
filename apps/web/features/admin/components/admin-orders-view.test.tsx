import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { AdminOrdersView } from './admin-orders-view';

const { result, push, refetch } = vi.hoisted(() => ({
  result: vi.fn(),
  push: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock('../hooks/use-admin', () => ({ useAdminOrders: result }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const data = {
  orders: [
    {
      orderId: 'order',
      orderNumber: 'PG-reference',
      status: 'confirmed',
      createdAt: '2026-11-20T00:00:00Z',
      customer: { name: 'Customer', email: 'customer@example.com' },
      summary: {
        total: '200.20',
        itemCount: 2,
        vendorCount: 1,
        cancelledVendorCount: 0,
        previews: [
          { name: 'Desk lamp', quantity: 2, imageUrl: '/assets/images/auth/signup-hero.jpg' },
        ],
      },
    },
  ],
  pagination: { page: 1, limit: 20, total: 55, totalPages: 3 },
};
beforeEach(() => {
  vi.clearAllMocks();
  result.mockReturnValue({ data, isPending: false, isFetching: false, isError: false });
});
afterEach(cleanup);

it('uses server result counts, previews, links, and pagination', async () => {
  render(<AdminOrdersView query={{ page: 1, status: 'all', search: '' }} />);
  expect(screen.getByText('55 orders')).toBeDefined();
  expect(screen.getByText('Desk lamp')).toBeDefined();
  expect(screen.getByRole('img', { name: 'Desk lamp' })).toBeDefined();
  expect(screen.getByRole('link', { name: 'View order PG-reference' }).getAttribute('href')).toBe(
    '/admin/orders/order',
  );
  expect(screen.queryByText('Pending Routing')).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(push).toHaveBeenCalledWith('/admin/orders?page=2');
});

it('submits search and uses actual order states', async () => {
  render(<AdminOrdersView query={{ page: 1, status: 'all', search: '' }} />);
  await userEvent.type(screen.getByLabelText('Order or customer'), 'Lamp');
  await userEvent.click(screen.getByRole('button', { name: /^Search$/ }));
  expect(push).toHaveBeenCalledWith('/admin/orders?search=Lamp');
  await userEvent.click(screen.getByRole('combobox', { name: 'Order status' }));
  await userEvent.click(await screen.findByRole('option', { name: 'In progress' }));
  expect(push).toHaveBeenCalledWith('/admin/orders?status=confirmed');
  expect(screen.queryByRole('option', { name: 'Shipped' })).toBeNull();
});

it('shows request failures and supports retry without an empty-state claim', async () => {
  result.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: true,
    isFetching: false,
    refetch,
  });
  render(<AdminOrdersView query={{ page: 1, status: 'all', search: '' }} />);
  expect(screen.getByRole('alert')).toBeDefined();
  expect(screen.queryByText('No orders found')).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(refetch).toHaveBeenCalledOnce();
});

it('clears active filters from an empty result', async () => {
  result.mockReturnValue({
    data: { ...data, orders: [] },
    isPending: false,
    isFetching: false,
    isError: false,
  });
  render(<AdminOrdersView query={{ page: 1, status: 'cancelled', search: 'Lamp' }} />);
  expect(screen.getByText('No orders found')).toBeDefined();
  await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(push).toHaveBeenCalledWith('/admin/orders');
});
