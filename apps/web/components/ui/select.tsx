'use client';

import { Select as BaseSelect } from '@base-ui-components/react/select';
import { Check, ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SimpleSelectProps<T extends string = string> {
  value: T;
  onValueChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  icon?: React.ReactNode;
  'aria-label'?: string;
}

export function Select<T extends string = string>({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  className,
  triggerClassName,
  icon,
  'aria-label': ariaLabel,
}: SimpleSelectProps<T>) {
  return (
    <BaseSelect.Root
      value={value}
      onValueChange={(val) => {
        if (val !== null && val !== undefined) {
          onValueChange(val as T);
        }
      }}
    >
      <BaseSelect.Trigger
        aria-label={ariaLabel}
        className={cn(
          'inline-flex h-8.5 items-center justify-between gap-2 rounded-lg border border-border-default bg-surface-raised px-3 text-xs font-medium text-text-primary shadow-2xs transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus cursor-pointer select-none',
          triggerClassName,
        )}
      >
        <span className="flex items-center gap-1.5 truncate">
          {icon}
          <BaseSelect.Value>
            {(val: unknown) => {
              const opt = options.find((o) => o.value === val);
              return opt ? opt.label : placeholder;
            }}
          </BaseSelect.Value>
        </span>
        <BaseSelect.Icon>
          <ChevronDown className="h-3.5 w-3.5 text-text-tertiary transition-transform duration-200" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>

      <BaseSelect.Portal>
        <BaseSelect.Positioner
          side="bottom"
          align="end"
          sideOffset={4}
          alignItemWithTrigger={false}
          className="z-50"
        >
          <BaseSelect.Popup
            className={cn(
              'w-48 overflow-hidden rounded-xl border border-border-default bg-surface-raised p-1 shadow-xl outline-none backdrop-blur-xs transition-all animate-in fade-in-50 zoom-in-95',
              className,
            )}
          >
            <BaseSelect.List className="flex flex-col gap-0.5">
              {options.map((opt) => (
                <BaseSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary focus:bg-surface-hover focus:text-text-primary focus:outline-none cursor-pointer data-[selected]:font-semibold data-[selected]:text-text-primary"
                >
                  <BaseSelect.ItemText>{opt.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator>
                    <Check className="h-3.5 w-3.5 text-accent" />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
