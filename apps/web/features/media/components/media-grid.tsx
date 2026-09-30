'use client';

import { ChevronLeft, ChevronRight, Image as ImageIcon, Search, UploadCloud } from 'lucide-react';
import * as React from 'react';

import { MediaCard } from './media-card';

import type { MediaItem } from '../types/media.types';

interface MediaGridProps {
  items: MediaItem[];
  isLoading: boolean;
  isFetching?: boolean;
  searchQuery?: string;
  onClearSearch?: () => void;
  onOpenUpload?: () => void;
  onDisable?: (mediaId: string) => void;
  onEnable?: (mediaId: string) => void;
  onDelete?: (mediaId: string) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  selectable?: boolean;
  selectedIds?: string[];
  getSelectionIndex?: (mediaId: string) => number | undefined;
  onSelect?: (item: MediaItem) => void;
}

export function MediaGrid({
  items,
  isLoading,
  isFetching = false,
  searchQuery,
  onClearSearch,
  onOpenUpload,
  onDisable,
  onEnable,
  onDelete,
  pagination,
  onPageChange,
  selectable = false,
  selectedIds = [],
  getSelectionIndex,
  onSelect,
}: MediaGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-border-default bg-surface dark:bg-surface-subtle overflow-hidden animate-pulse"
          >
            <div className="aspect-square w-full bg-surface-subtle dark:bg-surface" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-3/4 bg-surface-subtle dark:bg-surface rounded-sm" />
              <div className="h-2.5 w-1/2 bg-surface-subtle dark:bg-surface rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    if (searchQuery) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border-default rounded-2xl bg-surface dark:bg-surface-subtle">
          <div className="p-3 rounded-full bg-surface-subtle text-text-tertiary mb-3">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">No matching media found</h3>
          <p className="text-sm text-text-secondary mt-1 max-w-sm">
            We couldn&apos;t find any assets matching &quot;{searchQuery}&quot;. Try adjusting your
            search term.
          </p>
          {onClearSearch ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="mt-4 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-surface-hover text-text-primary hover:bg-surface-active transition-colors cursor-pointer"
            >
              Clear search
            </button>
          ) : null}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-border-default rounded-2xl bg-surface dark:bg-surface-subtle">
        <div className="p-4 rounded-full bg-accent/10 text-accent mb-4">
          <ImageIcon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary">No media assets yet</h3>
        <p className="text-sm text-text-secondary mt-1 max-w-md">
          Upload product photos, catalog images, and video demonstrations to reuse them seamlessly
          across your products.
        </p>
        {onOpenUpload ? (
          <button
            type="button"
            onClick={onOpenUpload}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-on-accent text-sm font-semibold hover:bg-accent-hover active:bg-accent-active transition-colors shadow-xs cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload first asset</span>
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`space-y-6 transition-opacity duration-200 ${
        isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item, index) => (
          <MediaCard
            key={item.mediaId}
            item={item}
            onDisable={onDisable}
            onEnable={onEnable}
            onDelete={onDelete}
            index={index}
            selectable={selectable}
            selected={selectedIds.includes(item.mediaId)}
            selectionIndex={getSelectionIndex ? getSelectionIndex(item.mediaId) : undefined}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between pt-4 border-t border-border-default text-xs text-text-secondary">
          <div>
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
            items
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="p-1.5 rounded-md border border-border-default hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium text-text-primary">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="p-1.5 rounded-md border border-border-default hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
