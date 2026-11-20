'use client';

import { ArrowUpRight, Check, PackageCheck, PackageX, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';

import { notificationDescription } from '../lib/notification-copy';

import type { VendorNotification } from '../schemas/notification.schema';

export function NotificationPanel({
  items,
  loading,
  error,
  pending,
  hasOlder,
  loadingOlder,
  onRetry,
  onRead,
  onView,
  onDelete,
  onOlder,
  live,
}: {
  items: VendorNotification[];
  loading: boolean;
  error: boolean;
  pending: boolean;
  hasOlder: boolean;
  loadingOlder: boolean;
  onRetry: () => void;
  onRead: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onOlder: () => void;
  live: boolean;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  return (
    <div className="flex max-h-128 flex-col">
      <header className="flex items-center justify-between border-b border-border-default px-5 py-4">
        <h2 ref={heading} tabIndex={-1} className="text-base font-semibold outline-none">
          Notifications
        </h2>
        <span className="flex items-center gap-2 text-xs text-text-secondary">
          <span
            aria-hidden
            className={`h-2 w-2 rounded-full ${live ? 'bg-success' : 'bg-text-tertiary'}`}
          />
          {live ? 'Live' : 'Periodic updates'}
        </span>
      </header>
      <div className="min-h-0 overflow-y-auto">
        {loading && (
          <p role="status" className="px-5 py-8 text-sm text-text-secondary">
            Loading notifications...
          </p>
        )}
        {error && (
          <div role="alert" className="border-b border-border-default px-5 py-4 text-sm">
            <p>Could not refresh notifications. Saved updates may be out of date.</p>
            <Button variant="ghost" size="sm" onClick={onRetry} className="mt-2">
              Try again
            </Button>
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="px-5 py-10 text-center">
            <PackageCheck className="mx-auto mb-3 h-6 w-6 text-text-tertiary" strokeWidth={1.5} />
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="mt-1 text-sm text-text-secondary">
              New orders and cancellations will appear here
            </p>
          </div>
        )}
        <ul className="divide-y divide-border-default">
          {items.map((item) => {
            const Icon = item.type === 'new_order' ? PackageCheck : PackageX;
            return (
              <li
                key={item.notificationId}
                className={`px-5 py-4 ${item.readAt ? '' : 'bg-accent-subtle/40'}`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className="mt-1 h-5 w-5 shrink-0 text-text-secondary"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={`text-sm ${item.readAt ? 'font-medium text-text-secondary' : 'font-semibold text-text-primary'}`}
                      >
                        {item.type === 'new_order'
                          ? 'New order received'
                          : 'Customer cancelled an order'}
                      </p>
                      {!item.readAt && (
                        <span
                          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent"
                          aria-label="Unread"
                        />
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 break-words text-sm leading-relaxed text-text-secondary">
                      {notificationDescription(item.summary)}
                    </p>
                    <time
                      dateTime={item.createdAt}
                      className="mt-2 block text-xs text-text-tertiary"
                    >
                      {new Date(item.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </time>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Link
                        href={`/vendor/orders/${item.vendorOrderId}`}
                        onClick={() => onView(item.notificationId)}
                        onAuxClick={(event) => {
                          if (event.button === 1) onView(item.notificationId);
                        }}
                        className="inline-flex items-center gap-1 text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-border-focus"
                      >
                        View order
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </Link>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Mark as read"
                          aria-label="Mark as read"
                          disabled={Boolean(item.readAt) || pending}
                          onClick={() => onRead(item.notificationId)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Delete notification"
                          aria-label="Delete"
                          disabled={pending}
                          onClick={() => {
                            void onDelete(item.notificationId)
                              .then(() => heading.current?.focus())
                              .catch(() => {});
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {hasOlder && (
          <div className="border-t border-border-default p-3">
            <Button
              className="w-full"
              size="sm"
              variant="ghost"
              disabled={loadingOlder}
              onClick={onOlder}
            >
              {loadingOlder ? 'Loading...' : 'Load older'}
            </Button>
          </div>
        )}
      </div>
      {!live && (
        <p
          role="status"
          className="border-t border-border-default px-5 py-3 text-xs text-text-secondary"
        >
          Live alerts are unavailable. Saved notifications refresh periodically.
        </p>
      )}
    </div>
  );
}
