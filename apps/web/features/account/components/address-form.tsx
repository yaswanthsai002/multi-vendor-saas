'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { usePostalCode } from '../hooks/use-postal-code';
import { addressFormSchema, type AddressFormValues } from '../schemas/account.schema';

import type { CustomerAddress, CustomerAddressInput } from '../types/account.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function AddressForm({
  address,
  isPending,
  onSave,
  onCancel,
}: {
  address?: CustomerAddress;
  isPending: boolean;
  onSave: (input: CustomerAddressInput) => void;
  onCancel: () => void;
}) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      recipientName: address?.recipientName ?? '',
      phone: address?.phone ?? '',
      addressLine1: address?.addressLine1 ?? '',
      postalArea: '',
      streetAddress: address?.addressLine2 ?? '',
      city: address?.city ?? '',
      state: address?.state ?? '',
      postalCode: address?.postalCode ?? '',
      isDefault: address?.isDefault ?? false,
    },
  });
  const postalCode = useWatch({ control: form.control, name: 'postalCode' });
  const postalArea = useWatch({ control: form.control, name: 'postalArea' });
  const postalLookup = usePostalCode(postalCode);

  useEffect(() => {
    const postalAreas = postalLookup.data?.items ?? [];
    const first = postalAreas[0];
    if (!first) return;

    form.clearErrors('postalCode');
    form.setValue('city', first.city, { shouldValidate: true });
    form.setValue('state', first.state, { shouldValidate: true });

    const existingLine2 = address?.addressLine2?.trim() ?? '';
    if (address?.postalCode === postalCode) {
      if (!form.formState.dirtyFields.streetAddress) {
        const matchingArea = postalAreas.find(
          ({ area }) => existingLine2 === area || existingLine2.startsWith(`${area}, `),
        );
        if (matchingArea) {
          form.setValue('postalArea', matchingArea.area);
          form.setValue(
            'streetAddress',
            existingLine2.slice(matchingArea.area.length).replace(/^,\s*/, ''),
          );
        } else if (!existingLine2) {
          form.setValue('postalArea', first.area);
        }
      }
    } else {
      form.setValue('postalArea', first.area);
    }
  }, [address, form, postalCode, postalLookup.data]);

  function field(
    name: keyof Omit<AddressFormValues, 'isDefault' | 'postalArea'>,
    label: string,
    autoComplete?: string,
    inputProps?: { inputMode?: 'numeric'; maxLength?: number },
  ) {
    const error = form.formState.errors[name];
    const id = `address-${name}`;
    return (
      <div>
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
        <Input
          id={id}
          autoComplete={autoComplete}
          {...inputProps}
          isInvalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...form.register(name)}
        />
        {error?.message && (
          <p id={`${id}-error`} className="text-sm text-danger">
            {error.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => {
        if (!postalLookup.data?.items.length) {
          form.setError('postalCode', {
            type: 'validate',
            message: postalLookup.isError
              ? 'Could not verify this PIN code. Try again.'
              : 'Enter a PIN code found in postal records.',
          });
          return;
        }

        const addressLine2 =
          [values.postalArea, values.streetAddress].filter(Boolean).join(', ') || null;
        if (addressLine2 && addressLine2.length > 200) {
          form.setError('streetAddress', {
            type: 'maxLength',
            message: 'Keep area and street details under 200 characters.',
          });
          return;
        }

        onSave({
          recipientName: values.recipientName,
          phone: values.phone,
          addressLine1: values.addressLine1,
          addressLine2,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: 'IN',
          isDefault: values.isDefault,
        });
      })}
    >
      <section className="rounded-xl border border-border-default bg-surface-raised p-4 sm:p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Recipient and contact</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('recipientName', 'Recipient name', 'name')}
          {field('phone', 'Phone', 'tel')}
        </div>
      </section>

      <section className="rounded-xl border border-border-default bg-surface-raised p-4 sm:p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Delivery address</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('addressLine1', 'House, flat or building', 'address-line1')}
          {field('streetAddress', 'Street, road or landmark (optional)', 'address-line2')}
          {field('postalCode', 'Indian PIN code', 'postal-code', {
            inputMode: 'numeric',
            maxLength: 6,
          })}
          <div>
            <label htmlFor="address-postal-area" className="text-sm font-medium text-text-primary">
              Area or post office
            </label>
            {postalLookup.data?.items.length ? (
              <Select
                aria-label="Area or post office"
                value={postalArea}
                onValueChange={(value) =>
                  form.setValue('postalArea', value, { shouldValidate: true })
                }
                options={postalLookup.data.items.map(({ area }) => ({ value: area, label: area }))}
                placeholder="Choose area"
                triggerClassName="mt-1 h-control-md w-full rounded-md px-3 text-sm"
              />
            ) : (
              <Input
                id="address-postal-area"
                value="Enter a valid PIN to find areas"
                readOnly
                aria-label="Area or post office"
              />
            )}
            {postalLookup.isFetching && (
              <p className="mt-1 text-xs text-text-secondary" role="status">
                Looking up PIN code…
              </p>
            )}
            {postalLookup.isError && (
              <div className="mt-1 flex items-center gap-2 text-xs text-danger">
                <span>Could not check this PIN code.</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void postalLookup.refetch()}
                >
                  Try again
                </Button>
              </div>
            )}
            {postalLookup.data && !postalLookup.data.items.length && (
              <p className="mt-1 text-xs text-danger">PIN code not found. Check and try again.</p>
            )}
          </div>
          {field('city', 'City or town', 'address-level2')}
          {field('state', 'State or union territory', 'address-level1')}
          <div className="flex items-center gap-2 self-end rounded-lg border border-border-default px-3 py-3">
            <input
              id="address-default"
              type="checkbox"
              className="h-4 w-4 cursor-pointer accent-accent"
              {...form.register('isDefault')}
            />
            <label htmlFor="address-default" className="cursor-pointer text-sm text-text-primary">
              Set as default address
            </label>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          size="md"
          className="rounded-lg px-5"
          isLoading={isPending || postalLookup.isFetching}
          disabled={
            postalLookup.isFetching || Boolean(postalLookup.data && !postalLookup.data.items.length)
          }
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          {address ? 'Save address' : 'Add address'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="md"
          className="rounded-lg px-5"
          onClick={onCancel}
          disabled={isPending}
        >
          <X className="h-4 w-4" aria-hidden="true" /> Cancel
        </Button>
      </div>
    </form>
  );
}
