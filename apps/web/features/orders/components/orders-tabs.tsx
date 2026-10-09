'use client';

import * as React from 'react';

import type { OrderStatusFilter, VendorOrderStatusCounts } from '../types/order.types';

interface OrdersTabsProps {
  activeTab: OrderStatusFilter;
  counts?: VendorOrderStatusCounts;
  onTabChange: (tab: OrderStatusFilter) => void;
}

const TABS: Array<{
  id: OrderStatusFilter;
  label: string;
  countKey: keyof VendorOrderStatusCounts;
}> = [
  { id: 'all', label: 'All Orders', countKey: 'all' },
  { id: 'pending', label: 'Pending', countKey: 'pending' },
  { id: 'processing', label: 'Processing', countKey: 'processing' },
  { id: 'completed', label: 'Completed', countKey: 'completed' },
  { id: 'cancelled', label: 'Cancelled', countKey: 'cancelled' },
];

export function OrdersTabs({ activeTab, counts, onTabChange }: OrdersTabsProps) {
  return (
    <div
      role="tablist"
      className="inline-flex items-center gap-1 p-1 rounded-xl bg-surface-subtle dark:bg-surface border border-border-default/60 overflow-x-auto max-w-full"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts ? counts[tab.countKey] : undefined;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-surface-raised dark:bg-surface-raised text-text-primary font-semibold border border-border-default shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 border border-transparent'
            }`}
          >
            <span>{tab.label}</span>
            {count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] font-semibold ${
                  isActive
                    ? 'bg-accent/10 text-accent dark:bg-accent/20'
                    : 'bg-surface-hover text-text-tertiary'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
