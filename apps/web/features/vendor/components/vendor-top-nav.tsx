'use client';

import { HeaderUserMenu } from '@/shared/components/layout/header-user-menu';
import { useCurrentUser } from '@/shared/hooks/use-current-user';

import { VendorNotifications } from './vendor-notifications';

export function VendorTopNav() {
  const { data, isLoading } = useCurrentUser();
  const user = data?.user;

  return (
    <header className="h-16 w-full px-6 lg:px-8 border-b border-border-default bg-surface dark:bg-surface-subtle flex items-center justify-end gap-4 transition-colors duration-200">
      <VendorNotifications />

      {/* User Profile Menu (reused from global header layout, includes theme toggle & vendor group) */}
      {isLoading ? (
        <div className="h-9 w-9 rounded-full bg-surface-subtle animate-pulse border border-border-subtle" />
      ) : user ? (
        <HeaderUserMenu user={user} />
      ) : null}
    </header>
  );
}
