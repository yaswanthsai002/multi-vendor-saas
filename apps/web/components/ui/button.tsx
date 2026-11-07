'use client';

import { Button as BaseButton } from '@base-ui-components/react';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon-sm';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const variantStyles = {
      primary:
        'bg-accent-active text-on-accent hover:bg-accent-hover active:bg-accent-active shadow-sm border border-transparent',
      secondary:
        'bg-surface-raised text-text-primary border border-border-default hover:bg-surface-hover active:bg-surface-active shadow-sm',
      outline:
        'bg-surface-raised text-text-primary border border-border-default hover:bg-surface-hover active:bg-surface-active',
      ghost: 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary',
      danger:
        'bg-danger text-white dark:text-text-inverse hover:opacity-90 active:opacity-95 shadow-sm',
    };

    const sizeStyles = {
      sm: 'h-8 px-2 text-xs rounded-md gap-1',
      md: 'h-10 px-3 text-sm font-medium rounded-lg gap-2',
      lg: 'h-12 px-4 text-base font-medium rounded-lg gap-3',
      'icon-sm': 'h-7 w-7 p-0 rounded-full',
    };

    return (
      <BaseButton
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors duration-200 select-none cursor-pointer',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" aria-hidden="true" />
        )}
        {children}
      </BaseButton>
    );
  },
);

Button.displayName = 'Button';
