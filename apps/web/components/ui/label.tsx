'use client';

import * as React from 'react';

import { Field } from '@/components/primitives/field';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  isRequired?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, isRequired, ...props }, ref) => {
    return (
      <Field.Label
        ref={ref}
        className={cn(
          'text-body-sm font-medium text-text-primary leading-tight select-none inline-flex items-center gap-xs',
          className,
        )}
        {...props}
      >
        {children}
        {isRequired && (
          <span className="text-danger leading-none" aria-hidden="true">
            *
          </span>
        )}
      </Field.Label>
    );
  },
);

Label.displayName = 'Label';
