'use client';

import * as React from 'react';

import { useCurrentUser } from '@/shared/hooks/use-current-user';

export interface UseHeaderOptions {
  initialCartCount?: number;
}

export function useHeader(options?: UseHeaderOptions) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [cartCount, setCartCount] = React.useState(options?.initialCartCount ?? 0);
  const { data, isLoading } = useCurrentUser();

  const user = data?.user ?? null;
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return {
    user,
    displayName,
    avatarInitial,
    isLoading,
    mobileMenuOpen,
    searchQuery,
    setSearchQuery,
    cartCount,
    setCartCount,
    toggleMobileMenu,
    closeMobileMenu,
  };
}
