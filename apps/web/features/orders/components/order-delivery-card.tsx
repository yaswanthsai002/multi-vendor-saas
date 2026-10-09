'use client';

import { Check, Copy, MapPin } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import type { DeliveryAddressDetail } from '../types/order.types';

interface OrderDeliveryCardProps {
  address: DeliveryAddressDetail | null;
}

export function OrderDeliveryCard({ address }: OrderDeliveryCardProps) {
  const [copied, setCopied] = React.useState(false);

  if (!address) {
    return (
      <div className="p-5 sm:p-6 rounded-2xl border border-border-default bg-surface-raised dark:bg-surface-raised shadow-xs">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Delivery Address</h3>
        <p className="text-xs sm:text-sm text-text-tertiary">
          No delivery address recorded for this order.
        </p>
      </div>
    );
  }

  const formattedAddress = [
    address.recipientName,
    address.addressLine1,
    address.addressLine2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
  ]
    .filter(Boolean)
    .join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedAddress);
      setCopied(true);
      toast.success('Delivery address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy address');
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-border-default bg-surface-raised dark:bg-surface-raised shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">Delivery Address</h3>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy address"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-border-default bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-600">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="text-xs sm:text-sm text-text-secondary space-y-1">
        <p className="font-semibold text-text-primary">{address.recipientName}</p>
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p className="font-medium text-text-tertiary uppercase text-[11px] mt-1">
          {address.country}
        </p>
        {address.phone && <p className="pt-2 text-text-tertiary">Phone: {address.phone}</p>}
      </div>
    </div>
  );
}
