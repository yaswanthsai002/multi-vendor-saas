'use client';

import { Bell } from 'lucide-react';

import { HeaderUserMenu } from '@/shared/components/layout/header-user-menu';
import { useCurrentUser } from '@/shared/hooks/use-current-user';

export function VendorTopNav() {
  const { data, isLoading } = useCurrentUser();
  const user = data?.user;

  return (
    <header className="h-16 w-full px-6 lg:px-8 border-b border-border-default bg-surface dark:bg-surface-subtle flex items-center justify-end gap-4 transition-colors duration-200">
      {/* Notification Bell */}
      <button
        type="button"
        aria-label="Notifications"
        className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
      </button>

      {/* User Profile Menu (reused from global header layout, includes theme toggle & vendor group) */}
      {isLoading ? (
        <div className="h-9 w-9 rounded-full bg-surface-subtle animate-pulse border border-border-subtle" />
      ) : user ? (
        <HeaderUserMenu user={user} />
      ) : null}
    </header>
  );
}
