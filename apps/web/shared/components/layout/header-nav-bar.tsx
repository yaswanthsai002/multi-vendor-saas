'use client';

import Link from 'next/link';

import type { ReactNode } from 'react';

export function HeaderNavBar({ children }: { children?: ReactNode }) {
  return (
    <nav
      aria-label="Shop navigation"
      className="overflow-x-auto border-t border-border-subtle bg-surface/60 no-scrollbar"
    >
      <div className="mx-auto flex h-9 min-w-max items-center gap-5 px-3 text-xs font-medium text-text-secondary sm:h-10 sm:gap-6 sm:px-6 sm:text-sm lg:px-8">
        <Link
          href="/products"
          className="cursor-pointer rounded whitespace-nowrap transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus"
        >
          Shop All
        </Link>
        {children}
        <Link
          href="/products?sortBy=newest"
          className="cursor-pointer rounded whitespace-nowrap transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus"
        >
          New Arrivals
        </Link>
      </div>
    </nav>
  );
}
