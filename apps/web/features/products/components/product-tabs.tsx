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
    <div
      role="tablist"
      className="inline-flex items-center gap-1 p-1 rounded-xl bg-surface-subtle dark:bg-surface border border-border-default/60"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-surface-raised dark:bg-surface-raised text-text-primary font-semibold border border-border-default shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
