'use client';

import * as React from 'react';

export type MediaTab = 'all' | 'image' | 'video' | 'disabled';

interface MediaTabsProps {
  activeTab: MediaTab;
  onTabChange: (tab: MediaTab) => void;
  counts?: {
    all?: number;
    image?: number;
    video?: number;
    disabled?: number;
  };
}

const TABS: { id: MediaTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Images' },
  { id: 'video', label: 'Videos' },
  { id: 'disabled', label: 'Disabled' },
];

export function MediaTabs({ activeTab, onTabChange, counts }: MediaTabsProps) {
  return (
    <div className="flex border-b border-border-default overflow-x-auto gap-6" role="tablist">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts?.[tab.id];

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-t-sm ${
              isActive
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-default'
            }`}
          >
            <span>{tab.label}</span>
            {count !== undefined ? (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-accent/10 text-accent font-semibold'
                    : 'bg-surface-subtle text-text-tertiary'
                }`}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
