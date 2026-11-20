'use client';

import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

import type { OrderSortOption } from '../types/order.types';

const SORT_OPTIONS: { value: OrderSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'total_desc', label: 'Highest total' },
  { value: 'total_asc', label: 'Lowest total' },
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
}: {
  search: string;
  onSearchChange: (value: string) => void;
  dateFrom?: string;
  dateTo?: string;
  onDateChange: (value: { dateFrom?: string; dateTo?: string }) => void;
  sort: OrderSortOption;
  onSortChange: (value: OrderSortOption) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="min-w-48 flex-1">
        <label
          htmlFor="vendor-order-search"
          className="mb-2 block text-xs font-medium text-text-secondary"
        >
          Search orders
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-tertiary" />
          <Input
            id="vendor-order-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by order or customer"
            className="pl-9"
          />
        </div>
      </div>
      <div className="grid w-full grid-cols-2 items-end gap-3 sm:flex sm:w-auto">
        <div>
          <label
            htmlFor="vendor-date-from"
            className="mb-2 block text-xs font-medium text-text-secondary"
          >
            From
          </label>
          <Input
            id="vendor-date-from"
            aria-label="From Date"
            type="date"
            value={dateFrom || ''}
            max={dateTo}
            onChange={(event) =>
              onDateChange({ dateFrom: event.target.value || undefined, dateTo })
            }
            className="min-w-0 cursor-pointer"
          />
        </div>
        <div>
          <label
            htmlFor="vendor-date-to"
            className="mb-2 block text-xs font-medium text-text-secondary"
          >
            To
          </label>
          <Input
            id="vendor-date-to"
            aria-label="To Date"
            type="date"
            value={dateTo || ''}
            min={dateFrom}
            onChange={(event) =>
              onDateChange({ dateFrom, dateTo: event.target.value || undefined })
            }
            className="min-w-0 cursor-pointer"
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-text-secondary">Sort</p>
          <Select
            aria-label="Sort orders"
            value={sort}
            options={SORT_OPTIONS}
            onValueChange={onSortChange}
            triggerClassName="h-10 min-w-36 text-sm"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onReset}>
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
