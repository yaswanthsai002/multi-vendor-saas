'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

const emptySubscribe = () => () => {};

function useIsMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  if (!isMounted) {
    return (
      <div
        className="w-14 h-7.5 rounded-full bg-surface-subtle border border-border-default animate-pulse"
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-14 h-7.5 rounded-full bg-surface-subtle hover:bg-surface-hover border border-border-default cursor-pointer p-0.5 transition-colors duration-200 flex items-center justify-between px-1.5 select-none"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background track icons */}
      <Sun className="h-3.5 w-3.5 text-amber-500/70 shrink-0" aria-hidden="true" />
      <Moon className="h-3.5 w-3.5 text-secondary-accent/70 shrink-0" aria-hidden="true" />

      {/* Sliding Thumb */}
      <span
        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-surface-raised shadow-md border border-border-default/80 flex items-center justify-center transition-transform duration-300 ease-out ${
          isDark ? 'translate-x-6.5' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-secondary-accent" aria-hidden="true" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        )}
      </span>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
