import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Package,
  ShoppingBag,
  Store,
} from 'lucide-react';
import Link from 'next/link';

interface NeedsAttentionCardProps {
  pendingCount?: number;
}

const QUICK_ACTIONS = [
  {
    label: 'Marketplace Products Moderation',
    href: '/admin/products',
    icon: Package,
  },
  {
    label: 'Vendor Accounts Oversight',
    href: '/admin/vendors',
    icon: Store,
  },
  {
    label: 'All Orders & Fulfillment',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
];

export function NeedsAttentionCard({ pendingCount = 0 }: NeedsAttentionCardProps) {
  const count = pendingCount ?? 0;

  return (
    <div className="bg-surface-raised dark:bg-surface border border-border-default rounded-2xl p-6 flex flex-col justify-between transition-colors duration-200 shadow-none h-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${
              count > 0 ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'
            }`}
          >
            {count > 0 ? (
              <AlertTriangle className="h-3.5 w-3.5 stroke-2" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 stroke-2" />
            )}
          </div>
          <h3 className="text-base font-bold text-text-primary tracking-tight">Needs Attention</h3>
        </div>

        {/* Action Alert Box */}
        {count > 0 ? (
          <div className="p-4 rounded-xl bg-warning-subtle/50 dark:bg-warning/10 border border-warning/20 flex flex-col gap-3">
            <div className="flex items-center gap-3.5">
              <span className="text-3xl font-extrabold text-warning-500 dark:text-warning tracking-tight font-mono tabular-nums">
                {count}
              </span>
              <p className="text-xs sm:text-sm font-medium text-text-primary leading-snug">
                Vendor application{count === 1 ? '' : 's'} awaiting administrative review
              </p>
            </div>

            <Link
              href="/admin/vendors"
              className="w-full h-10 px-4 rounded-lg bg-accent hover:bg-accent-hover text-on-accent text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Review Applications</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-success-subtle/30 dark:bg-success/10 border border-success/20 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-success font-semibold text-xs sm:text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Queue is clear</span>
            </div>
            <p className="text-xs text-text-secondary">
              No pending vendor applications or critical alerts requiring immediate action.
            </p>
          </div>
        )}
      </div>

      {/* Quick Navigation Shortcuts (genuine links, no fake counters) */}
      <div className="mt-6 pt-4 border-t border-border-subtle space-y-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-2">
          Management Workspaces
        </div>
        {QUICK_ACTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-hover group transition-colors text-xs text-text-secondary hover:text-text-primary"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="h-3.5 w-3.5 text-text-tertiary group-hover:text-text-primary shrink-0 transition-colors" />
                <span className="truncate">{item.label}</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-text-tertiary group-hover:text-accent transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
