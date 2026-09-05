'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className:
          'font-sans bg-surface-raised text-text-primary border border-border-default rounded-lg p-3.5 shadow-md text-sm',
        descriptionClassName: 'text-text-secondary text-xs mt-1',
      }}
    />
  );
}
