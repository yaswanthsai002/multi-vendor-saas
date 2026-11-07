'use client';

import { ChevronLeft, ChevronRight, Heart, X, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { Button } from '@/components/ui/button';

interface ProductDetailGalleryProps {
  images: string[];
  productName: string;
  selectedImage: string | null;
  onSelectImage: (image: string) => void;
  isWishlisted: boolean;
  wishlistDisabled: boolean;
  onWishlistToggle: () => void;
}

export function ProductDetailGallery({
  images,
  productName,
  selectedImage,
  onSelectImage,
  isWishlisted,
  wishlistDisabled,
  onWishlistToggle,
}: ProductDetailGalleryProps) {
  const stripRef = React.useRef<HTMLDivElement>(null);
  const zoomDialogRef = React.useRef<HTMLDialogElement>(null);
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const activeImage = selectedImage && images.includes(selectedImage) ? selectedImage : images[0];
  const activeIndex = images.indexOf(activeImage);

  React.useEffect(() => {
    stripRef.current
      ?.querySelector('[aria-pressed="true"]')
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [activeImage]);

  React.useEffect(() => {
    const dialog = zoomDialogRef.current;
    if (zoomOpen && dialog && !dialog.open) dialog.showModal();
    if (!zoomOpen && dialog?.open) dialog.close();
  }, [zoomOpen]);

  function moveImage(direction: number) {
    if (images.length > 1)
      onSelectImage(images[(activeIndex + direction + images.length) % images.length]);
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="group relative aspect-square overflow-hidden rounded-xl border border-border-subtle bg-surface-subtle">
        {activeImage ? (
          <>
            <Image
              src={activeImage}
              alt={productName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-3 sm:p-6"
              loading="eager"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label={
                isWishlisted
                  ? `Remove ${productName} from wishlist`
                  : `Add ${productName} to wishlist`
              }
              aria-pressed={isWishlisted}
              disabled={wishlistDisabled}
              onClick={onWishlistToggle}
              className="absolute right-3 top-3 z-10 shadow-md"
            >
              <Heart className={isWishlisted ? 'fill-accent text-accent' : ''} aria-hidden="true" />
            </Button>
            {images.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  aria-label="Previous product image"
                  onClick={() => moveImage(-1)}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 opacity-100 shadow-md sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  aria-label="Next product image"
                  onClick={() => moveImage(1)}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 opacity-100 shadow-md sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="absolute bottom-3 left-3 rounded-full bg-surface-raised/90 px-2.5 py-1 text-xs font-medium text-text-secondary backdrop-blur-sm">
                  {activeIndex + 1} / {images.length}
                </span>
              </>
            )}
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label="Zoom product image"
              onClick={() => setZoomOpen(true)}
              className="absolute bottom-3 right-3 z-10 shadow-md"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-secondary">
            Image unavailable
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div
          ref={stripRef}
          aria-label="Product images"
          className="product-gallery-strip flex w-full gap-2 overflow-x-auto py-1"
        >
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              aria-label={`View product image ${index + 1}`}
              aria-pressed={activeImage === url}
              onClick={() => onSelectImage(url)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-surface-subtle transition-colors cursor-pointer sm:h-24 sm:w-24 ${activeImage === url ? 'border-accent ring-2 ring-accent/20' : 'border-border-subtle hover:border-border-strong'}`}
            >
              <Image src={url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <dialog
        ref={zoomDialogRef}
        onClose={() => setZoomOpen(false)}
        aria-label="Product image zoom"
        className="m-auto max-h-dvh w-full max-w-5xl overflow-hidden rounded-xl border border-border-default bg-surface p-0 text-text-primary shadow-xl backdrop:bg-black/70"
      >
        <div className="relative aspect-square max-h-dvh w-full">
          {activeImage && (
            <Image
              src={activeImage}
              alt={productName}
              fill
              sizes="90vw"
              className="object-contain p-8"
            />
          )}
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label="Close image zoom"
            onClick={() => setZoomOpen(false)}
            className="absolute right-3 top-3 z-10"
          >
            <X className="h-4 w-4" />
          </Button>
          {images.length > 1 && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                aria-label="Previous product image"
                onClick={() => moveImage(-1)}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                aria-label="Next product image"
                onClick={() => moveImage(1)}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
