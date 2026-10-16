'use client';

import { Filter, RotateCcw, X } from 'lucide-react';
import * as React from 'react';

import { CatalogCategoryTree } from './catalog-category-tree';

import type { CatalogCategory, CatalogFilters as FilterValues } from '../types/catalog.types';

import { Button } from '@/components/ui/button';

interface CatalogFiltersProps {
  categories: CatalogCategory[];
  filters: FilterValues;
  priceRange?: { min: number; max: number };
  onFilterChange: (updates: Partial<FilterValues>) => void;
  onResetFilters: () => void;
  isMobileModal?: boolean;
  onCloseMobileModal?: () => void;
}

const PRICE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: 'Under ₹500', min: undefined, max: 500 },
  { label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 – ₹2,500', min: 1000, max: 2500 },
  { label: '₹2,500 – ₹5,000', min: 2500, max: 5000 },
  { label: 'Over ₹5,000', min: 5000, max: undefined },
];

export function CatalogFilters({
  categories,
  filters,
  onFilterChange,
  onResetFilters,
  isMobileModal = false,
  onCloseMobileModal,
}: CatalogFiltersProps) {
  const [minPriceInput, setMinPriceInput] = React.useState(
    filters.minPrice !== undefined ? String(filters.minPrice) : '',
  );
  const [maxPriceInput, setMaxPriceInput] = React.useState(
    filters.maxPrice !== undefined ? String(filters.maxPrice) : '',
  );

  // ponytail: adjust local input state during render when prop filters change (React standard)
  const [prevMinProp, setPrevMinProp] = React.useState(filters.minPrice);
  const [prevMaxProp, setPrevMaxProp] = React.useState(filters.maxPrice);

  if (filters.minPrice !== prevMinProp) {
    setPrevMinProp(filters.minPrice);
    setMinPriceInput(filters.minPrice !== undefined ? String(filters.minPrice) : '');
  }

  if (filters.maxPrice !== prevMaxProp) {
    setPrevMaxProp(filters.maxPrice);
    setMaxPriceInput(filters.maxPrice !== undefined ? String(filters.maxPrice) : '');
  }

  // ponytail: auto-apply custom price inputs after 1000ms delay without needing a Go button
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const min = minPriceInput.trim() ? Number(minPriceInput) : undefined;
      const max = maxPriceInput.trim() ? Number(maxPriceInput) : undefined;
      const validMin = min !== undefined && !isNaN(min) && min >= 0 ? min : undefined;
      const validMax = max !== undefined && !isNaN(max) && max >= 0 ? max : undefined;

      if (validMin !== filters.minPrice || validMax !== filters.maxPrice) {
        onFilterChange({
          minPrice: validMin,
          maxPrice: validMax,
          page: 1,
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [minPriceInput, maxPriceInput, filters.minPrice, filters.maxPrice, onFilterChange]);

  const handleSelectPreset = (preset: { min?: number; max?: number }) => {
    const isPresetActive = filters.minPrice === preset.min && filters.maxPrice === preset.max;
    if (isPresetActive) {
      onFilterChange({
        minPrice: undefined,
        maxPrice: undefined,
        page: 1,
      });
    } else {
      onFilterChange({
        minPrice: preset.min,
        maxPrice: preset.max,
        page: 1,
      });
    }
  };

  const selectedCategories = React.useMemo(() => {
    if (!filters.category) return [];
    if (Array.isArray(filters.category)) return filters.category;
    return filters.category
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [filters.category]);

  const handleToggleCategory = (slug: string) => {
    let next: string[];
    if (selectedCategories.includes(slug)) {
      next = selectedCategories.filter((s) => s !== slug);
    } else {
      next = [...selectedCategories, slug];
    }
    onFilterChange({
      category: next.length > 0 ? next : undefined,
      page: 1,
    });
  };

  const handleClearCategories = () => {
    onFilterChange({
      category: undefined,
      page: 1,
    });
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    Boolean(filters.inStock) ||
    Boolean(filters.isFeatured) ||
    Boolean(filters.search);

  return (
    <div className={`flex flex-col gap-6 ${isMobileModal ? 'p-4' : 'w-full'}`}>
      {/* Header (with reset & close on mobile) */}
      <div className="flex items-center justify-between pb-3 border-b border-border-default">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-secondary" />
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">Filters</h2>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}

          {isMobileModal && (
            <button
              type="button"
              onClick={onCloseMobileModal}
              className="p-1 text-text-secondary hover:text-text-primary rounded-md cursor-pointer"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Hierarchical Categories Filter */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          Categories
        </h3>
        <CatalogCategoryTree
          categories={categories}
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
          onClearCategories={handleClearCategories}
        />
      </div>

      {/* Modern E-Commerce Price Filter */}
      <div className="flex flex-col gap-3 pt-4 border-t border-border-subtle">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Price</h3>

        {/* Radio Button Price Range Presets */}
        <div className="flex flex-col gap-0.5">
          {PRICE_PRESETS.map((preset) => {
            const isPresetActive =
              filters.minPrice === preset.min && filters.maxPrice === preset.max;

            return (
              <label
                key={preset.label}
                className={`group flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs font-medium cursor-pointer select-none transition-colors ${
                  isPresetActive
                    ? 'bg-accent/10 text-accent font-semibold'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <input
                  type="radio"
                  name="catalog-price-preset"
                  checked={isPresetActive}
                  onClick={() => handleSelectPreset(preset)}
                  onChange={() => {}}
                  aria-label={preset.label}
                  className="h-3.5 w-3.5 border-border-default text-accent focus:ring-border-focus cursor-pointer shrink-0"
                />
                <span>{preset.label}</span>
              </label>
            );
          })}
        </div>

        {/* Custom Price Range (debounced auto-apply with 1000ms delay) */}
        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-text-tertiary">
              ₹
            </span>
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              aria-label="Minimum price"
              className="h-8 w-full rounded-md border border-border-default bg-surface pl-6 pr-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus"
            />
          </div>
          <span className="text-xs text-text-tertiary">—</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-text-tertiary">
              ₹
            </span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              aria-label="Maximum price"
              className="h-8 w-full rounded-md border border-border-default bg-surface pl-6 pr-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus"
            />
          </div>
        </div>
      </div>

      {/* Availability & Attributes */}
      <div className="flex flex-col gap-3 pt-4 border-t border-border-subtle">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          Availability
        </h3>

        {/* In Stock Only */}
        <label className="flex items-center gap-2.5 text-xs font-medium text-text-primary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(filters.inStock)}
            onChange={(e) =>
              onFilterChange({ inStock: e.target.checked ? true : undefined, page: 1 })
            }
            className="h-3.5 w-3.5 rounded border-border-default text-accent focus:ring-border-focus cursor-pointer"
          />
          <span>In Stock Only</span>
        </label>

        {/* Featured Only */}
        <label className="flex items-center gap-2.5 text-xs font-medium text-text-primary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(filters.isFeatured)}
            onChange={(e) =>
              onFilterChange({ isFeatured: e.target.checked ? true : undefined, page: 1 })
            }
            className="h-3.5 w-3.5 rounded border-border-default text-accent focus:ring-border-focus cursor-pointer"
          />
          <span>Featured Products Only</span>
        </label>
      </div>

      {isMobileModal && (
        <div className="mt-auto pt-4 border-t border-border-default">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onCloseMobileModal}
            className="w-full text-xs font-bold cursor-pointer"
          >
            Show Results
          </Button>
        </div>
      )}
    </div>
  );
}
