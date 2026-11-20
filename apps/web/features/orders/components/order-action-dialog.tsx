'use client';

import { Dialog } from '@base-ui-components/react/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { type z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

import {
  cancellationReasons,
  vendorOrderActionSchema,
} from '../schemas/vendor-order-action.schema';

import type { OrderItemDetail, UpdateOrderStatusInput } from '../types/order.types';

const cancellationSchema = vendorOrderActionSchema.options[2];
type CancellationForm = z.infer<typeof cancellationSchema>;

export function OrderActionDialog({
  isOpen,
  onClose,
  action,
  onConfirm,
  isLoading,
  items,
}: {
  isOpen: boolean;
  onClose: () => void;
  action: 'cancel' | null;
  onConfirm: (data: UpdateOrderStatusInput) => void;
  isLoading: boolean;
  items: OrderItemDetail[];
}) {
  const form = useForm<CancellationForm>({
    resolver: zodResolver(cancellationSchema),
    defaultValues: {
      status: 'cancelled',
      cancellationReasonCode: 'OUT_OF_STOCK',
      cancellationDetails: '',
      items: items.map((item) => ({
        orderItemId: item.orderItemId,
        damagedQuantity: 0,
        missingQuantity: 0,
      })),
    },
  });
  const quantities = useWatch({ control: form.control, name: 'items' });
  const title = 'Cancel order';
  const submitCancellation = form.handleSubmit((data) => {
    let valid = true;
    data.items.forEach((item, index) => {
      if (item.damagedQuantity + item.missingQuantity > items[index].quantity) {
        form.setError(`items.${index}.damagedQuantity`, {
          message: 'Damaged and missing units cannot exceed the ordered quantity.',
        });
        valid = false;
      }
    });
    if (valid) onConfirm(data);
  });
  return (
    <Dialog.Root
      open={isOpen && action !== null}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-11/12 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border-control bg-surface-raised p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-text-primary">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-text-secondary">
            Review every item before cancellation. Only units suitable for sale return to available
            stock.
          </Dialog.Description>
          <form
            className="mt-6 space-y-5"
            onSubmit={(event) => {
              void submitCancellation(event);
            }}
          >
            <Controller
              control={form.control}
              name="cancellationReasonCode"
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Cancellation reason</label>
                  <Select
                    aria-label="Cancellation reason"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={cancellationReasons}
                    triggerClassName="w-full"
                  />
                </div>
              )}
            />
            <div>
              <label htmlFor="cancel-details" className="block text-sm font-medium">
                Additional details for administrators
              </label>
              <p id="cancel-details-help" className="my-2 text-xs text-text-secondary">
                Only administrators can retrieve this text after submission. Required for Other
                reason. Maximum 500 characters.
              </p>
              <textarea
                id="cancel-details"
                {...form.register('cancellationDetails')}
                maxLength={500}
                rows={3}
                aria-describedby="cancel-details-help cancel-details-error"
                aria-invalid={Boolean(form.formState.errors.cancellationDetails)}
                className="w-full rounded-lg border border-border-control bg-surface px-3 py-2 text-sm"
              />
              <p id="cancel-details-error" className="text-sm text-danger">
                {form.formState.errors.cancellationDetails?.message}
              </p>
            </div>
            <div className="divide-y divide-border-control">
              {items.map((item, index) => (
                <fieldset key={item.orderItemId} className="py-4">
                  <legend className="text-sm font-medium">
                    {item.productName} · {item.quantity} ordered
                  </legend>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`damaged-${index}`} className="text-xs text-text-secondary">
                        Damaged or unsuitable units
                      </label>
                      <Input
                        id={`damaged-${index}`}
                        type="number"
                        min={0}
                        max={item.quantity}
                        step={1}
                        {...form.register(`items.${index}.damagedQuantity`, {
                          valueAsNumber: true,
                        })}
                        aria-invalid={Boolean(
                          form.formState.errors.items?.[index]?.damagedQuantity,
                        )}
                        aria-describedby={`quantity-error-${index}`}
                      />
                    </div>
                    <div>
                      <label htmlFor={`missing-${index}`} className="text-xs text-text-secondary">
                        Missing units
                      </label>
                      <Input
                        id={`missing-${index}`}
                        type="number"
                        min={0}
                        max={item.quantity}
                        step={1}
                        {...form.register(`items.${index}.missingQuantity`, {
                          valueAsNumber: true,
                        })}
                        aria-invalid={Boolean(
                          form.formState.errors.items?.[index]?.missingQuantity,
                        )}
                        aria-describedby={`quantity-error-${index}`}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-sm">
                    Return to available stock:{' '}
                    {Math.max(
                      0,
                      item.quantity -
                        (quantities[index]?.damagedQuantity || 0) -
                        (quantities[index]?.missingQuantity || 0),
                    )}
                  </p>
                  <p id={`quantity-error-${index}`} className="text-sm text-danger">
                    {form.formState.errors.items?.[index]?.damagedQuantity?.message ??
                      form.formState.errors.items?.[index]?.missingQuantity?.message}
                  </p>
                </fieldset>
              ))}
            </div>
            {Object.keys(form.formState.errors).length > 0 && (
              <p role="alert" className="text-sm text-danger">
                Review the highlighted fields before cancellation.
              </p>
            )}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" disabled={isLoading} onClick={onClose}>
                Back
              </Button>
              <Button type="submit" variant="danger" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Cancel order'}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
