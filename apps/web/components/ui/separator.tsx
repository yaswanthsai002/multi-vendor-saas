'use client';

import * as React from 'react';

import { Separator as BaseSeparator } from '@/components/primitives/separator';
import { cn } from '@/lib/utils';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', label, ...props }, ref) => {
    if (label) {
      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation={orientation}
          className={cn('relative flex items-center justify-center my-md w-full', className)}
          {...props}
        >
          <div className="w-full border-t border-border-subtle" />
          <span className="absolute bg-surface-raised px-sm text-body-sm text-text-tertiary font-normal select-none">
            {label}
          </span>
        </div>
      );
    }

    return (
      <BaseSeparator
        ref={ref}
        orientation={orientation}
        className={cn(
          'shrink-0 bg-border-subtle',
          orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
          className,
        )}
        {...props}
      />
    );
  },
);

Separator.displayName = 'Separator';
