'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  isInvalid?: boolean;
  id?: string;
  'aria-describedby'?: string;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  isInvalid = false,
  id = 'otp-input',
  'aria-describedby': ariaDescribedBy,
}: OtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of characters padded to length
  const digits = React.useMemo(() => {
    const chars = value.toUpperCase().split('');
    const arr = Array.from({ length }, (_, i) => chars[i] || '');
    return arr;
  }, [value, length]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (!rawVal) {
      // Clear current digit
      const nextDigits = [...digits];
      nextDigits[index] = '';
      onChange(nextDigits.join(''));
      return;
    }

    // Single character input
    const char = rawVal.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = char;
    const nextValue = nextDigits.join('');
    onChange(nextValue);

    // Auto-advance to next input if available
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move back and clear previous digit
        e.preventDefault();
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        onChange(nextDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData('text')
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, '')
      .slice(0, length);

    if (pastedData) {
      onChange(pastedData);
      const targetIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[targetIndex]?.focus();
    }
  };

  return (
    <div
      role="group"
      aria-label="One-time verification code"
      id={id}
      aria-describedby={ariaDescribedBy}
      className="flex items-center justify-between gap-2 sm:gap-3 w-full max-w-sm mx-auto"
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="text"
          maxLength={1}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={isInvalid ? 'true' : undefined}
          disabled={disabled}
          value={digits[index]}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            'w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold uppercase rounded-xl border bg-surface-raised transition-all duration-200',
            'border-border-default hover:border-border-strong text-text-primary focus:outline-none',
            'focus:border-accent focus:ring-2 focus:ring-accent/20 dark:focus:ring-accent/30',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-subtle',
            isInvalid && 'border-danger focus:border-danger focus:ring-danger/20 text-danger',
          )}
        />
      ))}
    </div>
  );
}
