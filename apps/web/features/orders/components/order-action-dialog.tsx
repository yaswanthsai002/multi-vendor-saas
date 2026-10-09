'use client';

import { AlertTriangle, CheckCircle, Loader2, PackageCheck, X } from 'lucide-react';
import * as React from 'react';

interface OrderActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'process' | 'complete' | 'cancel' | null;
  onConfirm: (data: {
    status: 'processing' | 'completed' | 'cancelled';
    cancellationReason?: string;
  }) => void;
  isLoading: boolean;
}

export function OrderActionDialog({
  isOpen,
  onClose,
  action,
  onConfirm,
  isLoading,
}: OrderActionDialogProps) {
  const [reason, setReason] = React.useState('');

  if (!isOpen || !action) return null;

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (action === 'process') {
      onConfirm({ status: 'processing' });
    } else if (action === 'complete') {
      onConfirm({ status: 'completed' });
    } else if (action === 'cancel') {
      onConfirm({ status: 'cancelled', cancellationReason: reason.trim() || undefined });
    }
    setReason('');
  };

  const config = {
    process: {
      title: 'Start Processing Order',
      description:
        'Are you ready to accept and prepare the items for this order? Customer will be notified that their order is in progress.',
      btnText: 'Start Processing',
      btnClass: 'bg-accent text-on-accent hover:bg-accent/90',
      icon: PackageCheck,
      iconColor: 'text-accent',
    },
    complete: {
      title: 'Complete Order Fulfillment',
      description:
        'Mark this order as successfully fulfilled and completed. Once marked completed, the order cannot be changed.',
      btnText: 'Complete Order',
      btnClass: 'bg-emerald-600 text-white hover:bg-emerald-700',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
    },
    cancel: {
      title: 'Cancel Order',
      description:
        'Are you sure you want to cancel this order? This action is permanent and cannot be undone.',
      btnText: 'Cancel Order',
      btnClass: 'bg-rose-600 text-white hover:bg-rose-700',
      icon: AlertTriangle,
      iconColor: 'text-rose-600',
    },
  }[action];

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-border-default bg-surface-raised dark:bg-surface-raised p-6 shadow-xl relative animate-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close dialog"
          className="absolute right-4 top-4 p-1.5 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-surface-subtle dark:bg-surface border border-border-default/60 shrink-0">
            <Icon className={`h-6 w-6 ${config.iconColor}`} />
          </div>

          <div className="min-w-0 pr-4">
            <h3 className="text-base font-bold text-text-primary">{config.title}</h3>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">{config.description}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {action === 'cancel' && (
            <div>
              <label
                htmlFor="cancellationReason"
                className="block text-xs font-semibold text-text-primary mb-1.5"
              >
                Cancellation Reason (Optional)
              </label>
              <textarea
                id="cancellationReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="e.g., Out of stock inventory, customer requested cancellation..."
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-surface dark:bg-surface-subtle border border-border-default text-text-primary placeholder:text-text-tertiary focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border border-border-default bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${config.btnClass}`}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{config.btnText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
