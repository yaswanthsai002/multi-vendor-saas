'use client';

import { Image as ImageIcon, Plus } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { ProductMediaActionsMenu } from './product-media-actions-menu';

import type { MediaItem } from '@/features/media/types/media.types';

import { MediaPickerModal } from '@/features/media/components/media-picker-modal';

interface ProductMediaCardProps {
  primaryImage: MediaItem | null;
  onSelectPrimaryImage: (media: MediaItem | null) => void;
  galleryImages: MediaItem[];
  onUpdateGallery: (images: MediaItem[]) => void;
  error?: string;
}

export function ProductMediaCard({
  primaryImage,
  onSelectPrimaryImage,
  galleryImages,
  onUpdateGallery,
  error,
}: ProductMediaCardProps) {
  const [pickerTarget, setPickerTarget] = React.useState<'primary' | 'gallery' | null>(null);

  const handleMediaConfirmed = (selectedList: MediaItem[]) => {
    if (pickerTarget === 'primary') {
      if (selectedList[0]) {
        onSelectPrimaryImage(selectedList[0]);
      }
    } else if (pickerTarget === 'gallery') {
      // Append new items avoiding duplicates
      const existingIds = new Set(galleryImages.map((m) => m.mediaId));
      const newItems = selectedList.filter((m) => !existingIds.has(m.mediaId));
      onUpdateGallery([...galleryImages, ...newItems]);
    }
    setPickerTarget(null);
  };

  const handleMoveLeft = (index: number) => {
    if (index <= 0) return;
    const next = [...galleryImages];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    onUpdateGallery(next);
  };

  const handleMoveRight = (index: number) => {
    if (index >= galleryImages.length - 1) return;
    const next = [...galleryImages];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    onUpdateGallery(next);
  };

  const handleRemoveFromGallery = (mediaId: string) => {
    onUpdateGallery(galleryImages.filter((m) => m.mediaId !== mediaId));
  };

  const getMediaUrl = (media: MediaItem) => {
    return (
      media.variants?.medium ||
      media.variants?.thumbnail ||
      media.poster ||
      media.original ||
      (media as unknown as { url?: string }).url ||
      '/placeholder.png'
    );
  };

  return (
    <div className="rounded-2xl border border-border-default bg-surface dark:bg-surface-subtle p-6 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">
              Product Media
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Select a primary image and add more images to the gallery from your media library.
          </p>
        </div>
      </div>

      {error ? <p className="text-xs text-danger font-medium">{error}</p> : null}

      {/* Media Pickers Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left: Primary Image (3 cols on large screens) */}
        <div className="md:col-span-4 lg:col-span-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-semibold text-text-primary">
              Primary image <span className="text-danger">*</span>
            </label>
            {primaryImage ? (
              <button
                type="button"
                onClick={() => onSelectPrimaryImage(null)}
                className="text-xs text-danger hover:underline cursor-pointer"
              >
                Remove
              </button>
            ) : null}
          </div>

          {primaryImage ? (
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-border-default bg-surface-subtle group">
              <Image
                src={getMediaUrl(primaryImage)}
                alt={primaryImage.originalFileName || 'Primary product image'}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-sky-600 text-white text-xs font-semibold shadow-xs">
                Primary
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickerTarget('primary')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-900 shadow-md hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Change image
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 aspect-square w-full rounded-2xl border-2 border-dashed border-border-default hover:border-border-strong bg-surface-subtle/50 dark:bg-surface/30 text-center transition-colors">
              <div className="h-10 w-10 rounded-xl bg-surface dark:bg-surface-subtle border border-border-default flex items-center justify-center text-text-tertiary mb-3">
                <ImageIcon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-text-primary mb-1">No image selected</p>
              <button
                type="button"
                onClick={() => setPickerTarget('primary')}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border-default bg-surface dark:bg-surface-subtle hover:bg-surface-hover text-text-primary transition-colors cursor-pointer"
              >
                <ImageIcon className="h-3.5 w-3.5 text-text-secondary" />
                <span>Choose from Media Library</span>
              </button>
            </div>
          )}

          <p className="text-xs text-text-tertiary leading-relaxed">
            This will be the main display image for your product across catalog search and product
            cards.
          </p>
        </div>

        {/* Right: Product Gallery (9 cols on large screens) */}
        <div className="md:col-span-8 lg:col-span-9 space-y-2 min-w-0">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-semibold text-text-primary">
              Product gallery{' '}
              {galleryImages.length > 0 ? (
                <span className="font-normal text-text-secondary">
                  ({galleryImages.length} items)
                </span>
              ) : null}
            </label>
          </div>

          {galleryImages.length > 0 ? (
            <>
              <div className="flex items-center gap-3.5 overflow-x-auto pb-3 pt-1 px-1 scrollbar-thin">
                {galleryImages.map((media, idx) => (
                  <div
                    key={media.mediaId}
                    className="w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 shrink-0 relative rounded-2xl overflow-hidden border border-border-default bg-surface dark:bg-surface-subtle group shadow-xs hover:border-border-strong transition-all"
                  >
                    <Image
                      src={getMediaUrl(media)}
                      alt={media.originalFileName || 'Product gallery image'}
                      fill
                      sizes="(max-width: 640px) 192px, 240px"
                      className="object-cover"
                    />

                    {/* Order Number Badge */}
                    <div
                      className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-xs font-semibold shadow-xs ${
                        idx === 0
                          ? 'bg-sky-600 text-white'
                          : 'bg-black/65 dark:bg-white/80 text-white dark:text-black backdrop-blur-xs'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Extracted Actions Menu Component */}
                    <ProductMediaActionsMenu
                      media={media}
                      index={idx}
                      totalItems={galleryImages.length}
                      onSetPrimary={onSelectPrimaryImage}
                      onMoveLeft={handleMoveLeft}
                      onMoveRight={handleMoveRight}
                      onRemove={handleRemoveFromGallery}
                    />
                  </div>
                ))}

                {/* Add more images card at the end of the scroll */}
                <button
                  type="button"
                  onClick={() => setPickerTarget('gallery')}
                  className="w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 shrink-0 rounded-2xl border-2 border-dashed border-border-default hover:border-border-strong bg-surface-subtle/30 hover:bg-surface-subtle/60 flex flex-col items-center justify-center gap-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-xl bg-surface dark:bg-surface-subtle border border-border-default flex items-center justify-center">
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold">Add media</span>
                </button>
              </div>
              <p className="text-xs text-text-tertiary leading-relaxed">
                Display sequence matches your store product details. Use the action menu on any item
                to reorder or set as primary.
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 min-h-52 sm:min-h-65 lg:min-h-68 w-full rounded-2xl border-2 border-dashed border-border-default hover:border-border-strong bg-surface-subtle/50 dark:bg-surface/30 text-center transition-colors">
              <div className="h-10 w-10 rounded-xl bg-surface dark:bg-surface-subtle border border-border-default flex items-center justify-center text-text-tertiary mb-3">
                <ImageIcon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-text-primary mb-1">No gallery images yet</p>
              <p className="text-xs text-text-tertiary max-w-xs mb-3">
                Select images from your media library to add to the gallery.
              </p>
              <button
                type="button"
                onClick={() => setPickerTarget('gallery')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border-default bg-surface dark:bg-surface-subtle hover:bg-surface-hover text-text-primary transition-colors cursor-pointer"
              >
                <ImageIcon className="h-3.5 w-3.5 text-text-secondary" />
                <span>Choose from Media Library</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={Boolean(pickerTarget)}
        onClose={() => setPickerTarget(null)}
        onConfirm={handleMediaConfirmed}
        multiple={pickerTarget === 'gallery'}
        acceptedType="image"
        title={pickerTarget === 'primary' ? 'Select Primary Image' : 'Select Gallery Images'}
        description={
          pickerTarget === 'primary'
            ? 'Choose a high-resolution primary image for this product.'
            : 'Select one or more active images to include in this product gallery.'
        }
      />
    </div>
  );
}
