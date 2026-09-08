'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

export function HeaderNavBar() {
  return (
    <div className="border-t border-border-subtle bg-surface/60 overflow-x-auto no-scrollbar">
      <div className="max-w-11/12 mx-auto px-3 sm:px-6 lg:px-8 h-9 sm:h-10 flex items-center justify-start gap-5 sm:gap-6 text-xs sm:text-sm font-medium text-text-secondary shrink-0 min-w-max">
        {/* Shop Dropdown trigger */}
        <button
          type="button"
          className="flex items-center gap-1 hover:text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus rounded"
        >
          <span>Shop</span>
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        {/* Explore Dropdown trigger */}
        <button
          type="button"
          className="flex items-center gap-1 hover:text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus rounded"
        >
          <span>Explore</span>
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        {/* Categories / Special links */}
        <Link
          href="/brands"
          className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus rounded whitespace-nowrap"
        >
          Brands
        </Link>

        <Link
          href="/new-arrivals"
          className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus rounded whitespace-nowrap"
        >
          New Arrivals
        </Link>

        <Link
          href="/deals"
          className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus rounded whitespace-nowrap"
        >
          Deals
        </Link>
      </div>
    </div>
  );
}
