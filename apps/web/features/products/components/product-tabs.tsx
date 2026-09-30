'use client';

import * as React from 'react';

import type { ProductTab } from '../types/product.types';

interface ProductTabsProps {
  activeTab: ProductTab;
  onTabChange: (tab: ProductTab) => void;
}

const TABS: Array<{ id: ProductTab; label: string }> = [
  { id: 'all', label: 'All Products' },
  { id: 'published', label: 'Published' },
  { id: 'unpublished', label: 'Unpublished' },
  { id: 'archived', label: 'Archived' },
];

export function ProductTabs({ activeTab, onTabChange }: ProductTabsProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-surface-subtle dark:bg-surface border border-border-default/60">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/80 shadow-2xs dark:bg-atmospheric-blue-950/80 dark:border-atmospheric-blue-800/80 dark:text-atmospheric-blue-200'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
