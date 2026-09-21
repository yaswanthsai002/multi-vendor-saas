'use client';

import {
  ChevronDown,
  ChevronRight,
  FolderKanban,
  Home,
  Image as ImageIcon,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

interface NavGroupProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function NavGroup({ label, icon: Icon, isOpen, onToggle, children }: NavGroupProps) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 shrink-0 text-text-tertiary" />
          <span>{label}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
        )}
      </button>
      {isOpen && <div className="flex flex-col pl-4 mt-0.5 space-y-0.5">{children}</div>}
    </div>
  );
}

export function VendorSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [productsOpen, setProductsOpen] = React.useState(true);
  const [ordersOpen, setOrdersOpen] = React.useState(true);
  const [settingsOpen, setSettingsOpen] = React.useState(true);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

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

  const isOverview = pathname === '/vendor' || pathname === '/vendor/';

  return (
    <aside className="w-60 shrink-0 border-r border-border-default bg-surface dark:bg-surface-subtle min-h-screen flex flex-col transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-border-default shrink-0">
        <Link
          href="/vendor"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-md"
          aria-label="Perigee Vendor Portal"
        >
          <Image
            src="/assets/perigee-primary-light.svg"
            alt="Perigee"
            width={120}
            height={30}
            priority
            className="block dark:hidden h-7 w-auto"
          />
          <Image
            src="/assets/perigee-primary-dark.svg"
            alt="Perigee"
            width={120}
            height={30}
            priority
            className="hidden dark:block h-7 w-auto"
          />
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Overview link */}
        <Link
          href="/vendor"
          className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            isOverview
              ? 'bg-secondary-accent/15 text-secondary-accent font-semibold dark:bg-secondary-accent/25 dark:text-atmospheric-blue-200'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
          }`}
        >
          <Home className={`h-4 w-4 shrink-0 ${isOverview ? 'text-secondary-accent' : 'text-text-tertiary'}`} />
          <span>Overview</span>
        </Link>

        {/* Products Group */}
        <NavGroup
          label="Products"
          icon={Package}
          isOpen={productsOpen}
          onToggle={() => setProductsOpen((prev) => !prev)}
        >
          <Link
            href="/vendor/products"
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              pathname === '/vendor/products'
                ? 'text-secondary-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            All Products
          </Link>
          <Link
            href="/vendor/products/bulk-upload"
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              pathname === '/vendor/products/bulk-upload'
                ? 'text-secondary-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            Bulk Upload
          </Link>
        </NavGroup>

        {/* Orders Group */}
        <NavGroup
          label="Orders"
          icon={ShoppingCart}
          isOpen={ordersOpen}
          onToggle={() => setOrdersOpen((prev) => !prev)}
        >
          <Link
            href="/vendor/orders"
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              pathname === '/vendor/orders'
                ? 'text-secondary-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            All Orders
          </Link>
          <Link
            href="/vendor/orders/reviews"
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              pathname === '/vendor/orders/reviews'
                ? 'text-secondary-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            Order Reviews
          </Link>
        </NavGroup>

        {/* Media Library */}
        <Link
          href="/vendor/media"
          className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            pathname === '/vendor/media'
              ? 'bg-secondary-accent/15 text-secondary-accent font-semibold'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
          }`}
        >
          <ImageIcon className="h-4 w-4 shrink-0 text-text-tertiary" />
          <span>Media Library</span>
        </Link>

        {/* Settings Group */}
        <NavGroup
          label="Settings"
          icon={Settings}
          isOpen={settingsOpen}
          onToggle={() => setSettingsOpen((prev) => !prev)}
        >
          <Link
            href="/vendor/settings/marketplace"
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              pathname === '/vendor/settings/marketplace'
                ? 'text-secondary-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            Marketplace
          </Link>
          <Link
            href="/vendor/settings/profile"
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              pathname === '/vendor/settings/profile'
                ? 'text-secondary-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            Profile
          </Link>
        </NavGroup>

        {/* Logout action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSignout}
            disabled={isSigningOut}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger-subtle rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 shrink-0 text-text-tertiary" />
            <span>{isSigningOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
