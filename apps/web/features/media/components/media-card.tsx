'use client';

import {
  Ban,
  Check,
  Copy,
  Image as ImageIcon,
  MoreVertical,
  Play,
  Trash2,
  Video,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { toast } from 'sonner';

import type { MediaItem } from '../types/media.types';

interface MediaCardProps {
  item: MediaItem;
  onDisable?: (mediaId: string) => void;
  onEnable?: (mediaId: string) => void;
  onDelete?: (mediaId: string) => void;
  index?: number;
  selectable?: boolean;
  selected?: boolean;
  selectionIndex?: number;
  onSelect?: (item: MediaItem) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds?: number | null): string {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function MediaCard({
  item,
  onDisable,
  onEnable,
  onDelete,
  index,
  selectable = false,
  selected = false,
  selectionIndex,
  onSelect,
}: MediaCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const previewSrc =
    item.type === 'image'
      ? item.variants?.medium || item.variants?.thumbnail || item.original
      : item.poster || item.original;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(item.original);
      toast.success('Public URL copied to clipboard.');
      setMenuOpen(false);
    } catch {
      toast.error('Failed to copy URL.');
    }
  };

  const isDisabled = item.status === 'disabled';

  const handleCardClick = () => {
    if (selectable && onSelect) {
      onSelect(item);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col rounded-xl border bg-surface dark:bg-surface-subtle overflow-hidden transition-all duration-200 hover:shadow-md ${
        selectable ? 'cursor-pointer' : isDisabled ? 'cursor-not-allowed' : ''
      } ${
        selected
          ? 'border-accent ring-2 ring-accent shadow-sm'
          : isDisabled
            ? 'border-border-subtle opacity-75'
            : 'border-border-default hover:border-border-strong'
      }`}
    >
      {/* Visual Media Preview */}
      <div className="relative aspect-square w-full bg-surface-subtle overflow-hidden flex items-center justify-center">
        {!imgError ? (
          <Image
            src={previewSrc}
            alt={item.originalFileName}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            loading={index && index < 3 ? 'eager' : 'lazy'}
            fill
            sizes="(max-width: 639px) 50vw, (max-width: 767px) 33vw, (max-width: 1023px) 25vw, 20vw"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-text-tertiary gap-1">
            {item.type === 'image' ? (
              <ImageIcon className="h-8 w-8" />
            ) : (
              <Video className="h-8 w-8" />
            )}
            <span className="text-xs">Preview unavailable</span>
          </div>
        )}

        {/* Video Duration Badge */}
        {item.type === 'video' && item.durationSeconds ? (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 text-white text-xs font-mono backdrop-blur-xs">
            <Play className="h-3 w-3 fill-current" />
            <span>{formatDuration(item.durationSeconds)}</span>
          </div>
        ) : null}

        {/* Status Badge */}
        {isDisabled ? (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-danger-100 text-danger-500 dark:bg-danger-500/20 text-xs font-medium">
            Disabled
          </div>
        ) : null}

        {/* Selection Indicator or Action Menu */}
        {selectable ? (
          <div className="absolute top-2 right-2">
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center shadow-xs transition-colors ${
                selected
                  ? 'bg-accent text-on-accent'
                  : 'bg-surface/80 dark:bg-surface-subtle/80 border border-border-default text-transparent hover:border-accent'
              }`}
            >
              {selected && selectionIndex !== undefined ? (
                <span className="text-xs font-bold leading-none">{selectionIndex}</span>
              ) : (
                <Check className="h-3.5 w-3.5 stroke-3" />
              )}
            </div>
          </div>
        ) : (
          <div className="absolute top-2 right-2" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              aria-label="Media options"
              className="p-1.5 rounded-lg bg-surface/90 dark:bg-surface-subtle/90 hover:bg-surface text-text-secondary hover:text-text-primary shadow-xs backdrop-blur-xs transition-colors cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen ? (
              <div className="absolute right-0 mt-1 w-44 rounded-lg bg-surface-raised dark:bg-surface border border-border-default shadow-lg py-1 z-20 text-xs font-medium">
                <button
                  type="button"
                  onClick={copyUrl}
                  className="w-full flex items-center gap-2 px-3 py-2 text-text-primary hover:bg-surface-hover text-left cursor-pointer transition-colors"
                >
                  <Copy className="h-3.5 w-3.5 text-text-tertiary" />
                  <span>Copy URL</span>
                </button>

                {!isDisabled && onDisable ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDisable(item.mediaId);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-danger-500 hover:bg-danger-100/50 dark:hover:bg-danger-500/10 text-left cursor-pointer transition-colors"
                  >
                    <Ban className="h-3.5 w-3.5 text-danger-500" />
                    <span>Disable media</span>
                  </button>
                ) : null}

                {isDisabled && onEnable ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEnable(item.mediaId);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-accent hover:bg-accent/10 text-left cursor-pointer transition-colors"
                  >
                    <Check className="h-3.5 w-3.5 text-accent" />
                    <span>Enable media</span>
                  </button>
                ) : null}

                {isDisabled && onDelete ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(item.mediaId);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-danger-500 hover:bg-danger-100/50 dark:hover:bg-danger-500/10 text-left cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-danger-500" />
                    <span>Delete permanently</span>
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Metadata Footer */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div
          className="truncate text-xs font-semibold text-text-primary"
          title={item.originalFileName}
        >
          {item.originalFileName}
        </div>
        <div className="flex items-center justify-between text-[11px] text-text-tertiary mt-1.5 pt-1.5 border-t border-border-subtle">
          <span>
            {item.width && item.height ? `${item.width} × ${item.height}` : item.type.toUpperCase()}
          </span>
          <span>{formatFileSize(item.fileSizeBytes)}</span>
        </div>
      </div>
    </div>
  );
}
