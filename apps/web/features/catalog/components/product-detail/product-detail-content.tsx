'use client';

import { Star, X } from 'lucide-react';
import * as React from 'react';

import type { ReviewPage } from './product-review.types';
import type { CatalogProductDetail } from '../../types/catalog.types';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';

interface ProductDetailContentProps {
  product: CatalogProductDetail;
  reviews: UseInfiniteQueryResult<InfiniteData<ReviewPage>, Error>;
}

const reviewDate = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function ProductDetailContent({ product, reviews }: ProductDetailContentProps) {
  const [descriptionOpen, setDescriptionOpen] = React.useState(false);
  const [descriptionClipped, setDescriptionClipped] = React.useState(false);
  const descriptionDialog = React.useRef<HTMLDialogElement>(null);
  const descriptionRef = React.useRef<HTMLParagraphElement>(null);
  const reviewsPage = reviews.data?.pages[0];
  const averageRating = reviewsPage?.averageRating;
  const ratingCount = reviewsPage?.ratingCount ?? 0;

  React.useEffect(() => {
    const dialog = descriptionDialog.current;
    if (descriptionOpen && dialog && !dialog.open) dialog.showModal();
    if (!descriptionOpen && dialog?.open) dialog.close();
  }, [descriptionOpen]);

  React.useEffect(() => {
    const paragraph = descriptionRef.current;
    if (!paragraph) return;
    const measure = () =>
      setDescriptionClipped(paragraph.scrollHeight > paragraph.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(paragraph);
    return () => observer.disconnect();
  }, [product.description]);

  return (
    <div className="space-y-12">
      <section aria-labelledby="description-title" className="max-w-4xl">
        <h2 id="description-title" className="text-xl font-semibold text-text-primary">
          Product description
        </h2>
        <p
          ref={descriptionRef}
          className="mt-4 max-h-40 overflow-hidden whitespace-pre-wrap text-sm leading-7 text-text-secondary sm:text-base"
        >
          {product.description}
        </p>
        {descriptionClipped && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDescriptionOpen(true)}
            className="mt-2 px-0 font-semibold text-accent hover:bg-transparent hover:underline"
          >
            Read more
          </Button>
        )}
      </section>

      <section aria-labelledby="reviews-title" className="space-y-6">
        <h2 id="reviews-title" className="text-xl font-semibold text-text-primary">
          Product Reviews
        </h2>
        {reviews.isLoading ? (
          <ReviewsSkeleton />
        ) : reviews.isError ? (
          <div
            role="alert"
            className="rounded-lg border border-border-default bg-surface-raised p-5"
          >
            <p className="text-sm text-text-secondary">
              We couldn&apos;t load product reviews. Your connection may have been interrupted.
            </p>
            <Button className="mt-3" size="sm" onClick={() => void reviews.refetch()}>
              Try again
            </Button>
          </div>
        ) : reviews.data?.pages.every((page) => page.ratingCount === 0) ? (
          <p className="rounded-lg border border-border-subtle bg-surface-raised p-5 text-sm text-text-secondary">
            No customer ratings yet. Check back later to see what shoppers think.
          </p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="h-fit rounded-xl border border-border-subtle bg-surface-raised p-5 sm:p-6">
              <p className="text-sm font-medium text-text-secondary">Customer rating</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-6xl font-bold tabular-nums tracking-tight sm:text-7xl text-text-primary">
                  {averageRating?.toFixed(1) ?? '—'}
                </span>
                <Star
                  aria-hidden="true"
                  className={`h-8 w-8 ${averageRating ? 'fill-warning text-warning' : 'text-text-tertiary'}`}
                />
              </div>
              <p className="mt-1 text-sm text-text-secondary">{ratingCount} ratings</p>
              <div className="mt-6 space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count =
                    reviewsPage?.distribution.find((row) => row.rating === rating)?.count ?? 0;
                  return (
                    <div key={rating} className="flex items-center gap-3 text-xs">
                      <span className="w-12 shrink-0 whitespace-nowrap text-text-secondary">
                        {rating}-star
                      </span>
                      <div
                        role="meter"
                        aria-label={`${rating} star ratings`}
                        aria-valuemin={0}
                        aria-valuemax={ratingCount}
                        aria-valuenow={count}
                        className="h-2 flex-1 overflow-hidden rounded-full bg-surface-subtle"
                      >
                        <div
                          className="h-full rounded-full bg-warning"
                          style={{ width: `${(count / ratingCount) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-right tabular-nums text-text-tertiary">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="divide-y divide-border-subtle lg:col-span-2">
              {reviews.data?.pages
                .flatMap((page) => page.items)
                .map((review) => (
                  <article key={review.reviewId} className="py-5 first:pt-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-text-primary">{review.authorName}</p>
                      <time dateTime={review.createdAt} className="text-xs text-text-tertiary">
                        {reviewDate.format(new Date(review.createdAt)).replaceAll(' ', '-')}
                      </time>
                    </div>
                    <div
                      aria-label={`${review.rating} out of 5 stars`}
                      className="mt-2 flex gap-0.5 text-warning"
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          aria-hidden="true"
                          className={`h-4 w-4 ${index < review.rating ? 'fill-warning' : 'text-border-strong'}`}
                        />
                      ))}
                    </div>
                    {review.reviewText && (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                        {review.reviewText}
                      </p>
                    )}
                  </article>
                ))}
              {reviews.hasNextPage && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={reviews.isFetchingNextPage}
                  isLoading={reviews.isFetchingNextPage}
                  onClick={() => void reviews.fetchNextPage()}
                  className="mx-auto mt-5 flex text-sm"
                >
                  Show more reviews
                </Button>
              )}
            </div>
          </div>
        )}
      </section>

      {descriptionOpen && (
        <dialog
          ref={descriptionDialog}
          onClose={() => setDescriptionOpen(false)}
          aria-labelledby="full-description-title"
          className="m-auto max-h-dvh w-full max-w-2xl overflow-y-auto rounded-xl border border-border-default bg-surface p-0 text-text-primary shadow-xl backdrop:bg-black/60"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border-default bg-surface px-6 py-4">
            <h2 id="full-description-title" className="text-lg font-semibold">
              Product description
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              autoFocus
              aria-label="Close description"
              onClick={() => setDescriptionOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="whitespace-pre-wrap px-6 py-5 text-sm leading-7 text-text-secondary sm:text-base">
            {product.description}
          </p>
        </dialog>
      )}
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div aria-label="Loading reviews" className="grid gap-8 lg:grid-cols-3">
      <div className="h-56 animate-pulse rounded-xl bg-surface-subtle" />
      <div className="space-y-4 lg:col-span-2">
        {[0, 1, 2].map((row) => (
          <div key={row} className="h-24 animate-pulse rounded-lg bg-surface-subtle" />
        ))}
      </div>
    </div>
  );
}
