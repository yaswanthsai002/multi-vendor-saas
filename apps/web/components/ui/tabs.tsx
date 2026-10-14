'use client';

import { Tabs as BaseTabs } from '@base-ui-components/react/tabs';
import * as React from 'react';

import { cn } from '@/lib/utils';

export const Tabs = BaseTabs.Root;

export const TabsList = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseTabs.List>
>(({ className, ...props }, ref) => (
  <BaseTabs.List
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1 p-1 rounded-xl bg-surface-subtle border border-border-default text-text-secondary select-none',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

export const TabsTab = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>
>(({ className, ...props }, ref) => (
  <BaseTabs.Tab
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all select-none cursor-pointer border border-transparent',
      'text-text-secondary hover:text-text-primary hover:bg-surface-hover/60',
      'data-active:bg-surface-raised data-active:text-text-primary data-active:font-semibold data-active:shadow-xs data-active:border-border-default',
      'data-selected:bg-surface-raised data-selected:text-text-primary data-selected:font-semibold data-selected:shadow-xs data-selected:border-border-default',
      'outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
      'disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
TabsTab.displayName = 'TabsTab';

export const TabsPanel = BaseTabs.Panel;
