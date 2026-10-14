'use client';

import {
  Home,
  Layers,
  LogOut,
  Package,
  ShieldCheck,
  ShoppingCart,
  Store,
  Tag,
  User,
  Users,
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

export function AdminSidebar() {
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

  const isDashboard = pathname === '/admin' || pathname === '/admin/';
  const isProducts = pathname.startsWith('/admin/products');
  const isCategories = pathname.startsWith('/admin/categories');
  const isMerchandising = pathname.startsWith('/admin/merchandising');
  const isOrders = pathname.startsWith('/admin/orders');
  const isVendors = pathname.startsWith('/admin/vendors');
  const isCustomers = pathname.startsWith('/admin/customers');
  const isAdmins = pathname.startsWith('/admin/admins');
  const isProfile = pathname.startsWith('/admin/profile');

  return (
    <aside className="w-60 shrink-0 border-r border-border-default bg-surface dark:bg-surface-subtle min-h-screen flex flex-col transition-colors duration-200 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-border-default shrink-0">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-md"
          aria-label="Perigee Admin Console"
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
            <NavItem href="/admin" label="Dashboard" icon={Home} active={isDashboard} />
          </div>
        </div>

        {/* MARKETPLACE */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
            Marketplace
          </div>
          <div className="space-y-1">
            <NavItem href="/admin/products" label="Products" icon={Package} active={isProducts} />
            <NavItem
              href="/admin/categories"
              label="Categories"
              icon={Layers}
              active={isCategories}
            />
            <NavItem
              href="/admin/merchandising"
              label="Merchandising"
              icon={Tag}
              active={isMerchandising}
            />
          </div>
        </div>

        {/* OPERATIONS */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
            Operations
          </div>
          <div className="space-y-1">
            <NavItem href="/admin/orders" label="Orders" icon={ShoppingCart} active={isOrders} />
          </div>
        </div>

        {/* USERS */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
            Users
          </div>
          <div className="space-y-1">
            <NavItem href="/admin/vendors" label="Vendors" icon={Store} active={isVendors} />
            <NavItem href="/admin/customers" label="Customers" icon={Users} active={isCustomers} />
            <NavItem href="/admin/admins" label="Admins" icon={ShieldCheck} active={isAdmins} />
          </div>
        </div>
      </nav>

      {/* Fixed Bottom Section */}
      <div className="p-3 border-t border-border-default shrink-0 space-y-1 bg-surface dark:bg-surface-subtle">
        <NavItem href="/admin/profile" label="Admin Profile" icon={User} active={isProfile} />
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
