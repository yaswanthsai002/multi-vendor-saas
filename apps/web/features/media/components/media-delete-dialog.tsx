'use client';

import { AlertTriangle, Info, Loader2, X } from 'lucide-react';
import * as React from 'react';

interface MediaDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  count?: number;
}

export function MediaDeleteDialog({
  open,
  onClose,
  onConfirm,
  isDeleting,
  count = 1,
}: MediaDeleteDialogProps) {
  // Handle ESC key press
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header & Body */}
        <div className="p-6 pb-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 items-center justify-center h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="delete-dialog-title"
                className="text-lg font-semibold text-slate-100 tracking-tight"
              >
                {count > 1 ? `Delete ${count} Media Assets` : 'Delete Media Asset'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">This action is irreversible.</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {count > 1
              ? `Are you sure you want to permanently delete these ${count} media assets? Their physical files will be permanently erased from storage.`
              : 'Are you sure you want to permanently delete this media asset? The physical files will be permanently erased from storage.'}
          </p>

          {/* Warning Callout Box */}
          <div className="flex gap-2.5 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
            <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Note:</span> Only disabled assets with
              zero product references can be deleted.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800/80 bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 text-white transition-all shadow-md shadow-red-950/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/30"
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
