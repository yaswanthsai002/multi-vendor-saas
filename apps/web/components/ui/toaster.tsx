'use client';

import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  const { theme = 'system' } = useTheme();

  return (
    <SonnerToaster
      theme={theme as 'light' | 'dark' | 'system'}
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          title: 'font-semibold text-sm',
          description: 'text-xs mt-0.5 opacity-90',
        },
      }}
    />
  );
}
