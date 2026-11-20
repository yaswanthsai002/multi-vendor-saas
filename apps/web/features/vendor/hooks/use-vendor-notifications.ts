'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

import { ApiError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { notifyNotificationTabs } from '@/lib/vendor-notification-sync';

import {
  deleteNotification,
  fetchNotifications,
  markNotificationRead,
} from '../services/notification.service';

import type { NotificationInbox } from '../schemas/notification.schema';

export function useVendorNotifications(userId: string) {
  const client = useQueryClient();
  const pendingRecovery = useRef<Promise<void> | null>(null);
  const mounted = useRef(true);
  const query = useInfiniteQuery({
    queryKey: queryKeys.vendorNotifications.all(userId),
    initialPageParam: '',
    queryFn: async ({ pageParam, signal }) => {
      const data = await fetchNotifications(pageParam || undefined, signal);
      const previous = client.getQueryData<InfiniteData<NotificationInbox>>(
        queryKeys.vendorNotifications.all(userId),
      );
      if (previous?.pages[0] && previous.pages[0].vendorId !== data.vendorId)
        throw new ApiError(
          409,
          'VENDOR_SCOPE_CHANGED',
          'Vendor access changed. Refreshing notifications.',
        );
      return data;
    },
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
  const scopeChanged =
    query.error instanceof ApiError && query.error.code === 'VENDOR_SCOPE_CHANGED';
  const accessDenied = query.error instanceof ApiError && [401, 403].includes(query.error.status);
  const data = scopeChanged || accessDenied ? undefined : query.data;
  const vendorId = data?.pages[0]?.vendorId;
  const recover = useCallback(() => {
    if (pendingRecovery.current) return pendingRecovery.current;
    const key = queryKeys.vendorNotifications.all(userId);
    const recovery = (async () => {
      await client.cancelQueries({ queryKey: key });
      if (!mounted.current) return;
      client.setQueryData<InfiniteData<NotificationInbox>>(key, (saved) =>
        saved
          ? { pages: saved.pages.slice(0, 1), pageParams: saved.pageParams.slice(0, 1) }
          : saved,
      );
      await client.invalidateQueries({ queryKey: key });
    })().finally(() => {
      pendingRecovery.current = null;
    });
    pendingRecovery.current = recovery;
    return recovery;
  }, [client, userId]);
  useEffect(() => {
    if (scopeChanged)
      void client.resetQueries({ queryKey: queryKeys.vendorNotifications.all(userId) });
  }, [scopeChanged, client, userId]);
  useEffect(() => {
    mounted.current = true;
    const timer = setInterval(() => {
      void recover();
    }, 30000);
    return () => {
      mounted.current = false;
      clearInterval(timer);
      void client.cancelQueries({ queryKey: queryKeys.vendorNotifications.all(userId) });
      client.removeQueries({ queryKey: queryKeys.vendorNotifications.all(userId) });
    };
  }, [client, userId, recover]);
  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'read' | 'delete' }) =>
      action === 'read' ? markNotificationRead(id) : deleteNotification(id),
    onMutate: () => client.cancelQueries({ queryKey: queryKeys.vendorNotifications.all(userId) }),
    onSuccess: async () => {
      if (!mounted.current) return;
      if (vendorId) notifyNotificationTabs(vendorId);
      await recover();
    },
  });
  return {
    query,
    mutation,
    recover,
    vendorId,
    unreadCount: data?.pages[0]?.unreadCount,
    items: data?.pages.flatMap((page) => page.items) ?? [],
  };
}
