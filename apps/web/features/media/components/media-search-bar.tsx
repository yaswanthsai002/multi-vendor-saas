'use client';

import { Loader2, Search, X } from 'lucide-react';
import * as React from 'react';

interface MediaSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isSearching?: boolean;
}

export function MediaSearchBar({
  value,
  onChange,
  placeholder = 'Search media by filename...',
  isSearching = false,
}: MediaSearchBarProps) {
  const [localValue, setLocalValue] = React.useState(value);
  const [prevValue, setPrevValue] = React.useState(value);

  // ponytail: React recommended pattern for adjusting state during render when prop changes
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value);
  }

  React.useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => clearTimeout(handler);
  }, [localValue, onChange]);

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {isSearching ? (
          <Loader2 className="h-4 w-4 text-accent animate-spin" />
        ) : (
          <Search className="h-4 w-4 text-text-tertiary" />
        )}
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search media by filename"
        className="block w-full pl-9 pr-8 py-2 text-sm bg-surface dark:bg-surface-subtle border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary  transition-colors"
      />
      {localValue ? (
        <button
          type="button"
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-text-tertiary hover:text-text-primary cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
