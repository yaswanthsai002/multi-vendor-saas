const STATUS: Record<string, { label: string; style: string }> = {
  pending: { label: 'Placed', style: 'bg-warning-subtle text-warning' },
  confirmed: { label: 'In progress', style: 'bg-info-subtle text-info' },
  processing: { label: 'Processing', style: 'bg-info-subtle text-info' },
  completed: { label: 'Completed', style: 'bg-success-subtle text-success' },
  cancelled: { label: 'Cancelled', style: 'bg-danger-subtle text-danger' },
};

export function AdminOrderStatus({ status }: { status: string }) {
  const item = STATUS[status] ?? { label: status, style: 'bg-surface-active text-text-secondary' };
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium ${item.style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {item.label}
    </span>
  );
}
