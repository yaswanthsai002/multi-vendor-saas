import * as React from 'react';

export function OrdersTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full rounded-2xl border border-border-default bg-surface-raised dark:bg-surface-raised overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border-default/60 bg-surface-subtle/50 dark:bg-surface-subtle/20">
              <th className="py-3.5 px-4 font-semibold text-text-secondary text-xs">Order</th>
              <th className="py-3.5 px-4 font-semibold text-text-secondary text-xs">Customer</th>
              <th className="py-3.5 px-4 font-semibold text-text-secondary text-xs">Placed On</th>
              <th className="py-3.5 px-4 font-semibold text-text-secondary text-xs">Items</th>
              <th className="py-3.5 px-4 font-semibold text-text-secondary text-xs">Total</th>
              <th className="py-3.5 px-4 font-semibold text-text-secondary text-xs">Status</th>
              <th className="py-3.5 px-4 font-semibold text-text-secondary text-xs text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/40">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="py-4 px-4">
                  <div className="h-4 w-20 bg-surface-subtle rounded-md" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 w-28 bg-surface-subtle rounded-md mb-1.5" />
                  <div className="h-3 w-36 bg-surface-subtle/70 rounded-md" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 w-24 bg-surface-subtle rounded-md" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 w-12 bg-surface-subtle rounded-md" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 w-16 bg-surface-subtle rounded-md" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-5 w-20 bg-surface-subtle rounded-full" />
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="h-8 w-16 bg-surface-subtle rounded-xl inline-block" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
