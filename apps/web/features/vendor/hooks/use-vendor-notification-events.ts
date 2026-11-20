'use client';

import { type InfiniteData, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { env } from '@/lib/env';
import { queryKeys } from '@/lib/query-keys';
import { NOTIFICATION_CHANNEL, NOTIFICATION_CHANGED_EVENT } from '@/lib/vendor-notification-sync';

import { notificationDescription } from '../lib/notification-copy';
import {
  notificationEventSchema,
  notificationRefreshSchema,
  notificationTabMessageSchema,
} from '../schemas/notification.schema';

import type { NotificationInbox } from '../schemas/notification.schema';

export function useVendorNotificationEvents(
  vendorId: string | undefined,
  recover: () => Promise<void>,
  read: (id: string) => void,
  userId: string,
) {
  const client = useQueryClient();
  const router = useRouter();
  const [connection, setConnection] = useState<{ vendorId?: string; available: boolean }>({
    available: false,
  });
  useEffect(() => {
    const focus = () => {
      if (document.visibilityState !== 'hidden') void recover();
    };
    const changed = () => {
      void recover();
    };
    window.addEventListener(NOTIFICATION_CHANGED_EVENT, changed);
    window.addEventListener('focus', focus);
    document.addEventListener('visibilitychange', focus);
    return () => {
      window.removeEventListener(NOTIFICATION_CHANGED_EVENT, changed);
      window.removeEventListener('focus', focus);
      document.removeEventListener('visibilitychange', focus);
    };
  }, [recover]);
  useEffect(() => {
    if (!vendorId) return;
    let disposed = false;
    let source: EventSource | undefined;
    let channel: BroadcastChannel | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const seen = new Set<string>();
    let latest: ReturnType<typeof notificationEventSchema.parse> | undefined;
    let burstCount = 0;
    const refresh = () => {
      if (disposed) return;
      const recovery = recover();
      void client.invalidateQueries({ queryKey: queryKeys.orders.all() });
      void client.invalidateQueries({ queryKey: queryKeys.vendorDashboard.all() });
      return recovery;
    };
    const notification = (message: MessageEvent<string>) => {
      if (disposed) return;
      try {
        const result = notificationEventSchema.safeParse(JSON.parse(message.data));
        if (!result.success) return;
        const event = result.data;
        if (!seen.has(event.notificationId)) {
          seen.add(event.notificationId);
          if (seen.size > 100) {
            const first = seen.values().next().value;
            if (first) seen.delete(first);
          }
          latest = event;
          burstCount++;
        }
        if (!timer)
          timer = setTimeout(() => {
            timer = undefined;
            const recovery = refresh();
            const target = latest;
            const count = burstCount;
            if (target)
              void (async () => {
                await recovery;
                if (disposed) return;
                const inbox = client.getQueryData<InfiniteData<NotificationInbox>>(
                  queryKeys.vendorNotifications.all(userId),
                );
                const saved = inbox?.pages
                  .flatMap((page) => page.items)
                  .find((item) => item.notificationId === target.notificationId);
                toast(
                  count > 1
                    ? `${count} order updates received`
                    : target.type === 'new_order'
                      ? 'New order ready to prepare'
                      : 'Customer cancelled an order',
                  {
                    description: saved
                      ? notificationDescription(saved.summary)
                      : target.type === 'new_order'
                        ? 'Review the items and start preparing your order'
                        : 'Review the updated order before you continue',
                    duration: 8000,
                    action: {
                      label: count > 1 ? 'View latest order' : 'View order',
                      onClick: () => {
                        read(target.notificationId);
                        router.push(`/vendor/orders/${target.vendorOrderId}`);
                      },
                    },
                  },
                );
              })();
            burstCount = 0;
            latest = undefined;
          }, 150);
      } catch {
        /* Ignore malformed live data. Saved state remains available. */
      }
    };
    const ready = (message: MessageEvent<string>) => {
      if (disposed) return;
      try {
        if (notificationRefreshSchema.safeParse(JSON.parse(message.data)).success) {
          setConnection({ vendorId, available: true });
          refresh();
        }
      } catch {
        /* Ignore malformed frames. */
      }
    };
    try {
      if (typeof EventSource !== 'undefined') {
        source = new EventSource(
          `${env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''}${API_ENDPOINTS.vendor.notifications.events}`,
          { withCredentials: true },
        );
        source.addEventListener('notification', notification);
        source.addEventListener('ready', ready);
        source.addEventListener('refresh', ready);
        source.onerror = () => {
          if (!disposed) setConnection({ vendorId, available: false });
        };
      }
    } catch {
      /* Periodic fetching remains available if SSE cannot open. */
    }
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel(NOTIFICATION_CHANNEL);
        channel.onmessage = ({ data }: MessageEvent<unknown>) => {
          const result = notificationTabMessageSchema.safeParse(data);
          if (result.success && result.data.vendorId === vendorId && !disposed) void recover();
        };
      }
    } catch {
      /* Periodic fetching remains available if a transport cannot open. */
    }
    return () => {
      disposed = true;
      clearTimeout(timer);
      source?.close();
      channel?.close();
      seen.clear();
      burstCount = 0;
      latest = undefined;
    };
  }, [vendorId, recover, read, client, router, userId]);
  return connection.vendorId === vendorId && connection.available;
}
