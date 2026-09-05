'use client';

import * as React from 'react';

import { Field as BaseField } from '@/components/primitives/field';
import { cn } from '@/lib/utils';

export const FormField = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseField.Root>
>(({ className, ...props }, ref) => {
  return <BaseField.Root ref={ref} className={cn('space-y-xs w-full', className)} {...props} />;
});

FormField.displayName = 'FormField';

export const FormFieldError = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof BaseField.Error>
>(({ className, ...props }, ref) => {
  return (
    <BaseField.Error
      ref={ref}
      className={cn('text-caption text-danger font-medium mt-xs leading-tight', className)}
      {...props}
    />
  );
});

FormFieldError.displayName = 'FormFieldError';
