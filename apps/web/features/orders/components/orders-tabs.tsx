'use client';

import { Tabs } from '@base-ui-components/react/tabs';

import type { OrderStatusFilter, VendorOrderStatusCounts } from '../types/order.types';
import type { ReactNode } from 'react';

const TABS: { id: OrderStatusFilter; label: string }[] = [
  { id: 'all', label: 'All orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'processing', label: 'Processing' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export function OrdersTabs({
  activeTab,
  counts,
  onTabChange,
  children,
}: {
  activeTab: OrderStatusFilter;
  counts?: VendorOrderStatusCounts;
  onTabChange: (tab: OrderStatusFilter) => void;
  children: ReactNode;
}) {
  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={(value) => {
        const tab = TABS.find((item) => item.id === value);
        if (tab) onTabChange(tab.id);
      }}
    >
      <Tabs.List
        aria-label="Order status"
        className="mb-6 flex gap-6 overflow-x-auto border-b border-border-control"
      >
        {TABS.map((tab) => (
          <Tabs.Tab
            key={tab.id}
            value={tab.id}
            className="flex shrink-0 cursor-pointer items-center gap-2 border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-text-secondary outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus data-[active]:border-accent data-[active]:text-text-primary"
          >
            {tab.label}
            {counts && (
              <span className="rounded-md bg-surface-active px-2 py-0.5 text-xs tabular-nums text-text-secondary">
                {counts[tab.id]}
              </span>
            )}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      <Tabs.Panel value={activeTab} className="flex min-h-128 flex-col gap-6 outline-none">
        {children}
      </Tabs.Panel>
    </Tabs.Root>
  );
}
