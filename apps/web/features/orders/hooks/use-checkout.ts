'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  checkoutAddressSchema,
  pendingCheckoutSchema,
  type PendingCheckout,
} from '../schemas/customer-order.schema';

import { useCheckoutReview, usePlaceCustomerOrder } from './use-customer-orders';

import type { CheckoutReview } from '../types/customer-order.types';

import { ApiError } from '@/lib/api-client';

const conflictSchema = z.object({ lines: z.array(z.object({ productId: z.string() })) });

export function useCheckout(userId: string | number) {
  const router = useRouter();
  const review = useCheckoutReview(userId);
  const place = usePlaceCustomerOrder(userId);
  const [pending, setPending] = useState<PendingCheckout | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const submitting = useRef(false);
  const storageKey = `perigee.checkout.${userId}`;
  const form = useForm<z.infer<typeof checkoutAddressSchema>>({
    resolver: zodResolver(checkoutAddressSchema),
    values: { addressId: review.data?.addressId ?? '' },
    resetOptions: { keepDirtyValues: true },
  });
  const addressId = useWatch({ control: form.control, name: 'addressId' });

  useEffect(() => {
    function restoreSavedAttempt() {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = pendingCheckoutSchema.safeParse(JSON.parse(saved));
          if (!parsed.success) throw new Error('Invalid saved checkout');
          setPending(parsed.data);
          form.setValue('addressId', parsed.data.request.addressId, { shouldDirty: true });
          toast.info('Select Place order to retry your previous order.', {
            id: 'checkout-placement',
          });
        }
      } catch {
        setStorageError(true);
        toast.error(
          'Could not recover checkout. Check your orders and enable browser storage before trying again.',
          { id: 'checkout-placement' },
        );
      }
      setReady(true);
    }
    restoreSavedAttempt();
  }, [storageKey, form]);

  async function submit(attempt: PendingCheckout) {
    if (submitting.current) return;
    submitting.current = true;
    try {
      const order = await place.mutateAsync(attempt);
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* Replaying a retained key returns the same order. */
      }
      router.replace(`/orders/${order.orderId}?confirmed=1`);
    } catch (failure) {
      const definitive =
        failure instanceof ApiError &&
        [
          'CHECKOUT_CONFLICT',
          'CART_CHANGED',
          'INVALID_DELIVERY_ADDRESS',
          'VALIDATION_ERROR',
        ].includes(failure.code);
      const details =
        failure instanceof ApiError ? conflictSchema.safeParse(failure.details) : null;
      setConflicts(details?.success ? details.data.lines.map((line) => line.productId) : []);
      if (definitive) {
        try {
          localStorage.removeItem(storageKey);
          setPending(null);
        } catch {
          setStorageError(true);
        }
        // A new click confirms the refreshed values after a definitive rejection.
        await review.refetch();
      }
      if (failure instanceof ApiError && failure.code === 'INVALID_DELIVERY_ADDRESS')
        form.setError('addressId', { message: failure.message });
      const message =
        failure instanceof ApiError &&
        failure.status > 0 &&
        failure.status < 500 &&
        failure.status !== 408
          ? failure.message
          : 'Something went wrong. Please try again.';
      toast.error(message, { id: 'checkout-placement' });
      if (failure instanceof ApiError && failure.status === 401)
        router.push('/signin?redirect=%2Fcheckout');
    } finally {
      submitting.current = false;
    }
  }

  async function confirm({ addressId: entered }: { addressId: string }) {
    if (submitting.current || !ready || storageError) return;
    if (pending) {
      await submit(pending);
      return;
    }
    if (!review.data || review.isFetching) return;
    const attempt: PendingCheckout = {
      key: crypto.randomUUID(),
      request: {
        addressId: entered,
        lines: review.data.lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          expectedUnitPrice: line.unitPrice,
        })),
      },
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(attempt));
    } catch {
      toast.error('Could not save checkout request. Enable browser storage and try again.', {
        id: 'checkout-placement',
      });
      return;
    }
    setPending(attempt);
    await submit(attempt);
  }

  let data: CheckoutReview | undefined = review.data;
  if (pending) {
    const lines = pending.request.lines.map((saved) => {
      const current = review.data?.lines.find((line) => line.productId === saved.productId);
      const cents = BigInt(saved.expectedUnitPrice.replace('.', '')) * BigInt(saved.quantity);
      return {
        productId: saved.productId,
        name: current?.name ?? 'Item in your order',
        imageUrl: current?.imageUrl ?? null,
        quantity: saved.quantity,
        unitPrice: saved.expectedUnitPrice,
        subtotal: `${cents / BigInt(100)}.${String(cents % BigInt(100)).padStart(2, '0')}`,
        stock: current?.stock ?? 0,
        available: current?.available ?? true,
      };
    });
    const cents = lines.reduce(
      (sum, line) => sum + BigInt(line.subtotal.replace('.', '')),
      BigInt(0),
    );
    data = {
      lines,
      addresses: review.data?.addresses ?? [],
      addressId: pending.request.addressId,
      addressEligible: true,
      total: `${cents / BigInt(100)}.${String(cents % BigInt(100)).padStart(2, '0')}`,
    };
  }
  return { review, data, place, form, addressId, pending, ready, storageError, conflicts, confirm };
}
