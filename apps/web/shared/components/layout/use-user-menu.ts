'use client';

import { useCallback, useState, useEffect, useRef } from 'react';

import type { CurrentUserData } from '@/lib/auth/current-user';

import { useSignOut } from '@/shared/hooks/use-sign-out';

export function getPrimaryRoleBadge(roles?: string[]): 'Admin' | 'Vendor' | null {
  if (!roles || roles.length === 0) return null;
  if (roles.includes('admin')) return 'Admin';
  if (roles.includes('vendor')) return 'Vendor';
  return null;
}

export function getDiceBearAvatarUrl(seed: string): string {
  const safeSeed = encodeURIComponent(seed.trim() || 'user');
  return `https://api.dicebear.com/9.x/lorelei/svg?seed=${safeSeed}`;
}

export function useUserMenu(user: CurrentUserData) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayName = user.fullName || user.email.split('@')[0] || 'User';
  const primaryRole = getPrimaryRoleBadge(user.roles);
  const avatarUrl = user.avatarUrl || getDiceBearAvatarUrl(user.fullName || user.email);

  const signoutMutation = useSignOut();

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    clearTimer();
    setIsPinned(false);
    setIsOpen(false);
  }, [clearTimer]);

  const handleMouseEnter = () => {
    clearTimer();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    clearTimer();
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleClick = () => {
    if (isOpen && isPinned) {
      setIsPinned(false);
      setIsOpen(false);
    } else {
      clearTimer();
      setIsOpen(true);
      setIsPinned(true);
    }
  };

  const handleSignout = () => {
    handleClose();
    signoutMutation.mutate();
  };

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleDocumentClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
      clearTimer();
    };
  }, [isOpen, clearTimer, handleClose]);

  return {
    isOpen,
    isPinned,
    menuRef,
    displayName,
    primaryRole,
    avatarUrl,
    isAdmin: user.roles?.includes('admin') ?? false,
    isVendor: user.roles?.includes('vendor') ?? false,
    isSigningOut: signoutMutation.isPending,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleClose,
    handleSignout,
  };
}
