'use client';

import { ArrowUpDown, SlidersHorizontal, X } from 'lucide-react';

import type { CatalogSortBy } from '../types/catalog.types';

import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

interface ActiveFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface CatalogSortBarProps {
  totalItems: number;
  currentSort: CatalogSortBy;
  onSortChange: (sort: CatalogSortBy) => void;
  activeFilterChips: ActiveFilterChip[];
  onOpenMobileFilters: () => void;
  activeFilterCount: number;
}

const SORT_OPTIONS: { value: CatalogSortBy; label: string }[] = [
  { value: 'featured', label: 'Featured & Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Arrivals' },
];

export function CatalogSortBar({
  totalItems,
  currentSort,
  onSortChange,
  activeFilterChips,
  onOpenMobileFilters,
  activeFilterCount,
}: CatalogSortBarProps) {
  return (
    <div className="flex flex-col gap-3 py-2 mb-4">
      {/* Upper toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Product count */}
        <div className="text-xs sm:text-sm text-text-secondary font-medium">
          <span className="font-bold text-text-primary">{totalItems}</span>{' '}
          {totalItems === 1 ? 'product' : 'products'} found
        </div>

        {/* Right tools: Mobile filter button + Sort dropdown */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Filter Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenMobileFilters}
            className="flex items-center gap-1.5 md:hidden text-xs font-semibold"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-on-accent font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Sort selector with visible label */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
              Sort by:
            </span>
            <Select<CatalogSortBy>
              value={currentSort}
              onValueChange={onSortChange}
              options={SORT_OPTIONS}
              icon={<ArrowUpDown className="h-3.5 w-3.5 text-text-tertiary" />}
              aria-label="Sort products by"
            />
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border-subtle">
          <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
            Active:
          </span>
          {activeFilterChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-surface px-2.5 py-0.5 text-xs font-medium text-text-primary shadow-2xs"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="hover:text-danger-500 rounded-full p-0.5 transition-colors cursor-pointer"
                aria-label={`Remove filter: ${chip.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
