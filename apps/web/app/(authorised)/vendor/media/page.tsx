'use client';

import { Ban, Check, CheckSquare, Trash2, X, XCircle } from 'lucide-react';
import * as React from 'react';

import type { ListMediaFilters, MediaItem } from '@/features/media/types/media.types';

import { MediaDeleteDialog } from '@/features/media/components/media-delete-dialog';
import { MediaGrid } from '@/features/media/components/media-grid';
import { MediaHeader } from '@/features/media/components/media-header';
import { MediaSearchBar } from '@/features/media/components/media-search-bar';
import { type MediaTab, MediaTabs } from '@/features/media/components/media-tabs';
import { MediaUploadDialog } from '@/features/media/components/media-upload-dialog';
import {
  useBulkMediaAction,
  useDeleteMedia,
  useDisableMedia,
  useEnableMedia,
  useMediaList,
} from '@/features/media/hooks/use-media';

export default function VendorMediaPage() {
  const [activeTab, setActiveTab] = React.useState<MediaTab>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Cross-tab selection state (mediaId -> MediaItem)
  const [isSelectionMode, setIsSelectionMode] = React.useState(false);
  const [selectedMap, setSelectedMap] = React.useState<Map<string, MediaItem>>(() => new Map());
  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false);

  // Compute filters based on activeTab
  const filters: ListMediaFilters = React.useMemo(() => {
    const f: ListMediaFilters = { page, limit: 20 };
    if (searchQuery.trim()) {
      f.search = searchQuery.trim();
    }

    if (activeTab === 'all') {
      f.status = 'all';
    } else if (activeTab === 'disabled') {
      f.status = 'disabled';
    } else {
      f.status = 'active';
      if (activeTab === 'image') {
        f.mediaType = 'image';
      } else if (activeTab === 'video') {
        f.mediaType = 'video';
      }
    }
    return f;
  }, [activeTab, searchQuery, page]);

  const { data, isLoading, isFetching } = useMediaList(filters);
  const disableMutation = useDisableMedia();
  const enableMutation = useEnableMedia();
  const deleteMutation = useDeleteMedia();
  const bulkActionMutation = useBulkMediaAction();

  // ponytail: use all-tab counts summary from API; reflect filtered count on active tab when searching
  const counts = data?.counts
    ? searchQuery.trim() && data.pagination?.total !== undefined
      ? { ...data.counts, [activeTab]: data.pagination.total }
      : data.counts
    : data?.pagination?.total !== undefined
      ? { [activeTab]: data.pagination.total }
      : undefined;

  const handleTabChange = (tab: MediaTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleDisable = (mediaId: string) => {
    disableMutation.mutate(mediaId);
  };

  const handleEnable = (mediaId: string) => {
    enableMutation.mutate(mediaId);
  };

  const handleItemSelect = (item: MediaItem) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(item.mediaId)) {
        next.delete(item.mediaId);
      } else {
        next.set(item.mediaId, item);
      }
      return next;
    });
  };

  const handleSelectAllOnPage = () => {
    if (!data?.items) return;
    setSelectedMap((prev) => {
      const next = new Map(prev);
      data.items.forEach((item) => {
        next.set(item.mediaId, item);
      });
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedMap(new Map());
  };

  const handleBulkEnable = async () => {
    const mediaIds = Array.from(selectedMap.keys());
    if (mediaIds.length === 0) return;
    try {
      await bulkActionMutation.mutateAsync({ action: 'enable', mediaIds });
      handleClearSelection();
      setIsSelectionMode(false);
    } catch {
      // Handled by toast
    }
  };

  const handleBulkDisable = async () => {
    const mediaIds = Array.from(selectedMap.keys());
    if (mediaIds.length === 0) return;
    try {
      await bulkActionMutation.mutateAsync({ action: 'disable', mediaIds });
      handleClearSelection();
      setIsSelectionMode(false);
    } catch {
      // Handled by toast
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteMutation.mutateAsync(deletingId);
        setDeletingId(null);
      } catch {
        // Handled by toast
      }
    } else if (isBulkDeleting) {
      const mediaIds = Array.from(selectedMap.keys());
      if (mediaIds.length > 0) {
        try {
          await bulkActionMutation.mutateAsync({ action: 'delete', mediaIds });
          setIsBulkDeleting(false);
          handleClearSelection();
          setIsSelectionMode(false);
        } catch {
          // Handled by toast
        }
      }
    }
  };

  const selectedCount = selectedMap.size;
  const selectedIds = Array.from(selectedMap.keys());

  return (
    <div className="space-y-6 relative pb-16">
      {/* Header with Title and Upload action */}
      <MediaHeader onOpenUpload={() => setIsUploadOpen(true)} />

      {/* Filter, Search, and Selection toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <MediaTabs activeTab={activeTab} onTabChange={handleTabChange} counts={counts} />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsSelectionMode((prev) => !prev);
              if (isSelectionMode) {
                handleClearSelection();
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isSelectionMode
                ? 'bg-accent/10 border-accent text-accent'
                : 'bg-surface dark:bg-surface-subtle border-border-default text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span>{isSelectionMode ? 'Done' : 'Select'}</span>
          </button>

          <MediaSearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            isSearching={isFetching && Boolean(searchQuery.trim())}
          />
        </div>
      </div>

      {/* Responsive Visual Grid */}
      <MediaGrid
        items={data?.items || []}
        isLoading={isLoading}
        isFetching={isFetching}
        searchQuery={searchQuery}
        onClearSearch={() => handleSearchChange('')}
        onOpenUpload={() => setIsUploadOpen(true)}
        onDisable={handleDisable}
        onEnable={handleEnable}
        onDelete={(mediaId) => setDeletingId(mediaId)}
        pagination={data?.pagination}
        onPageChange={(newPage) => setPage(newPage)}
        selectable={isSelectionMode}
        selectedIds={selectedIds}
        onSelect={handleItemSelect}
      />

      {/* Floating Bulk Action Bar */}
      {isSelectionMode ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-surface/95 dark:bg-surface-subtle/95 border border-border-default shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200">
          <span className="text-xs font-bold text-text-primary whitespace-nowrap">
            {selectedCount} selected
          </span>

          <div className="h-4 w-px bg-border-subtle" />

          {/* Selection helpers */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSelectAllOnPage}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface-subtle dark:bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-default transition-colors cursor-pointer"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>Select page</span>
            </button>

            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={handleClearSelection}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface-subtle dark:bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-default transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <div className="h-4 w-px bg-border-subtle" />

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Enable is available on All and Disabled tabs */}
            {activeTab === 'all' || activeTab === 'disabled' ? (
              <button
                type="button"
                disabled={selectedCount === 0 || bulkActionMutation.isPending}
                onClick={handleBulkEnable}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent/10 hover:bg-accent/20 text-accent transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>Enable</span>
              </button>
            ) : null}

            {/* Disable is available on All and active media tabs (Images, Videos) */}
            {activeTab === 'all' || activeTab === 'image' || activeTab === 'video' ? (
              <button
                type="button"
                disabled={selectedCount === 0 || bulkActionMutation.isPending}
                onClick={handleBulkDisable}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-warning-500/10 hover:bg-warning-500/20 text-warning-600 dark:text-warning-400 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Disable</span>
              </button>
            ) : null}

            {/* Delete is available on All and Disabled tabs */}
            {activeTab === 'all' || activeTab === 'disabled' ? (
              <button
                type="button"
                disabled={selectedCount === 0 || bulkActionMutation.isPending}
                onClick={() => setIsBulkDeleting(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger-500/10 hover:bg-danger-500/20 text-danger-500 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setIsSelectionMode(false);
                handleClearSelection();
              }}
              aria-label="Exit selection"
              className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Upload Dialog Modal */}
      <MediaUploadDialog open={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

      {/* Single / Bulk Delete Confirmation Modal */}
      <MediaDeleteDialog
        open={Boolean(deletingId) || isBulkDeleting}
        count={isBulkDeleting ? selectedCount : 1}
        onClose={() => {
          setDeletingId(null);
          setIsBulkDeleting(false);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending || bulkActionMutation.isPending}
      />
    </div>
  );
}
