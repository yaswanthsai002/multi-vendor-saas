'use client';

import { Select } from '@base-ui-components/react/select';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import Link from 'next/link';

import type { CheckoutReview } from '../types/customer-order.types';

export function CheckoutAddress({
  addresses,
  value,
  onChange,
  error,
  retrying = false,
}: {
  addresses: CheckoutReview['addresses'];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  retrying?: boolean;
}) {
  const selected = addresses.find((address) => address.addressId === value);
  return (
    <section
      aria-labelledby="delivery-heading"
      className="rounded-xl border border-border-subtle bg-surface-raised p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="delivery-heading" className="text-lg font-semibold text-text-primary">
          Delivery address
        </h2>
        {addresses.length > 0 && (
          <Select.Root
            value={value}
            onValueChange={(next) => {
              if (next) onChange(next);
            }}
          >
            <Select.Trigger
              aria-label="Delivery address"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'address-error' : undefined}
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-border-default px-3 text-sm font-medium text-text-secondary outline-none transition-colors hover:bg-surface-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              Change address{' '}
              <Select.Icon>
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner
                side="bottom"
                align="end"
                sideOffset={8}
                alignItemWithTrigger={false}
                collisionPadding={16}
                className="z-50"
              >
                <Select.Popup className="max-h-96 w-80 max-w-full overflow-y-auto rounded-xl border border-border-default bg-surface-raised p-2 text-text-primary shadow-lg outline-none">
                  <Select.List aria-label="Saved delivery addresses" className="space-y-1">
                    {addresses.map((address) => (
                      <Select.Item
                        key={address.addressId}
                        value={address.addressId}
                        disabled={address.country !== 'IN'}
                        className="flex cursor-pointer items-start gap-3 rounded-lg p-3 outline-none transition-colors hover:bg-surface-hover focus:bg-surface-hover data-[selected]:bg-surface-subtle data-[disabled]:opacity-50"
                      >
                        <Select.ItemText className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">
                            {address.recipientName}
                            {address.isDefault && (
                              <span className="ml-2 text-xs font-normal text-text-tertiary">
                                Default
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block break-words text-sm leading-relaxed text-text-secondary">
                            {address.addressLine1}
                            {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                          </span>
                          <span className="mt-1 block text-xs text-text-tertiary">
                            {address.city}, {address.state} {address.postalCode}
                          </span>
                          <span className="mt-1 block text-xs text-text-tertiary">
                            {address.phone}
                            {address.country !== 'IN' ? ' · Delivery available in India only' : ''}
                          </span>
                        </Select.ItemText>
                        <Select.ItemIndicator className="mt-1 shrink-0">
                          <Check className="h-4 w-4 text-accent" aria-hidden="true" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        )}
      </div>
      {selected ? (
        <div className="mt-5 flex items-start gap-3">
          <MapPin className="mt-1 h-4 w-4 shrink-0 text-text-tertiary" aria-hidden="true" />
          <address className="min-w-0 text-sm not-italic leading-relaxed text-text-secondary">
            <p className="mb-1 font-medium text-text-primary">{selected.recipientName}</p>
            <p className="break-words">{selected.addressLine1}</p>
            {selected.addressLine2 && <p className="break-words">{selected.addressLine2}</p>}
            <p>
              {selected.city}, {selected.state} {selected.postalCode}
            </p>
            <p className="mt-2 text-text-tertiary">{selected.phone}</p>
          </address>
        </div>
      ) : (
        <p className="mt-4 text-sm text-text-secondary">
          {retrying
            ? 'Retrying with your previously selected delivery address'
            : addresses.length
              ? 'Choose a delivery address'
              : 'Add an Indian delivery address to continue'}
        </p>
      )}
      {error && (
        <p id="address-error" role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}
      <Link
        href="/account#addresses"
        className="mt-5 inline-flex text-sm font-medium text-text-secondary underline decoration-border-strong underline-offset-4 hover:text-text-primary"
      >
        Manage addresses
      </Link>
    </section>
  );
}
