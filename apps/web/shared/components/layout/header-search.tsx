'use client';

import { Search } from 'lucide-react';
import * as React from 'react';

interface HeaderSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  placeholder?: string;
}

export function HeaderSearch({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search products, brands & categories...',
}: HeaderSearchProps) {
  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="w-full flex items-center bg-surface hover:bg-surface-hover/60 border border-border-default rounded-lg px-3.5 py-2 text-sm focus-within:ring-2 focus-within:ring-border-focus focus-within:border-transparent transition-all duration-150 shadow-2xs"
    >
      <Search className="h-4 w-4 text-text-tertiary mr-2.5 shrink-0" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none! focus:outline-none!"
        aria-label={placeholder}
      />
    </form>
  );
}
