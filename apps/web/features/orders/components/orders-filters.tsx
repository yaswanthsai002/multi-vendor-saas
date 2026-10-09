'use client';

import { ArrowUpDown, RotateCcw, Search, X } from 'lucide-react';
import * as React from 'react';

import type { OrderSortOption } from '../types/order.types';

interface OrdersFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  dateFrom?: string;
  dateTo?: string;
  onDateChange: (dates: { dateFrom?: string; dateTo?: string }) => void;
  sort: OrderSortOption;
  onSortChange: (sort: OrderSortOption) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const SORT_OPTIONS: Array<{ value: OrderSortOption; label: string }> = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'total_desc', label: 'Highest Amount' },
  { value: 'total_asc', label: 'Lowest Amount' },
];

export function OrdersFilters({
  search,
  onSearchChange,
  dateFrom,
  dateTo,
  onDateChange,
  sort,
  onSortChange,
  onReset,
  hasActiveFilters,
}: OrdersFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px] max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by order #, customer, email..."
          className="w-full pl-9.5 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-surface-raised dark:bg-surface-raised border border-border-default text-text-primary placeholder:text-text-tertiary focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-0.5 rounded-md cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Date & Sort Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Date From */}
        <div className="relative">
          <input
            type="date"
            value={dateFrom || ''}
            onChange={(e) => onDateChange({ dateFrom: e.target.value || undefined, dateTo })}
            aria-label="From Date"
            className="pl-3 pr-2 py-2 rounded-xl text-xs sm:text-sm bg-surface-raised dark:bg-surface-raised border border-border-default text-text-primary focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent cursor-pointer"
          />
        </div>

        <span className="text-text-tertiary text-xs">to</span>

        {/* Date To */}
        <div className="relative">
          <input
            type="date"
            value={dateTo || ''}
            onChange={(e) => onDateChange({ dateFrom, dateTo: e.target.value || undefined })}
            aria-label="To Date"
            className="pl-3 pr-2 py-2 rounded-xl text-xs sm:text-sm bg-surface-raised dark:bg-surface-raised border border-border-default text-text-primary focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent cursor-pointer"
          />
        </div>

        {/* Sort selector */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as OrderSortOption)}
            aria-label="Sort orders"
            className="appearance-none pl-3.5 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-surface-raised dark:bg-surface-raised border border-border-default text-text-primary focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary pointer-events-none" />
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border-default bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
