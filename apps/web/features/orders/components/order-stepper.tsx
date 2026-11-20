import { Check } from 'lucide-react';

import type { VendorOrderStatus } from '../types/order.types';

export function OrderStepper({
  status,
  cancellationReason,
}: {
  status: VendorOrderStatus;
  cancellationReason?: string | null;
}) {
  if (status === 'cancelled')
    return (
      <section className="border-b border-border-default pb-6">
        <h2 className="text-base font-semibold">Order cancelled</h2>
        <p className="mt-2 text-sm text-text-secondary">
          {cancellationReason
            ? `Reason: ${cancellationReason}`
            : 'This order is closed and cannot be fulfilled'}
        </p>
      </section>
    );
  const steps = [
    { id: 'pending', label: 'Received' },
    { id: 'processing', label: 'Processing' },
    { id: 'completed', label: 'Completed' },
  ];
  const current = steps.findIndex((step) => step.id === status);
  return (
    <section aria-label="Fulfillment progress">
      <h2 className="mb-5 text-base font-semibold">Fulfillment progress</h2>
      <ol className="flex items-start">
        {steps.map((step, index) => {
          const completed = index < current || status === 'completed';
          return (
            <li
              key={step.id}
              aria-current={index === current ? 'step' : undefined}
              className="relative flex-1 last:flex-none last:text-right"
            >
              {index < 2 && (
                <span
                  aria-hidden
                  className={`absolute left-8 right-0 top-4 h-px ${index < current ? 'bg-success' : 'bg-border-control'}`}
                />
              )}
              <span
                className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs ${completed ? 'border-success bg-success text-white' : index === current ? 'border-accent bg-surface text-accent' : 'border-border-control bg-surface text-text-tertiary'}`}
              >
                {completed ? <Check className="h-4 w-4" aria-label="Step completed" /> : index + 1}
              </span>
              <p className="mt-3 text-sm font-medium text-text-primary">{step.label}</p>
            </li>
          );
        })}
      </ol>
      {status === 'completed' && (
        <p className="mt-4 text-sm text-text-secondary">Marked complete by the seller</p>
      )}
    </section>
  );
}
