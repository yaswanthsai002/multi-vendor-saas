'use client';

import * as React from 'react';

import { Field } from '@/components/primitives/field';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', isInvalid = false, rightElement, ...props }, ref) => {
    return (
      <div className="relative w-full flex items-center">
        <Field.Control
          ref={ref}
          type={type}
          aria-invalid={isInvalid ? 'true' : undefined}
          className={cn(
            'flex w-full rounded-md border bg-surface-raised px-md text-body-sm text-text-primary placeholder:text-text-tertiary px-4 py-2 my-1',
            'transition-colors duration-200',
            'border-border-default hover:border-border-strong',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-subtle',
            isInvalid && 'border-danger focus-visible:ring-danger text-text-primary',
            rightElement && 'pr-xl',
            className,
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-text-secondary">
            {rightElement}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
