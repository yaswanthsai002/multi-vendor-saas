import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/lib/query-keys';

import { useVendorNotificationEvents } from '../hooks/use-vendor-notification-events';
import { useVendorNotifications } from '../hooks/use-vendor-notifications';
import { notificationDescription } from '../lib/notification-copy';
import * as service from '../services/notification.service';

import { NotificationPanel } from './notification-panel';
import { VendorNotifications } from './vendor-notifications';

import type { NotificationInbox } from '../schemas/notification.schema';

const { toast, push } = vi.hoisted(() => ({ toast: vi.fn(), push: vi.fn() }));
const router = { push };
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('sonner', () => ({ toast }));
vi.mock('@/shared/hooks/use-current-user', () => ({
  useCurrentUser: () => ({ data: { user: { userId: 'user' } } }),
}));
vi.mock('../services/notification.service', () => ({
  fetchNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  deleteNotification: vi.fn(),
}));

const vendorId = '11111111-1111-4111-8111-111111111111';
const item = {
  notificationId: '22222222-2222-4222-8222-222222222222',
  vendorOrderId: '33333333-3333-4333-8333-333333333333',
  type: 'new_order' as const,
  orderNumber: 'PG-1',
  summary: { items: [{ name: 'Desk lamp', quantity: 2 }], itemCount: 2, productCount: 1 },
  createdAt: '2026-11-19T00:00:00.000Z',
  readAt: null,
};
const inbox: NotificationInbox = { vendorId, items: [item], unreadCount: 1, nextCursor: 'older' };
const posted = vi.fn();
class Channel {
  static instances: Channel[] = [];
  onmessage: ((message: MessageEvent) => void) | null = null;
  close = vi.fn();
  postMessage = posted;
  constructor() {
    Channel.instances.push(this);
  }
}
class Stream extends EventTarget {
  static instances: Stream[] = [];
  onerror: (() => void) | null = null;
  close = vi.fn();
  constructor() {
    super();
    Stream.instances.push(this);
  }
}
function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}
beforeEach(() => {
  vi.clearAllMocks();
  Channel.instances = [];
  Stream.instances = [];
  vi.stubGlobal('BroadcastChannel', Channel);
  vi.stubGlobal('EventSource', Stream);
  vi.mocked(service.fetchNotifications).mockResolvedValue(inbox);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('notification recovery', () => {
  it('drops older pages and fetches only the newest page during recovery', async () => {
    const { wrapper } = setup();
    vi.mocked(service.fetchNotifications).mockImplementation(async (cursor) =>
      cursor
        ? {
            ...inbox,
            items: [{ ...item, notificationId: '44444444-4444-4444-8444-444444444444' }],
            nextCursor: null,
          }
        : inbox,
    );
    const { result } = renderHook(() => useVendorNotifications('user'), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    await act(async () => {
      await result.current.query.fetchNextPage();
    });
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    vi.mocked(service.fetchNotifications).mockClear();
    await act(async () => {
      await result.current.recover();
    });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(service.fetchNotifications).toHaveBeenCalledTimes(1);
    expect(service.fetchNotifications).toHaveBeenCalledWith(undefined, expect.any(AbortSignal));
  });
  it('broadcasts successful changes, but keeps failed changes out of other tabs', async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useVendorNotifications('user'), { wrapper });
    await waitFor(() => expect(result.current.vendorId).toBe(vendorId));
    await act(async () => {
      await result.current.mutation.mutateAsync({ id: item.notificationId, action: 'read' });
    });
    expect(posted).toHaveBeenCalledWith({ type: 'changed', vendorId });
    posted.mockClear();
    vi.mocked(service.deleteNotification).mockRejectedValueOnce(new Error('Offline'));
    await act(async () => {
      await expect(
        result.current.mutation.mutateAsync({ id: item.notificationId, action: 'delete' }),
      ).rejects.toThrow('Offline');
    });
    expect(posted).not.toHaveBeenCalled();
    expect(result.current.unreadCount).toBe(1);
  });
  it('refreshes on ready and tab changes without turning saved history into toasts', async () => {
    const { client, wrapper } = setup();
    client.setQueryData(queryKeys.vendorNotifications.all('user'), {
      pages: [inbox],
      pageParams: [''],
    });
    const recover = vi.fn().mockResolvedValue(undefined);
    const read = vi.fn();
    const { result, unmount } = renderHook(
      () => useVendorNotificationEvents(vendorId, recover, read, 'user'),
      { wrapper },
    );
    const stream = Stream.instances[0];
    act(() => {
      stream.dispatchEvent(new MessageEvent('ready', { data: '{}' }));
    });
    expect(result.current).toBe(true);
    expect(toast).not.toHaveBeenCalled();
    act(() => {
      Channel.instances[0].onmessage?.(
        new MessageEvent('message', { data: { type: 'changed', vendorId } }),
      );
    });
    expect(recover).toHaveBeenCalledTimes(2);
    act(() => {
      stream.dispatchEvent(
        new MessageEvent('notification', {
          data: JSON.stringify({
            notificationId: item.notificationId,
            vendorOrderId: item.vendorOrderId,
            type: item.type,
          }),
        }),
      );
    });
    await waitFor(() => expect(toast).toHaveBeenCalledTimes(1));
    expect(toast.mock.calls[0][0]).toBe('New order ready to prepare');
    expect(toast.mock.calls[0][1].description).toContain('Desk lamp');
    const action = toast.mock.calls[0][1].action;
    action.onClick();
    expect(read).toHaveBeenCalledWith(item.notificationId);
    expect(push).toHaveBeenCalledWith(`/vendor/orders/${item.vendorOrderId}`);
    unmount();
    expect(stream.close).toHaveBeenCalledOnce();
    expect(Channel.instances[0].close).toHaveBeenCalledOnce();
  });
  it('keeps tab recovery active if SSE cannot open', () => {
    vi.stubGlobal(
      'EventSource',
      class {
        constructor() {
          throw new Error('Unavailable');
        }
      },
    );
    const { wrapper } = setup();
    const recover = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useVendorNotificationEvents(vendorId, recover, vi.fn(), 'user'), { wrapper });
    act(() => {
      Channel.instances[0].onmessage?.(
        new MessageEvent('message', { data: { type: 'changed', vendorId } }),
      );
    });
    expect(recover).toHaveBeenCalledOnce();
  });
});

describe('notification panel', () => {
  it('offers read, delete, navigation, and older records without nested controls', async () => {
    const onRead = vi.fn();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const onOlder = vi.fn();
    render(
      <NotificationPanel
        items={[item]}
        loading={false}
        error={false}
        pending={false}
        hasOlder
        loadingOlder={false}
        onRetry={vi.fn()}
        onRead={onRead}
        onView={onRead}
        onDelete={onDelete}
        onOlder={onOlder}
        live={false}
      />,
    );
    expect(screen.getByRole('link', { name: 'View order' }).getAttribute('href')).toBe(
      `/vendor/orders/${item.vendorOrderId}`,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Mark as read' }));
    expect(onRead).toHaveBeenCalledWith(item.notificationId);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(item.notificationId);
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Notifications' })),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Load older' }));
    expect(onOlder).toHaveBeenCalledOnce();
    expect(screen.getByText(/Live alerts are unavailable/)).toBeDefined();
  });
});

describe('notification navigation', () => {
  it('closes the panel and defers the read until the order loads', async () => {
    const { wrapper } = setup();
    render(<VendorNotifications />, { wrapper });
    await userEvent.click(await screen.findByRole('button', { name: 'Notifications, 1 unread' }));
    const link = await screen.findByRole('link', { name: 'View order' });
    expect(screen.getByText(/Desk lamp/)).toBeDefined();
    expect(screen.queryByText(item.orderNumber)).toBeNull();
    await userEvent.click(link);
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Notifications' })).toBeNull(),
    );
    expect(service.markNotificationRead).not.toHaveBeenCalled();
  });
  it('keeps previews brief when more products exist', () => {
    const text = notificationDescription({
      items: [
        { name: 'Lamp', quantity: 2 },
        { name: 'Clock', quantity: 1 },
      ],
      itemCount: 7,
      productCount: 4,
    });
    expect(text).toContain('Lamp');
    expect(text).toContain('Clock');
    expect(text).toContain('+2 more products');
  });
});
