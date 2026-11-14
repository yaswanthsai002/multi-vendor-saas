import { Check, Clock3, X } from 'lucide-react';

import { CustomerOrderStatusBadge } from './customer-order-status';

import type { CustomerOrder } from '../types/customer-order.types';

const statusDescriptions = {
  'Order placed': 'Your order has been received',
  'In progress': 'Your order is being processed',
  'Partially cancelled': 'Some items have been cancelled. Check each item for its current status.',
  'Partially fulfilled': 'Some items are completed. Check each item for its current status.',
  Completed: 'All items in this order are completed',
  Cancelled: 'All items in this order have been cancelled',
} satisfies Record<CustomerOrder['status'], string>;

export function CustomerOrderProgress({
  status,
  placedAt,
  items,
}: Pick<CustomerOrder, 'status' | 'placedAt' | 'items'>) {
  const completed = status === 'Completed';
  const cancelled = status === 'Cancelled';
  const processing =
    status === 'In progress' ||
    status === 'Partially fulfilled' ||
    items.some((item) => item.status === 'processing' || item.status === 'completed');
  const currentStep = cancelled ? -1 : completed ? 2 : processing ? 1 : 0;
  const steps = [
    { label: 'Order placed', complete: true },
    { label: 'In progress', complete: completed },
    { label: 'Completed', complete: completed },
  ];
  const partial = status === 'Partially cancelled' || status === 'Partially fulfilled';
  return (
    <aside
      aria-labelledby="order-status-heading"
      className="border-t border-border-control py-8 lg:border-t-0 lg:border-l lg:pl-8"
    >
      <h2 id="order-status-heading" className="text-lg font-medium">
        Order status
      </h2>
      <ol aria-label="Order timeline" className="mt-6">
        {steps.map((step, index) => {
          const current = currentStep === index;
          return (
            <li key={step.label} className="flex gap-3" aria-current={current ? 'step' : undefined}>
              <div className="flex w-6 shrink-0 flex-col items-center">
                <span
                  aria-hidden="true"
                  className={`flex h-6 w-6 items-center justify-center rounded-full border ${step.complete ? 'border-success bg-success text-text-inverse' : current ? 'border-info text-info' : 'border-border-control text-text-tertiary'}`}
                >
                  {step.complete ? (
                    <Check className="h-4 w-4" strokeWidth={1.5} />
                  ) : current ? (
                    <Clock3 className="h-4 w-4" strokeWidth={1.5} />
                  ) : null}
                </span>
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`my-2 w-px flex-1 ${step.complete && steps[index + 1].complete ? 'bg-success' : 'bg-border-control'}`}
                  />
                )}
              </div>
              <div className={`min-w-0 space-y-2 ${index < steps.length - 1 ? 'pb-8' : ''}`}>
                <p
                  className={`text-sm font-medium ${step.complete || current ? 'text-text-primary' : 'text-text-tertiary'}`}
                >
                  {step.label}
                </p>
                {(!current || step.complete) && (
                  <span className="sr-only">
                    {step.complete ? 'Step completed' : 'Not completed'}
                  </span>
                )}
                {index === 0 && (
                  <time
                    dateTime={placedAt}
                    className="block text-sm leading-relaxed text-text-secondary"
                  >
                    {new Intl.DateTimeFormat('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(placedAt))}
                  </time>
                )}
                {current && !step.complete && (
                  <p className="text-xs text-text-secondary">Current step</p>
                )}
              </div>
            </li>
          );
        })}
        {cancelled && (
          <li className="mt-8 flex gap-3" aria-current="step">
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-danger text-danger"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <CustomerOrderStatusBadge status={status} />
          </li>
        )}
      </ol>
      <div className="mt-6 space-y-3">
        {partial && <CustomerOrderStatusBadge status={status} />}
        <p className="text-sm leading-relaxed text-text-secondary">{statusDescriptions[status]}</p>
      </div>
    </aside>
  );
}
