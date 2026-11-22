'use client';

import { Popover } from '@base-ui-components/react/popover';
import { Bell } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/shared/hooks/use-current-user';

import { useVendorNotificationEvents } from '../hooks/use-vendor-notification-events';
import { useVendorNotifications } from '../hooks/use-vendor-notifications';

import { NotificationPanel } from './notification-panel';

export function VendorNotifications() {
  const current = useCurrentUser();
  const userId = current.data?.user?.userId;
  return userId ? (
    <OwnedNotifications key={userId} userId={String(userId)} />
  ) : (
    <Button variant="ghost" size="icon-sm" disabled aria-label="Notifications unavailable">
      <Bell className="h-5 w-5" />
    </Button>
  );
}

function OwnedNotifications({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const { query, mutation, recover, vendorId, unreadCount, items } = useVendorNotifications(userId);
  const { mutateAsync } = mutation;
  const read = useCallback(
    (id: string) => {
      void mutateAsync({ id, action: 'read' }).catch((error: Error) =>
        toast.error(error.message || 'Could not mark the notification as read.'),
      );
    },
    [mutateAsync],
  );
  const view = useCallback(() => {
    setOpen(false);
  }, []);
  const live = useVendorNotificationEvents(vendorId, recover, view, userId);
  return (
    <Popover.Root
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (open) void recover();
      }}
    >
      <Popover.Trigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label={`Notifications${unreadCount === undefined ? ', count unavailable' : `, ${unreadCount} unread`}`}
          />
        }
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount !== undefined && unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-2 -top-2 rounded-full bg-accent px-1.5 text-xs font-semibold text-on-accent"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="end"
          sideOffset={12}
          className="z-50 max-w-full px-3"
        >
          <Popover.Popup className="w-96 max-w-full rounded-xl border border-border-control bg-surface-raised shadow-xl outline-none">
            <NotificationPanel
              items={items}
              loading={query.isPending}
              error={query.isError || mutation.isError}
              pending={mutation.isPending}
              hasOlder={Boolean(query.hasNextPage)}
              loadingOlder={query.isFetchingNextPage}
              onRetry={() => {
                mutation.reset();
                void recover();
              }}
              onRead={read}
              onView={view}
              onDelete={async (id) => {
                try {
                  await mutateAsync({ id, action: 'delete' });
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : 'Could not delete the notification.',
                  );
                  throw error;
                }
              }}
              onOlder={() => {
                void query.fetchNextPage();
              }}
              live={live}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
