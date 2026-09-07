'use client';

import * as React from 'react';

import { useCurrentUser } from '@/shared/hooks/use-current-user';

export function useHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { data, isLoading } = useCurrentUser();

  const user = data?.user ?? null;
  const displayName = user?.fullName || user?.email || 'User';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return {
    user,
    displayName,
    avatarInitial,
    isLoading,
    mobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
  };
}
