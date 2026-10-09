import { AlertCircle, Check, Clock, PackageCheck } from 'lucide-react';
import * as React from 'react';

import type { VendorOrderStatus } from '../types/order.types';

interface OrderStepperProps {
  status: VendorOrderStatus;
  cancellationReason?: string | null;
}

export function OrderStepper({ status, cancellationReason }: OrderStepperProps) {
  if (status === 'cancelled') {
    return (
      <div className="p-4 sm:p-5 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
              Order Cancelled
            </h4>
            <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-400 mt-0.5">
              {cancellationReason
                ? `Reason: ${cancellationReason}`
                : 'This order was cancelled and cannot be fulfilled.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 'pending', label: 'Pending Review', desc: 'Order received', icon: Clock },
    { id: 'processing', label: 'In Processing', desc: 'Preparing items', icon: PackageCheck },
    { id: 'completed', label: 'Completed', desc: 'Fulfilled & finalized', icon: Check },
  ];

  const getStepState = (stepId: string) => {
    if (status === 'completed') return 'completed';
    if (status === 'processing') {
      if (stepId === 'pending') return 'completed';
      if (stepId === 'processing') return 'active';
      return 'upcoming';
    }
    if (status === 'pending') {
      if (stepId === 'pending') return 'active';
      return 'upcoming';
    }
    return 'upcoming';
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-border-default bg-surface-raised dark:bg-surface-raised shadow-xs">
      <h3 className="text-sm font-semibold text-text-primary mb-6">Fulfillment Progress</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
        {steps.map((step, index) => {
          const state = getStepState(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 relative"
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div
                  className={`hidden sm:block absolute top-4 left-10 right-0 h-[2px] -z-0 transition-colors ${
                    state === 'completed'
                      ? 'bg-emerald-500 dark:bg-emerald-600'
                      : 'bg-border-default'
                  }`}
                />
              )}

              {/* Step indicator circle */}
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all relative z-10 ${
                  state === 'completed'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : state === 'active'
                      ? 'bg-accent text-on-accent ring-4 ring-accent/15 shadow-xs'
                      : 'bg-surface-subtle dark:bg-surface border border-border-default text-text-tertiary'
                }`}
              >
                {state === 'completed' ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              {/* Step text */}
              <div className="min-w-0">
                <p
                  className={`text-xs sm:text-sm font-semibold truncate ${
                    state === 'active'
                      ? 'text-accent'
                      : state === 'completed'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-text-secondary'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-text-tertiary truncate">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
