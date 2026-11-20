export function OrdersTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading orders"
      className="divide-y divide-border-default border-y border-border-default"
    >
      <div className="h-12 bg-surface-active" />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex gap-6 px-4 py-5 motion-safe:animate-pulse">
          <div className="h-12 w-2/5 rounded-md bg-surface-active" />
          <div className="h-5 flex-1 rounded-md bg-surface-active" />
          <div className="h-5 w-20 rounded-md bg-surface-active" />
        </div>
      ))}
    </div>
  );
}
