'use client';

import { Bell } from 'lucide-react';
import * as React from 'react';

import { HeaderUserMenu } from '@/shared/components/layout/header-user-menu';
import { useCurrentUser } from '@/shared/hooks/use-current-user';

export function AdminTopNav() {
  const { data, isLoading } = useCurrentUser();
  const user = data?.user;

  return (
    <header className="h-16 w-full px-6 lg:px-8 border-b border-border-default bg-surface flex items-center justify-end gap-4 transition-colors duration-150 sticky top-0 z-20">
      {/* Right Utility Area */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Notification Bell with Badge */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <Bell className="h-5 w-5 stroke-[1.75]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
        </button>

        {/* User Profile Menu */}
        {isLoading ? (
          <div className="h-9 w-9 rounded-full bg-surface-subtle animate-pulse border border-border-subtle shrink-0" />
        ) : user ? (
          <div className="shrink-0">
            <HeaderUserMenu user={user} />
          </div>
        ) : null}
      </div>
    </header>
  );
}
