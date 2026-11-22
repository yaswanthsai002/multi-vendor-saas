'use client';

import { Radio } from '@base-ui-components/react/radio';
import { RadioGroup } from '@base-ui-components/react/radio-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Star, Trash2 } from 'lucide-react';
import { useId, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/field';
import { ApiError } from '@/lib/api-client';

import { useCustomerReview } from '../hooks/use-customer-review';
import { saveCustomerReviewSchema } from '../schemas/customer-review.schema';

import type { CustomerReviewState } from '../types/customer-order.types';
import type { z } from 'zod';

export function CustomerOrderReview({
  userId,
  orderId,
  item,
}: {
  userId: string | number;
  orderId: string;
  item: CustomerReviewState;
}) {
  const mutation = useCustomerReview(userId, orderId, item.orderItemId);
  const [editing, setEditing] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [version, setVersion] = useState(item.reviewVersion);
  const [conflict, setConflict] = useState<'none' | 'loaded' | 'failed'>('none');
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState('');
  const id = useId();
  const form = useForm<
    z.input<typeof saveCustomerReviewSchema>,
    unknown,
    z.output<typeof saveCustomerReviewSchema>
  >({
    resolver: zodResolver(saveCustomerReviewSchema),
    defaultValues: {
      expectedVersion: item.reviewVersion,
      rating: item.review?.rating ?? 0,
      reviewText: item.review?.reviewText ?? '',
    },
  });
  const text = useWatch({ control: form.control, name: 'reviewText' }) ?? '';
  function open() {
    setHoveredRating(null);
    form.reset({
      expectedVersion: item.reviewVersion,
      rating: item.review?.rating ?? 0,
      reviewText: item.review?.reviewText ?? '',
    });
    setVersion(item.reviewVersion);
    setConflict('none');
    setError('');
    setEditing(true);
  }
  async function write(write: Parameters<typeof mutation.mutateAsync>[0]) {
    setError('');
    try {
      const result = await mutation.mutateAsync(write);
      if (result.kind === 'saved') {
        setEditing(false);
        setConflict('none');
        toast.success(write.action === 'delete' ? 'Review deleted.' : 'Review saved.');
      } else if (result.kind === 'conflict') {
        setVersion(result.current.reviewVersion);
        setConflict('loaded');
      } else setConflict('failed');
    } catch (error) {
      setError(
        error instanceof ApiError && error.status < 500 && error.status > 0
          ? error.message
          : 'Could not save your changes. Please try again.',
      );
    }
  }
  async function reload() {
    setReloading(true);
    try {
      const current = await mutation.reload();
      setVersion(current.reviewVersion);
      setConflict('loaded');
    } catch {
      setConflict('failed');
    } finally {
      setReloading(false);
    }
  }
  if (!item.canReview && !item.review && !editing) return null;
  const disabled = mutation.isPending || reloading;
  const review = item.review;
  return (
    <section
      aria-label="Your product review"
      className="space-y-4 border-t border-border-control pt-4"
    >
      {review && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-text-primary">Your review</h4>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <div role="img" aria-label={`${review.rating} out of 5`} className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    aria-hidden="true"
                    className={`h-4 w-4 ${rating <= review.rating ? 'fill-current text-accent-active' : 'text-text-tertiary'}`}
                  />
                ))}
              </div>
              {review.reviewText && (
                <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-text-secondary">
                  {review.reviewText}
                </p>
              )}
            </div>
            {!editing && item.canReview && (
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-9 w-9 rounded-md"
                  aria-label="Edit review"
                  onClick={open}
                  disabled={disabled}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-9 w-9 rounded-md text-danger hover:bg-danger-subtle hover:text-danger"
                  aria-label="Delete review"
                  disabled={disabled}
                  onClick={() =>
                    void write({ action: 'delete', expectedVersion: item.reviewVersion })
                  }
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      {conflict === 'loaded' && !item.review && (
        <p className="text-sm text-text-secondary">No review is saved.</p>
      )}
      {!editing && item.canReview && !item.review && (
        <div>
          <Button type="button" variant="outline" size="sm" onClick={open} disabled={disabled}>
            Submit a Review
          </Button>
        </div>
      )}
      {conflict !== 'none' && (
        <div role="alert" className="space-y-2 text-sm text-text-secondary">
          <p>
            {conflict === 'loaded'
              ? 'This review changed. The saved review is shown above. Your input is unchanged. Check it before you save again.'
              : 'This review changed, but the saved review could not be loaded. Your input is unchanged. Reload before you save again.'}
          </p>
          {conflict === 'failed' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => void reload()}
            >
              Reload saved review
            </Button>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {editing && (
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit((values) =>
            write({ action: 'save', input: { ...values, expectedVersion: version } }),
          )}
        >
          <fieldset disabled={disabled} className="space-y-3">
            <legend id={`${id}-rating-label`} className="text-sm font-medium">
              Your rating
            </legend>
            <Controller
              control={form.control}
              name="rating"
              render={({ field }) => (
                <RadioGroup
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  inputRef={field.ref}
                  aria-labelledby={`${id}-rating-label`}
                  aria-describedby={form.formState.errors.rating ? `${id}-rating-error` : undefined}
                  aria-invalid={!!form.formState.errors.rating}
                  className="flex gap-2"
                  disabled={disabled}
                  onPointerLeave={() => setHoveredRating(null)}
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Radio.Root
                      key={rating}
                      value={rating}
                      aria-label={`${rating} ${rating === 1 ? 'star' : 'stars'}`}
                      onPointerEnter={() => setHoveredRating(rating)}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border-control text-text-secondary transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-border-focus data-checked:border-accent-active data-checked:bg-accent-subtle data-checked:text-accent-active"
                    >
                      <Star
                        aria-hidden="true"
                        className={`h-5 w-5 ${rating <= (hoveredRating ?? field.value) ? 'fill-current text-accent-active' : ''}`}
                      />
                    </Radio.Root>
                  ))}
                </RadioGroup>
              )}
            />
            {form.formState.errors.rating && (
              <p id={`${id}-rating-error`} role="alert" className="text-sm text-danger">
                Select a rating from 1 to 5 stars.
              </p>
            )}
          </fieldset>
          <FormField name="reviewText" invalid={!!form.formState.errors.reviewText}>
            <label htmlFor={`${id}-text`} className="text-sm font-medium">
              Your review <span className="font-normal text-text-tertiary">(optional)</span>
            </label>
            <textarea
              id={`${id}-text`}
              {...form.register('reviewText')}
              disabled={disabled}
              rows={4}
              aria-describedby={`${id}-count ${form.formState.errors.reviewText ? `${id}-text-error` : ''}`}
              aria-invalid={!!form.formState.errors.reviewText}
              className="w-full resize-y rounded-lg border border-border-control bg-surface-raised px-3 py-2 text-sm text-text-primary outline-none focus:border-border-focus disabled:opacity-50"
            />
            <p id={`${id}-count`} className="text-xs text-text-tertiary">
              {Array.from(text.trim()).length.toLocaleString()} / 2,000 characters
            </p>
            {form.formState.errors.reviewText && (
              <p id={`${id}-text-error`} role="alert" className="text-sm text-danger">
                {form.formState.errors.reviewText.message}
              </p>
            )}
          </FormField>
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              size="sm"
              isLoading={mutation.isPending}
              disabled={disabled || conflict === 'failed' || !item.canReview}
            >
              {conflict === 'loaded' ? 'Save my changes' : 'Save review'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => {
                setEditing(false);
                setConflict('none');
                setError('');
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
