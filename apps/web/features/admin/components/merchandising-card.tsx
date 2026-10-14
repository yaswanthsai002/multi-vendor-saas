import { ArrowRight, Sparkles, Tag, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

interface MerchandisingCardProps {
  featuredProducts?: number;
  featuredBrands?: number;
  activeDeals?: number;
}

export function MerchandisingCard({
  featuredProducts = 0,
  featuredBrands = 0,
  activeDeals = 0,
}: MerchandisingCardProps) {
  return (
    <div className="bg-surface border border-border-default rounded-xl p-6 flex flex-col transition-colors duration-150 shadow-xs h-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Tag className="h-4 w-4 text-text-secondary stroke-[1.75]" />
          <h3 className="text-base font-semibold text-text-primary tracking-tight">
            Merchandising
          </h3>
        </div>
        <p className="text-xs text-text-tertiary">Active campaigns & featured assets</p>
      </div>

      {/* Stats Counter Rows */}
      <div className="space-y-2.5 my-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle/60 border border-border-subtle">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-text-secondary">Featured Products</span>
          </div>
          <span className="font-mono font-bold text-text-primary text-sm tabular-nums">
            {featuredProducts}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle/60 border border-border-subtle">
          <div className="flex items-center gap-2.5">
            <Tag className="h-4 w-4 text-secondary-accent" />
            <span className="text-xs font-medium text-text-secondary">Featured Brands</span>
          </div>
          <span className="font-mono font-bold text-text-primary text-sm tabular-nums">
            {featuredBrands}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle/60 border border-border-subtle">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-text-secondary">Active Deals</span>
          </div>
          <span className="font-mono font-bold text-text-primary text-sm tabular-nums">
            {activeDeals}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 mt-auto">
        <Link
          href="/admin/merchandising"
          className="flex items-center justify-center gap-1.5 w-full h-10 px-4 rounded-lg bg-surface-subtle hover:bg-surface-hover text-xs sm:text-sm font-semibold text-text-primary border border-border-default hover:border-border-strong transition-colors duration-150 shadow-xs"
        >
          <span>Manage Merchandising</span>
          <ArrowRight className="h-4 w-4 text-text-tertiary" />
        </Link>
      </div>
    </div>
  );
}
