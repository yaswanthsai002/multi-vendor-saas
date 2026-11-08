'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import {
  useAdminPromotionDraft,
  useCreateAdminPromotionDraft,
  useDiscardAdminPromotionDraft,
  usePublishAdminPromotionDraft,
  useSaveAdminPromotionDraft,
} from '../hooks/use-admin';
import { adminService } from '../services/admin.service';

import { PromotionDraftForm } from './promotion-draft-form';
import { PromotionEditorHeading, PromotionEditorLoadError } from './promotion-editor-fields';
import { emptyPromotionForm, localDateTime, promotionFormSchema } from './promotion-editor-schema';

import type { PromotionFormInput, PromotionFormValues } from './promotion-editor-schema';
import type { PromotionProductSelection } from './promotion-product-picker';
import type { AdminPromotionDraftPayload } from '../services/admin.service';
import type { MediaItem } from '@/features/media/types/media.types';

function fromPayload(payload: AdminPromotionDraftPayload): PromotionFormInput {
  return {
    ...emptyPromotionForm,
    eyebrow: payload.eyebrow ?? '',
    title: payload.title ?? '',
    subtitle: payload.subtitle ?? '',
    imageUrl: payload.imageUrl ?? '',
    mobileImageUrl: payload.mobileImageUrl ?? '',
    ctaLabel: payload.ctaLabel ?? 'Shop now',
    ctaHref: payload.ctaHref ?? '/products',
    startsAt: payload.startsAt ? localDateTime(payload.startsAt) : '',
    endsAt: payload.endsAt ? localDateTime(payload.endsAt) : '',
    position: (payload.position ?? 0) + 1,
  };
}

function toPayload(
  values: PromotionFormInput,
  products: PromotionProductSelection[],
): AdminPromotionDraftPayload {
  return {
    eyebrow: values.eyebrow,
    title: values.title,
    subtitle: values.subtitle,
    imageUrl: values.imageUrl,
    mobileImageUrl: values.mobileImageUrl,
    ctaLabel: values.ctaLabel,
    ctaHref: values.ctaHref,
    startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : '',
    endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : '',
    position: Math.max(0, Number(values.position) - 1),
    products: products.map(({ productId, dealPrice }) => ({ productId, dealPrice })),
  };
}

export function PromotionEditor({
  draftId,
  campaignId,
}: {
  draftId?: string;
  campaignId?: string;
}) {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState<PromotionProductSelection[]>([]);
  const [uploading, setUploading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [createRetry, setCreateRetry] = useState(0);
  const creating = useRef(false);
  const initializedDraftId = useRef('');
  const isNavigatingAfterAction = useRef(false);
  const flushOnLeave = useRef<() => Promise<void>>(() => Promise.resolve());
  const saveQueue = useRef(Promise.resolve());
  const lastSaved = useRef('');
  const lastQueued = useRef('');
  const draftQuery = useAdminPromotionDraft(draftId ?? '');
  const createDraft = useCreateAdminPromotionDraft();
  const saveDraft = useSaveAdminPromotionDraft();
  const discardDraft = useDiscardAdminPromotionDraft();
  const publishDraft = usePublishAdminPromotionDraft();
  const createPromotionDraft = createDraft.mutateAsync;
  const savePromotionDraft = saveDraft.mutateAsync;
  const draft = draftQuery.data?.draft;
  const hasDraft = Boolean(draft);
  const form = useForm<PromotionFormInput, unknown, PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: emptyPromotionForm,
  });
  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    if (draftId || creating.current) return;
    creating.current = true;
    void createPromotionDraft(campaignId)
      .then(({ draft: created }) => {
        router.replace(`/admin/campaigns/editor?draftId=${created.draftId}`);
      })
      .catch((error: unknown) => {
        creating.current = false;
        setActionError(
          error instanceof Error ? error.message : 'Could not start a promotion draft.',
        );
      });
  }, [campaignId, createPromotionDraft, draftId, router, createRetry]);

  useEffect(() => {
    if (!draft || initializedDraftId.current === draft.draftId) return;
    initializedDraftId.current = draft.draftId;
    form.reset(fromPayload(draft.payload));
    setSelectedProducts((draft.products ?? []).map((product) => ({ ...product })));
    lastSaved.current = JSON.stringify(
      toPayload(
        fromPayload(draft.payload),
        (draft.products ?? []).map((product) => ({ ...product })),
      ),
    );
  }, [draft, form]);

  const saveValues = useCallback(
    (values: PromotionFormInput, products = selectedProducts) => {
      if (!draftId) return Promise.resolve();
      const payload = toPayload(values, products);
      const serialized = JSON.stringify(payload);
      if (serialized === lastSaved.current || serialized === lastQueued.current) {
        return saveQueue.current;
      }
      lastQueued.current = serialized;
      saveQueue.current = saveQueue.current
        .catch(() => undefined)
        .then(async () => {
          if (serialized === lastSaved.current) return;
          await savePromotionDraft({ draftId, data: payload });
          lastSaved.current = serialized;
        })
        .finally(() => {
          if (lastQueued.current === serialized) lastQueued.current = lastSaved.current;
        });
      return saveQueue.current;
    },
    [draftId, savePromotionDraft, selectedProducts],
  );

  useEffect(() => {
    flushOnLeave.current = () => saveValues(form.getValues());
  }, [form, saveValues]);

  useEffect(
    () => () => {
      if (!isNavigatingAfterAction.current) {
        void flushOnLeave.current().catch(() => undefined);
      }
    },
    [],
  );

  useEffect(() => {
    if (!hasDraft || !draftId || !watchedValues) return;
    const timer = window.setTimeout(() => {
      void saveValues(watchedValues as PromotionFormInput).catch((error: unknown) =>
        setActionError(error instanceof Error ? error.message : 'Draft autosave failed.'),
      );
    }, 700);
    return () => window.clearTimeout(timer);
  }, [draftId, hasDraft, watchedValues, selectedProducts, saveValues]);

  if (!draftId) {
    if (actionError) {
      return (
        <PromotionEditorLoadError
          onRetry={() => {
            setActionError('');
            setCreateRetry((attempt) => attempt + 1);
          }}
        />
      );
    }
    return (
      <div
        aria-label="Preparing promotion draft"
        className="h-72 animate-pulse rounded-2xl bg-surface-subtle"
      />
    );
  }
  if (draftQuery.isLoading)
    return (
      <div
        aria-label="Loading promotion draft"
        className="h-96 animate-pulse rounded-2xl bg-surface-subtle"
      />
    );
  if (draftQuery.isError || !draft)
    return <PromotionEditorLoadError onRetry={() => void draftQuery.refetch()} />;

  const uploadBanner = async (
    file: File,
    slot: 'desktop' | 'mobile',
    onProgress: (percent: number) => void,
  ) => {
    setUploading(true);
    setActionError('');
    try {
      const response = await adminService.uploadPromotionDraftBanner(
        draftId,
        slot,
        file,
        onProgress,
      );
      form.setValue(slot === 'desktop' ? 'imageUrl' : 'mobileImageUrl', response.imageUrl, {
        shouldDirty: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Banner upload failed.';
      setActionError(message);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const selectBannerMedia = (media: MediaItem, slot: 'desktop' | 'mobile') => {
    form.setValue(
      slot === 'desktop' ? 'imageUrl' : 'mobileImageUrl',
      media.variants?.large ?? media.original,
      { shouldDirty: true },
    );
  };

  const saveAsDraft = async () => {
    setActionError('');
    try {
      await saveValues(form.getValues());
      await saveQueue.current;
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not save draft.');
    }
  };

  const publish = async () => {
    if (!(await form.trigger())) return;
    const values = form.getValues();
    if (
      !values.imageUrl ||
      !selectedProducts.length ||
      selectedProducts.some((item) => !item.dealPrice.trim())
    ) {
      setActionError('Add a desktop banner, products, and a deal price for each product.');
      return;
    }
    try {
      await saveValues(values, selectedProducts);
      await saveQueue.current;
      await publishDraft.mutateAsync(draftId);
      isNavigatingAfterAction.current = true;
      router.push('/admin/campaigns');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Promotion could not be published.');
    }
  };

  const cancel = async () => {
    try {
      await saveQueue.current.catch(() => undefined);
      await discardDraft.mutateAsync(draftId);
      isNavigatingAfterAction.current = true;
      router.push('/admin/campaigns');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Draft could not be discarded.');
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 pb-24">
      <PromotionEditorHeading isEditing={Boolean(draft.campaignId)} />
      <PromotionDraftForm
        form={form}
        products={selectedProducts}
        onProductsChange={setSelectedProducts}
        onUpload={uploadBanner}
        uploading={uploading}
        savePending={saveDraft.isPending}
        discardPending={discardDraft.isPending}
        publishPending={publishDraft.isPending}
        error={actionError || (saveDraft.error instanceof Error ? saveDraft.error.message : '')}
        onSelectMedia={selectBannerMedia}
        onSave={() => void saveAsDraft()}
        onPublish={() => void publish()}
        onCancel={() => void cancel()}
      />
    </section>
  );
}
