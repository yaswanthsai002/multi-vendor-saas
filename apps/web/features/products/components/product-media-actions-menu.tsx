'use client';

import { Menu } from '@base-ui-components/react/menu';
import { ArrowLeft, ArrowRight, MoreHorizontal, Star, Trash2 } from 'lucide-react';

import type { MediaItem } from '@/features/media/types/media.types';

interface ProductMediaActionsMenuProps {
  media: MediaItem;
  index: number;
  totalItems: number;
  onSetPrimary: (media: MediaItem) => void;
  onMoveLeft: (index: number) => void;
  onMoveRight: (index: number) => void;
  onRemove: (mediaId: string) => void;
}

export function ProductMediaActionsMenu({
  media,
  index,
  totalItems,
  onSetPrimary,
  onMoveLeft,
  onMoveRight,
  onRemove,
}: ProductMediaActionsMenuProps) {
  return (
    <div className="absolute bottom-2.5 right-2.5">
      <Menu.Root>
        <Menu.Trigger
          aria-label="Image actions"
          className="p-2 rounded-xl bg-surface/90 dark:bg-surface-subtle/90 hover:bg-surface text-text-secondary hover:text-text-primary border border-border-default shadow-xs transition-colors cursor-pointer focus:outline-none"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side="bottom" align="end" sideOffset={6} className="z-50">
            <Menu.Popup className="w-36 rounded-xl bg-surface dark:bg-surface-subtle border border-border-default shadow-xl py-1 focus:outline-none animate-in fade-in-50 zoom-in-95 duration-100 text-left">
              <Menu.Item
                onClick={() => onSetPrimary(media)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-text-primary hover:bg-surface-hover transition-colors cursor-pointer focus:outline-none focus:bg-surface-hover"
              >
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span>Set as primary</span>
              </Menu.Item>
              {index > 0 ? (
                <Menu.Item
                  onClick={() => onMoveLeft(index)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-text-primary hover:bg-surface-hover transition-colors cursor-pointer focus:outline-none focus:bg-surface-hover"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-text-tertiary" />
                  <span>Move left</span>
                </Menu.Item>
              ) : null}
              {index < totalItems - 1 ? (
                <Menu.Item
                  onClick={() => onMoveRight(index)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-text-primary hover:bg-surface-hover transition-colors cursor-pointer focus:outline-none focus:bg-surface-hover"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-text-tertiary" />
                  <span>Move right</span>
                </Menu.Item>
              ) : null}
              <Menu.Separator className="h-px bg-border-subtle my-1" />
              <Menu.Item
                onClick={() => onRemove(media.mediaId)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-danger hover:bg-danger/10 transition-colors cursor-pointer focus:outline-none focus:bg-danger/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove</span>
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
