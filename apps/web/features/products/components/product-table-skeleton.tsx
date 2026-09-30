'use client';

export function ProductTableSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-border-default bg-surface dark:bg-surface-subtle overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-subtle/50 dark:bg-surface/50 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              <th className="py-3.5 pl-4 pr-2 w-10">
                <div className="h-4 w-4 rounded-md bg-border-default/60 animate-pulse" />
              </th>
              <th className="py-3.5 px-4 min-w-[240px]">Product</th>
              <th className="py-3.5 px-4 min-w-[180px]">Categories</th>
              <th className="py-3.5 px-4 min-w-[100px]">Price</th>
              <th className="py-3.5 px-4 min-w-[80px]">Stock</th>
              <th className="py-3.5 px-4 min-w-[90px]">Rating</th>
              <th className="py-3.5 px-4 min-w-[90px]">Published</th>
              <th className="py-3.5 pl-4 pr-6 w-14 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="py-4 pl-4 pr-2">
                  <div className="h-4 w-4 rounded-md bg-border-default/50" />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-border-default/50 shrink-0" />
                    <div className="space-y-1.5 flex-1 max-w-[200px]">
                      <div className="h-4 w-3/4 rounded-md bg-border-default/60" />
                      <div className="h-3 w-1/2 rounded-md bg-border-default/40" />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-6 w-16 rounded-full bg-border-default/50" />
                    <div className="h-6 w-14 rounded-full bg-border-default/40" />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 w-16 rounded-md bg-border-default/50" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 w-8 rounded-md bg-border-default/50" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 w-12 rounded-md bg-border-default/50" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-6 w-11 rounded-full bg-border-default/50" />
                </td>
                <td className="py-4 pl-4 pr-6 text-right">
                  <div className="h-8 w-8 rounded-lg bg-border-default/40 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle bg-surface-subtle/30 dark:bg-surface/30">
        <div className="h-4 w-36 rounded-md bg-border-default/50 animate-pulse" />
        <div className="h-8 w-48 rounded-xl bg-border-default/50 animate-pulse" />
      </div>
    </div>
  );
}
