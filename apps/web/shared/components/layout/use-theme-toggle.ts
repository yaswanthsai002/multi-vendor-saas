'use client';

import { useTheme } from 'next-themes';
import * as React from 'react';

const emptySubscribe = () => () => {};

export function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const isDark = mounted && resolvedTheme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return {
    mounted,
    isDark,
    toggleTheme,
  };
}
