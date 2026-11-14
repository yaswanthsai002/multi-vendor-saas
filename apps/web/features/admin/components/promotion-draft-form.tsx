'use client';

import { Dialog } from '@base-ui-components/react/dialog';
import { ImagePlus, Plus, Save, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { MediaPickerModal } from '@/features/media/components/media-picker-modal';
import { MarketingBanner } from '@/shared/components/marketing-banner';

import { PromotionSelectedProducts } from './promotion-editor-fields';
import { MAX_PROMOTION_PRODUCTS, PromotionProductPicker } from './promotion-product-picker';

import type { PromotionFormInput, PromotionFormValues } from './promotion-editor-schema';
import type { PromotionProductSelection } from './promotion-product-picker';
import type { MediaItem } from '@/features/media/types/media.types';
import type { UseFormReturn } from 'react-hook-form';

const destinations = [
  { value: '/products', label: 'All products' },
  { value: '/products?isFeatured=true', label: 'Featured products' },
  { value: '/products?sortBy=newest', label: 'New arrivals' },
  { value: '/brands', label: 'Brands' },
];

export function PromotionDraftForm({
  form,
  products,
  onProductsChange,
  onUpload,
  onSelectMedia,
  uploading,
  savePending,
  discardPending,
  publishPending,
  error,
  onSave,
  onPublish,
  onCancel,
}: {
  form: UseFormReturn<PromotionFormInput, unknown, PromotionFormValues>;
  products: PromotionProductSelection[];
  onProductsChange: (products: PromotionProductSelection[]) => void;
  onUpload: (
    file: File,
    slot: 'desktop' | 'mobile',
    onProgress: (percent: number) => void,
  ) => Promise<void>;
  onSelectMedia: (media: MediaItem, slot: 'desktop' | 'mobile') => void;
  uploading: boolean;
  savePending: boolean;
  discardPending: boolean;
  publishPending: boolean;
  error: string;
  onSave: () => void;
  onPublish: () => void;
  onCancel: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlot, setPickerSlot] = useState<'desktop' | 'mobile'>('desktop');
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  const values = form.watch();

  const field = (name: keyof PromotionFormValues, label: string, type = 'text') => (
    <FormField name={name} className="space-y-1.5">
      <Label htmlFor={`promotion-${name}`}>{label}</Label>
      <Input
        id={`promotion-${name}`}
        type={type}
        className="cursor-text"
        min={name === 'position' ? 1 : undefined}
        {...form.register(name)}
      />
      {form.formState.errors[name]?.message && (
        <p className="text-xs text-danger">{form.formState.errors[name]?.message}</p>
      )}
    </FormField>
  );

  const chooseMedia = (slot: 'desktop' | 'mobile') => {
    setPickerSlot(slot);
    setPickerOpen(true);
  };

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onPublish();
        }}
        className="grid gap-8 pb-24 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,1fr)]"
      >
        <div className="space-y-7">
          <section className="space-y-4 border-b border-border-subtle pb-7">
            <div className="flex items-center gap-3">
              <span className="w-8 shrink-0 font-mono text-sm tabular-nums text-text-tertiary">
                01
              </span>
              <div>
                <h2 className="font-semibold text-text-primary">Campaign details</h2>
                <p className="text-sm text-text-secondary">Copy shown on the campaign banner.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('eyebrow', 'Banner label')}
              {field('title', 'Promotion headline')}
              <FormField name="subtitle" className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="promotion-subtitle">Supporting text</Label>
                <textarea
                  id="promotion-subtitle"
                  rows={2}
                  className="w-full rounded-md border border-border-control bg-surface-raised px-3 py-2 text-sm text-text-primary cursor-text"
                  {...form.register('subtitle')}
                />
              </FormField>
              {field('ctaLabel', 'Button label')}
              <FormField name="ctaHref" className="space-y-1.5">
                <Label htmlFor="promotion-destination">Button destination</Label>
                <Select
                  value={form.watch('ctaHref')}
                  onValueChange={(value) => form.setValue('ctaHref', value, { shouldDirty: true })}
                  options={destinations}
                  triggerClassName="h-10 w-full text-sm"
                  className="text-sm"
                  aria-label="Button destination"
                />
              </FormField>
            </div>
          </section>

          <section className="space-y-4 border-b border-border-subtle pb-7">
            <div className="flex items-center gap-3">
              <span className="w-8 shrink-0 font-mono text-sm tabular-nums text-text-tertiary">
                02
              </span>
              <div>
                <h2 className="font-semibold text-text-primary">Banner images</h2>
                <p className="text-sm text-text-secondary">
                  Choose an image from the media library or upload a new campaign image.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(['desktop', 'mobile'] as const).map((slot) => {
                const url = slot === 'desktop' ? values.imageUrl : values.mobileImageUrl;
                const label = slot === 'desktop' ? 'Desktop image' : 'Mobile image (optional)';
                return (
                  <div key={slot} className="space-y-2">
                    <p className="text-sm font-medium text-text-primary">{label}</p>
                    {url ? (
                      <div className="relative h-36 overflow-hidden rounded-lg border border-border-default bg-surface-subtle">
                        <Image
                          src={url}
                          alt={`${label} preview`}
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-default bg-surface-subtle text-center">
                        <ImagePlus size={20} aria-hidden="true" className="text-text-secondary" />
                        <p className="text-sm text-text-secondary">No image selected</p>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploading}
                      onClick={() => chooseMedia(slot)}
                    >
                      {url ? 'Change image' : 'Choose image'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-4 border-b border-border-subtle pb-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 shrink-0 font-mono text-sm tabular-nums text-text-tertiary">
                  03
                </span>
                <div>
                  <h2 className="font-semibold text-text-primary">Products &amp; pricing</h2>
                  <p className="text-sm text-text-secondary">
                    Choose products and set a deal price for each.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={products.length >= MAX_PROMOTION_PRODUCTS}
                onClick={() => setProductPickerOpen(true)}
              >
                <Plus size={16} aria-hidden="true" />
                Add products
              </Button>
            </div>
            <PromotionSelectedProducts products={products} onChange={onProductsChange} />
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 shrink-0 font-mono text-sm tabular-nums text-text-tertiary">
                04
              </span>
              <div>
                <h2 className="font-semibold text-text-primary">Schedule &amp; placement</h2>
                <p className="text-sm text-text-secondary">
                  Choose when it runs and its homepage order.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('startsAt', 'Start date and time', 'datetime-local')}
              {field('endsAt', 'End date and time', 'datetime-local')}
              {field('position', 'Display priority', 'number')}
              <p className="self-end pb-2 text-xs text-text-secondary">
                1 appears first when promotions overlap.
              </p>
            </div>
          </section>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-5 xl:self-start">
          <section className="space-y-4 rounded-xl border border-border-default bg-surface-raised p-5">
            <div>
              <h2 className="font-semibold text-text-primary">Live preview</h2>
              <p className="text-sm text-text-secondary">Preview updates as you edit.</p>
            </div>
            <div className="grid grid-cols-2 rounded-lg border border-border-default p-1">
              {(['desktop', 'mobile'] as const).map((viewport) => (
                <Button
                  key={viewport}
                  type="button"
                  size="sm"
                  variant={previewViewport === viewport ? 'secondary' : 'ghost'}
                  onClick={() => setPreviewViewport(viewport)}
                >
                  {viewport === 'desktop' ? 'Desktop' : 'Mobile'}
                </Button>
              ))}
            </div>
            <div className={previewViewport === 'mobile' ? 'mx-auto w-full max-w-xs' : 'w-full'}>
              <MarketingBanner
                eyebrow={values.eyebrow}
                title={values.title}
                subtitle={values.subtitle}
                imageUrl={values.imageUrl}
                mobileImageUrl={values.mobileImageUrl || undefined}
                ctaLabel={values.ctaLabel}
                href={values.ctaHref}
                preview
                viewport={previewViewport}
              />
            </div>
          </section>
          <section className="rounded-xl border border-border-default bg-surface-raised p-5">
            <h2 className="font-semibold text-text-primary">Publish checklist</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {[
                [Boolean(values.imageUrl), 'Add a desktop banner image'],
                [
                  Boolean(values.eyebrow && values.title && values.ctaLabel),
                  'Complete campaign content',
                ],
                [
                  products.length > 0 && products.every((item) => item.dealPrice.trim()),
                  'Add products and deal prices',
                ],
                [Boolean(values.startsAt && values.endsAt), 'Set promotion schedule'],
              ].map(([done, label]) => (
                <li key={String(label)} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`h-4 w-4 rounded-full border ${done ? 'border-success bg-success' : 'border-border-strong'}`}
                  />
                  {label}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </form>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border-default bg-surface-raised/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setCancelOpen(true)}>
            <X size={16} aria-hidden="true" />
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={savePending || uploading}
            onClick={onSave}
          >
            <Save size={16} aria-hidden="true" />
            Save draft
          </Button>
          <Button
            type="button"
            disabled={publishPending || uploading}
            isLoading={publishPending}
            onClick={onPublish}
          >
            <Save size={16} aria-hidden="true" />
            Save &amp; Publish
          </Button>
        </div>
      </div>
      <Dialog.Root open={cancelOpen} onOpenChange={setCancelOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/55" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border-default bg-surface-raised p-5 text-text-primary shadow-xl">
            <Dialog.Title className="text-lg font-semibold">Discard this promotion?</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-text-secondary">
              This deletes the saved draft and its uploaded banner images.
            </Dialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCancelOpen(false)}>
                Keep editing
              </Button>
              <Button type="button" variant="danger" disabled={discardPending} onClick={onCancel}>
                Discard draft
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={(items) => items[0] && onSelectMedia(items[0], pickerSlot)}
        title="Choose a banner image"
        description="Choose an existing image or upload a new campaign banner."
        acceptedType="image"
        mediaScope="catalog"
        maxUploadFiles={1}
        uploadAccept=".jpg,.jpeg,.png,.webp"
        onUploadFiles={async (files, onProgress) => {
          const file = files[0];
          if (file) await onUpload(file, pickerSlot, onProgress);
        }}
      />
      <PromotionProductPicker
        open={productPickerOpen}
        selected={products}
        onOpenChange={setProductPickerOpen}
        onApply={onProductsChange}
      />
    </>
  );
}
