import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { notifyNotificationTabs } from '@/lib/vendor-notification-sync';

import { markVendorOrderNotificationsRead } from '../services/order.service';

import { useReadOpenedOrderNotifications } from './use-orders';

import type { VendorOrderStatus } from '../types/order.types';

vi.mock('../services/order.service', () => ({ markVendorOrderNotificationsRead: vi.fn() }));
vi.mock('@/lib/vendor-notification-sync', () => ({ notifyNotificationTabs: vi.fn() }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('marks read only after successful loading and again when a new order state is displayed', async () => {
  vi.mocked(markVendorOrderNotificationsRead).mockResolvedValue({
    vendorId: 'vendor',
    changed: true,
  });
  const client = new QueryClient();
  const initialProps: { status: VendorOrderStatus | undefined } = { status: undefined };
  const { rerender } = renderHook(
    ({ status }) => useReadOpenedOrderNotifications('portion', status),
    {
      initialProps,
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    },
  );
  expect(markVendorOrderNotificationsRead).not.toHaveBeenCalled();
  rerender({ status: 'pending' });
  await waitFor(() => expect(notifyNotificationTabs).toHaveBeenCalledWith('vendor'));
  expect(markVendorOrderNotificationsRead).toHaveBeenCalledWith(
    { vendorOrderId: 'portion', status: 'pending' },
    expect.anything(),
  );
  rerender({ status: 'pending' });
  expect(markVendorOrderNotificationsRead).toHaveBeenCalledTimes(1);
  rerender({ status: 'cancelled' });
  await waitFor(() => expect(markVendorOrderNotificationsRead).toHaveBeenCalledTimes(2));
});

it('does not broadcast when the server makes no change', async () => {
  vi.mocked(markVendorOrderNotificationsRead).mockResolvedValue({
    vendorId: 'vendor',
    changed: false,
  });
  const client = new QueryClient();
  renderHook(() => useReadOpenedOrderNotifications('portion', 'pending'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
  await waitFor(() => expect(markVendorOrderNotificationsRead).toHaveBeenCalledOnce());
  expect(notifyNotificationTabs).not.toHaveBeenCalled();
});
