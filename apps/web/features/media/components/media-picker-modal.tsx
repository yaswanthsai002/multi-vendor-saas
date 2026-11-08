'use client';

import { UploadCloud, X } from 'lucide-react';
import * as React from 'react';

import { useMediaList } from '../hooks/use-media';

import { MediaGrid } from './media-grid';
import { MediaSearchBar } from './media-search-bar';
import { type MediaTab, MediaTabs } from './media-tabs';
import { MediaUploadDialog } from './media-upload-dialog';

import type { MediaItem } from '../types/media.types';

import { Pagination } from '@/shared/components/pagination/pagination';

export interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedMedia: MediaItem[]) => void;
  title?: string;
  description?: string;
  multiple?: boolean;
  acceptedType?: 'image' | 'video';
  maxSelect?: number;
  mediaScope?: 'vendor' | 'catalog';
  allowUpload?: boolean;
  maxUploadFiles?: number;
  uploadAccept?: string;
  onUploadFiles?: (files: File[], onProgress: (percent: number) => void) => Promise<void>;
}

function MediaPickerContent({
  onClose,
  onConfirm,
  title = 'Select Media',
  description = 'Choose existing assets from your library or upload new ones.',
  multiple = false,
  acceptedType,
  maxSelect,
  mediaScope = 'vendor',
  allowUpload = true,
  maxUploadFiles,
  uploadAccept,
  onUploadFiles,
}: Omit<MediaPickerModalProps, 'open'>) {
  const [activeTab, setActiveTab] = React.useState<MediaTab>(acceptedType || 'all');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [selectedMap, setSelectedMap] = React.useState<Map<string, MediaItem>>(() => new Map());
  const mediaContentRef = React.useRef<HTMLDivElement>(null);

  // Handle ESC key to close
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (uploadOpen) setUploadOpen(false);
        else onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, uploadOpen]);

  // Query parameters - status is strictly 'active' per Plan §25
  const queryParams = React.useMemo(() => {
    const params: {
      status: 'active';
      mediaType?: 'image' | 'video';
      search?: string;
      page: number;
      limit: number;
    } = {
      status: 'active',
      page,
      limit: 15,
    };

    if (activeTab === 'image' || activeTab === 'video') {
      params.mediaType = activeTab;
    }
    if (search.trim()) {
      params.search = search.trim();
    }
    return params;
  }, [activeTab, search, page]);

  const { data, isLoading, isFetching } = useMediaList(queryParams, mediaScope);

  const handleItemSelect = (item: MediaItem) => {
    if (item.status === 'disabled') return;

    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(item.mediaId)) {
        next.delete(item.mediaId);
      } else {
        if (!multiple) {
          next.clear();
          next.set(item.mediaId, item);
        } else {
          if (maxSelect && next.size >= maxSelect) {
            return prev;
          }
          next.set(item.mediaId, item);
        }
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const selectedList = Array.from(selectedMap.values());
    onConfirm(selectedList);
    onClose();
  };

  const selectedCount = selectedMap.size;
  const selectedIds = Array.from(selectedMap.keys());

  const handleTabChange = React.useCallback((tab: MediaTab) => {
    if (tab !== 'disabled') {
      setActiveTab((prev) => {
        if (prev !== tab) {
          setPage(1);
          return tab;
        }
        return prev;
      });
    }
  }, []);

  const handleSearchChange = React.useCallback((q: string) => {
    setSearch((prev) => {
      if (prev !== q) {
        setPage(1);
        return q;
      }
      return prev;
    });
  }, []);

  if (uploadOpen) {
    return (
      <MediaUploadDialog
        open
        maxFiles={maxUploadFiles}
        accept={uploadAccept}
        onUploadComplete={onUploadFiles ? onClose : undefined}
        onUploadFiles={
          onUploadFiles
            ? async (files, onProgress) => {
                await onUploadFiles(files, onProgress);
              }
            : undefined
        }
        onClose={() => setUploadOpen(false)}
      />
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-surface dark:bg-surface-subtle border border-border-default shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div>
            <h2 id="media-picker-title" className="text-lg font-bold text-text-primary">
              {title}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            {allowUpload && (
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-hover text-text-primary text-xs font-semibold border border-border-default transition-colors cursor-pointer"
              >
                <UploadCloud className="h-3.5 w-3.5 text-accent" />
                <span>Upload new</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Tabs */}
        <div className="px-6 pt-3 pb-1 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {!acceptedType ? (
            <div className="w-full sm:w-auto">
              <MediaTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                counts={{
                  all: data?.counts?.all,
                  image: data?.counts?.image,
                  video: data?.counts?.video,
                }}
              />
            </div>
          ) : (
            <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              {acceptedType === 'image' ? 'Images' : 'Videos'}
            </div>
          )}

          <div className="w-full sm:w-64">
            <MediaSearchBar value={search} onChange={handleSearchChange} />
          </div>
        </div>

        {/* Media Grid Content */}
        <div ref={mediaContentRef} className="min-h-0 flex-1 overflow-y-auto p-6">
          <MediaGrid
            items={data?.items ?? []}
            isLoading={isLoading}
            isFetching={isFetching}
            searchQuery={search}
            onClearSearch={() => setSearch('')}
            onOpenUpload={allowUpload ? () => setUploadOpen(true) : undefined}
            pagination={data?.pagination}
            showPagination={false}
            selectable={true}
            selectedIds={selectedIds}
            getSelectionIndex={
              multiple
                ? (id) => {
                    const idx = selectedIds.indexOf(id);
                    return idx >= 0 ? idx + 1 : undefined;
                  }
                : undefined
            }
            onSelect={handleItemSelect}
          />
        </div>

        {data?.pagination && (
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            totalItems={data.pagination.total}
            limit={data.pagination.limit}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              mediaContentRef.current?.scrollTo({ top: 0 });
            }}
            className="px-6"
          />
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-default bg-surface-subtle/50">
          <div className="text-xs text-text-secondary">
            {selectedCount > 0 ? (
              <span className="font-medium text-text-primary">
                {selectedCount} {selectedCount === 1 ? 'asset' : 'assets'} selected
                {maxSelect ? ` (max ${maxSelect})` : ''}
              </span>
            ) : (
              <span>Click any asset to select it</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-border-default text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-active disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
            >
              {selectedCount > 0 ? `Attach (${selectedCount})` : 'Attach'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MediaPickerModal(props: MediaPickerModalProps) {
  if (!props.open) return null;
  return <MediaPickerContent {...props} />;
}
