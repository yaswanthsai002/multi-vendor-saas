'use client';

import { Moon, Sun } from 'lucide-react';

import { useThemeToggle } from './use-theme-toggle';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeToggle();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      className="relative w-14 h-7.5 rounded-full bg-surface-subtle dark:bg-surface hover:bg-surface-hover border border-border-default dark:border-border-strong cursor-pointer p-0.5 transition-colors duration-200 flex items-center justify-between px-1.5 select-none shrink-0"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {/* Background track icons */}
      <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0" aria-hidden="true" />
      <Moon className="h-3.5 w-3.5 text-secondary-accent shrink-0" aria-hidden="true" />

      {/* Sliding Thumb */}
      <span
        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-surface-raised dark:bg-surface-hover shadow-md border border-border-default dark:border-border-strong flex items-center justify-center transition-transform duration-200 ease-out ${
          isDark ? 'translate-x-6.5' : 'translate-x-0 dark:translate-x-6.5'
        }`}
      >
        <Moon className="hidden dark:block h-3.5 w-3.5 text-secondary-accent" aria-hidden="true" />
        <Sun className="block dark:hidden h-3.5 w-3.5 text-accent" aria-hidden="true" />
      </span>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
