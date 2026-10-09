import * as React from 'react';

import type { VendorOrderStatus } from '../types/order.types';

interface OrderStatusBadgeProps {
  status: VendorOrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const config: Record<
    VendorOrderStatus,
    { label: string; bg: string; text: string; dot: string }
  > = {
    pending: {
      label: 'Pending',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/50',
      text: 'text-amber-800 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    processing: {
      label: 'Processing',
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/50',
      text: 'text-blue-800 dark:text-blue-300',
      dot: 'bg-blue-500',
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/50',
      text: 'text-emerald-800 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800/50',
      text: 'text-rose-800 dark:text-rose-300',
      dot: 'bg-rose-500',
    },
  };

  const current = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
}
