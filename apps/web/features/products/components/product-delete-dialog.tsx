'use client';

import { AlertTriangle, Info, Loader2, X } from 'lucide-react';
import * as React from 'react';

interface ProductDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  count?: number;
  productName?: string;
}

export function ProductDeleteDialog({
  open,
  onClose,
  onConfirm,
  isDeleting,
  count = 1,
  productName,
}: ProductDeleteDialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isDeleting, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-surface dark:bg-surface-subtle border border-border-default shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="p-6 pb-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 items-center justify-center h-10 w-10 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="delete-dialog-title"
                className="text-lg font-semibold text-text-primary tracking-tight"
              >
                {count > 1 ? `Delete ${count} Products` : 'Delete Product'}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">This action is irreversible.</p>
            </div>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed">
            {count > 1
              ? `Are you sure you want to permanently delete these ${count} products? All product data, category links, and gallery associations will be permanently removed.`
              : productName
                ? `Are you sure you want to permanently delete "${productName}"? All product data, category links, and gallery associations will be permanently removed.`
                : 'Are you sure you want to permanently delete this product? All product data, category links, and gallery associations will be permanently removed.'}
          </p>

          <div className="flex gap-2.5 p-3 rounded-xl bg-surface-subtle dark:bg-surface border border-border-subtle text-xs text-text-secondary leading-relaxed">
            <Info className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-text-primary">Note:</span> If you simply want to
              hide this product from customers without deleting catalog history, consider archiving
              it instead.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-subtle bg-surface-subtle/50 dark:bg-surface/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium rounded-xl text-text-secondary border border-border-default hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-danger-500 hover:bg-danger-600 active:bg-danger-700 text-white transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete permanently</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
