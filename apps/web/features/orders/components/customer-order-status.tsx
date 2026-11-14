import type { CustomerOrderStatus } from '../types/customer-order.types';

const statusStyles = {
  'Order placed': 'border-border-control bg-surface-raised text-text-secondary',
  'In progress': 'border-info/40 bg-info-subtle text-info',
  'Partially cancelled': 'border-warning/40 bg-warning-subtle text-warning',
  'Partially fulfilled': 'border-info/40 bg-info-subtle text-info',
  Completed: 'border-success/40 bg-success-subtle text-success',
  Cancelled: 'border-danger/40 bg-danger-subtle text-danger',
} satisfies Record<CustomerOrderStatus, string>;

export function CustomerOrderStatusBadge({ status }: { status: CustomerOrderStatus }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs leading-4 font-medium ${statusStyles[status]}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      {status === 'Order placed' ? 'Placed' : status}
    </span>
  );
}
