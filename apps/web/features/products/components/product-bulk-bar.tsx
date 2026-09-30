'use client';

import { Archive, Eye, EyeOff, RotateCcw, Trash2, X } from 'lucide-react';

import type { BulkProductAction, ProductTab } from '../types/product.types';

interface ProductBulkBarProps {
  selectedCount: number;
  activeTab: ProductTab;
  onBulkAction: (action: BulkProductAction) => void;
  onClearSelection: () => void;
  isPending?: boolean;
}

export function ProductBulkBar({
  selectedCount,
  activeTab,
  onBulkAction,
  onClearSelection,
  isPending = false,
}: ProductBulkBarProps) {
  if (selectedCount === 0) return null;

  const isArchivedTab = activeTab === 'archived';

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-border-default bg-surface dark:bg-surface-subtle shadow-xs animate-in fade-in-50 duration-150">
      <div className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked
          onChange={onClearSelection}
          aria-label="Clear selection"
          className="h-4 w-4 rounded-md border-border-strong text-accent focus:ring-accent cursor-pointer"
        />
        <span className="text-xs sm:text-sm font-semibold text-text-primary whitespace-nowrap">
          {selectedCount} selected
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Archive or Restore based on active tab */}
        {isArchivedTab ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => onBulkAction('restore')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border-default bg-surface dark:bg-surface-raised hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5 text-text-tertiary" />
            <span>Restore selected</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => onBulkAction('archive')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border-default bg-surface dark:bg-surface-raised hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
          >
            <Archive className="h-3.5 w-3.5 text-text-tertiary" />
            <span>Archive selected</span>
          </button>
        )}

        {/* Publish */}
        <button
          type="button"
          disabled={isPending}
          onClick={() => onBulkAction('publish')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border-default bg-surface dark:bg-surface-raised hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
        >
          <Eye className="h-3.5 w-3.5 text-text-tertiary" />
          <span>Publish selected</span>
        </button>

        {/* Unpublish */}
        <button
          type="button"
          disabled={isPending}
          onClick={() => onBulkAction('unpublish')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border-default bg-surface dark:bg-surface-raised hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
        >
          <EyeOff className="h-3.5 w-3.5 text-text-tertiary" />
          <span>Unpublish selected</span>
        </button>

        {/* Delete */}
        <button
          type="button"
          disabled={isPending}
          onClick={() => onBulkAction('delete')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-danger-500/30 bg-danger-500/5 hover:bg-danger-500/10 text-danger-500 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete selected</span>
        </button>

        {/* Exit selection button */}
        <button
          type="button"
          onClick={onClearSelection}
          aria-label="Deselect all"
          className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer ml-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
