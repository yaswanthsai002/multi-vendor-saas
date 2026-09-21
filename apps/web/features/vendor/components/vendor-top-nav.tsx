'use client';

import { Bell, ChevronDown, LogOut, Settings, Store, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { ThemeToggle } from '@/shared/components/layout/theme-toggle';
import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

interface VendorTopNavProps {
  storeName?: string;
  avatarUrl?: string | null;
}

export function VendorTopNav({
  storeName = 'Aura Boutique',
  avatarUrl,
}: VendorTopNavProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignout = async () => {
    try {
      setIsSigningOut(true);
      await makeApiRequest({
        url: API_ENDPOINTS.auth.signout,
        method: 'POST',
      });
      router.push('/signin');
      router.refresh();
    } catch {
      setIsSigningOut(false);
    }
  };

  const initial = storeName.charAt(0).toUpperCase();

  return (
    <header className="h-16 w-full px-6 lg:px-8 border-b border-border-default bg-surface dark:bg-surface-subtle flex items-center justify-end gap-4 transition-colors duration-200">
      {/* Theme toggle */}
      <ThemeToggle />

      {/* Notification Bell */}
      <button
        type="button"
        aria-label="Notifications"
        className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
      </button>

      {/* Vendor Profile Dropdown */}
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-2.5 p-1 rounded-full hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus transition-all cursor-pointer"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          {avatarUrl ? (
            <div className="h-8 w-8 rounded-full overflow-hidden border border-border-default">
              <Image
                src={avatarUrl}
                alt={storeName}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-surface-subtle border border-border-default flex items-center justify-center text-xs font-bold text-text-primary">
              {initial}
            </div>
          )}
          <span className="text-sm font-semibold text-text-primary hidden sm:inline-block">
            {storeName}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-text-tertiary hidden sm:inline-block" />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-raised border border-border-default shadow-lg py-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100"
          >
            <div className="px-4 py-2 border-b border-border-subtle">
              <p className="text-xs font-semibold text-text-primary truncate">{storeName}</p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent-subtle text-accent mt-0.5">
                Vendor
              </span>
            </div>

            <Link
              href="/vendor/settings/profile"
              onClick={() => setMenuOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <User className="h-4 w-4 text-text-tertiary" />
              <span>Store Profile</span>
            </Link>

            <Link
              href="/vendor/settings/marketplace"
              onClick={() => setMenuOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <Store className="h-4 w-4 text-text-tertiary" />
              <span>Marketplace Settings</span>
            </Link>

            <div className="border-t border-border-subtle pt-1 mt-1">
              <button
                type="button"
                onClick={handleSignout}
                disabled={isSigningOut}
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-danger hover:bg-danger-subtle transition-colors cursor-pointer disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
