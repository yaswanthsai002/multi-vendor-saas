'use client';

import { Check, Copy } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import type { DeliveryAddressDetail } from '../types/order.types';

interface OrderDeliveryCardProps {
  address: DeliveryAddressDetail | null;
}

export function OrderDeliveryCard({ address }: OrderDeliveryCardProps) {
  const [copied, setCopied] = React.useState(false);

  if (!address) {
    return (
      <div className="border-t border-border-default pt-6">
        <h3 className="text-base font-semibold text-text-primary mb-2">Delivery address</h3>
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
    <div className="border-t border-border-default pt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-text-primary">Delivery address</h3>
        </div>

        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={handleCopy}
          aria-label="Copy address"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-success" />
              <span className="text-success">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      <div className="text-xs sm:text-sm text-text-secondary space-y-1">
        <p className="font-semibold text-text-primary">{address.recipientName}</p>
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p className="font-medium text-text-tertiary  text-xs mt-1">{address.country}</p>
        {address.phone && <p className="pt-2 text-text-tertiary">Phone: {address.phone}</p>}
      </div>
    </div>
  );
}
