'use client';

import {
  Home,
  Image as ImageIcon,
  LogOut,
  Package,
  ShoppingCart,
  Store,
  UploadCloud,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}

function NavItem({ href, label, icon: Icon, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-120 ease-in-out ${
        active
          ? 'text-text-primary font-semibold bg-surface-subtle/80 dark:bg-surface-hover before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-accent before:rounded-r'
          : 'text-text-tertiary hover:text-text-primary hover:bg-surface-hover'
      }`}
    >
      <Icon
        className={`h-4 w-4 shrink-0 transition-colors ${
          active ? 'text-accent' : 'text-text-tertiary'
        }`}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

// ponytail: vendor sidebar styled to match admin sidebar; removed premature standalone reviews view
export function VendorSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await makeApiRequest({
        url: API_ENDPOINTS.auth.signout,
        method: 'POST',
      });
      router.push('/signin');
      router.refresh();
    } catch {
      router.push('/signin');
    }
  };

  const isDashboard = pathname === '/vendor' || pathname === '/vendor/';
  const isBulkUpload = pathname.startsWith('/vendor/products/bulk-upload');
  const isProducts = pathname.startsWith('/vendor/products') && !isBulkUpload;
  const isMedia = pathname.startsWith('/vendor/media');
  const isOrders = pathname.startsWith('/vendor/orders');
  const isProfile = pathname.startsWith('/vendor/profile');

  return (
    <aside className="w-60 shrink-0 border-r border-border-default bg-surface dark:bg-surface-subtle min-h-screen flex flex-col transition-colors duration-200 select-none">
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

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* OVERVIEW */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
            Overview
          </div>
          <div className="space-y-1">
            <NavItem href="/vendor" label="Dashboard" icon={Home} active={isDashboard} />
          </div>
        </div>

        {/* CATALOG */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
            Catalog
          </div>
          <div className="space-y-1">
            <NavItem href="/vendor/products" label="Products" icon={Package} active={isProducts} />
            <NavItem
              href="/vendor/products/bulk-upload"
              label="Bulk Upload"
              icon={UploadCloud}
              active={isBulkUpload}
            />
            <NavItem href="/vendor/media" label="Media Library" icon={ImageIcon} active={isMedia} />
          </div>
        </div>

        {/* FULFILLMENT */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
            Fulfillment
          </div>
          <div className="space-y-1">
            <NavItem href="/vendor/orders" label="Orders" icon={ShoppingCart} active={isOrders} />
          </div>
        </div>
      </nav>

      {/* Fixed Bottom Section */}
      <div className="p-3 border-t border-border-default shrink-0 space-y-1 bg-surface dark:bg-surface-subtle">
        <NavItem href="/vendor/profile" label="Store Profile" icon={Store} active={isProfile} />
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger-subtle/50 rounded-lg transition-colors cursor-pointer text-left"
        >
          <LogOut className="h-4 w-4 shrink-0 text-text-tertiary hover:text-danger" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
