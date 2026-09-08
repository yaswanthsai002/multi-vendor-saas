'use client';

import { LogOut, Settings, ShieldCheck, Store } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { ThemeToggle } from './theme-toggle';
import { useUserMenu } from './use-user-menu';

import type { CurrentUserData } from '@/shared/hooks/use-current-user';

export function HeaderUserMenu({ user }: { user: CurrentUserData }) {
  const {
    isOpen,
    menuRef,
    displayName,
    primaryRole,
    avatarUrl,
    isAdmin,
    isVendor,
    isSigningOut,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleClose,
    handleSignout,
  } = useUserMenu(user);

  return (
    <div
      ref={menuRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar Trigger Button */}
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center justify-center h-9 w-9 rounded-full border border-border-default bg-surface overflow-hidden hover:ring-2 hover:ring-accent/40 focus-visible:ring-2 focus-visible:ring-border-focus transition-all duration-150 cursor-pointer select-none"
        aria-label={`User menu for ${displayName}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Image
          src={avatarUrl}
          alt={displayName}
          width={36}
          height={36}
          className="h-full w-full object-cover bg-surface-subtle"
          unoptimized={avatarUrl.startsWith('https://api.dicebear.com')}
        />
      </button>

      {/* Dropdown Menu Container */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-label="User Account Menu"
          className="absolute right-0 mt-2 w-64 rounded-xl bg-surface-raised border border-border-default shadow-lg py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {/* Menu Header with hierarchy: Name -> Email -> Role badge */}
          <div className="px-4 py-2.5 border-b border-border-subtle">
            <p className="text-sm font-semibold text-text-primary truncate">{displayName}</p>
            <p className="text-xs text-text-tertiary truncate">{user.email}</p>
            {primaryRole && (
              <div className="mt-1.5 flex items-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-accent-subtle text-accent border border-accent/20">
                  {primaryRole}
                </span>
              </div>
            )}
          </div>

          {/* Core Menu Links & Features */}
          <div className="py-1.5">
            {/* Theme Toggle row */}
            <div className="flex items-center justify-between px-4 py-2 text-sm text-text-secondary">
              <span className="font-medium">Theme</span>
              <ThemeToggle />
            </div>

            {/* Settings link */}
            <Link
              href="/settings"
              onClick={handleClose}
              role="menuitem"
              className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <Settings className="h-4 w-4 text-text-tertiary shrink-0" aria-hidden="true" />
              <span>Settings</span>
            </Link>

            {/* Admin Dashboard link (conditional) */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={handleClose}
                role="menuitem"
                className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {/* Vendor Dashboard link (conditional) */}
            {isVendor && (
              <Link
                href="/vendor"
                onClick={handleClose}
                role="menuitem"
                className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              >
                <Store className="h-4 w-4 text-secondary-accent shrink-0" aria-hidden="true" />
                <span>Vendor Dashboard</span>
              </Link>
            )}
          </div>

          {/* Signout action */}
          <div className="border-t border-border-subtle pt-1.5">
            <button
              type="button"
              onClick={handleSignout}
              disabled={isSigningOut}
              role="menuitem"
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-danger hover:bg-danger-subtle hover:text-danger transition-colors cursor-pointer disabled:opacity-50"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
