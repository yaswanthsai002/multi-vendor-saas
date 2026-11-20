import type { VendorOrderStatus } from '../types/order.types';

const STATUS: Record<VendorOrderStatus, { label: string; style: string }> = {
  pending: { label: 'Pending', style: 'bg-warning-subtle text-warning' },
  processing: { label: 'Processing', style: 'bg-info-subtle text-info' },
  completed: { label: 'Completed', style: 'bg-success-subtle text-success' },
  cancelled: { label: 'Cancelled', style: 'bg-danger-subtle text-danger' },
};
export function OrderStatusBadge({
  status,
  className = '',
}: {
  status: VendorOrderStatus;
  className?: string;
}) {
  const item = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium ${item.style} ${className}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden />
      {item.label}
    </span>
  );
}
