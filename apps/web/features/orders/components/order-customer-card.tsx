import { Mail, Phone } from 'lucide-react';
import * as React from 'react';

interface OrderCustomerCardProps {
  name: string;
  email: string;
  phone: string | null;
}

export function OrderCustomerCard({ name, email, phone }: OrderCustomerCardProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'CU';

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-border-default bg-surface-raised dark:bg-surface-raised shadow-xs">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Customer Details</h3>

      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center text-sm border border-accent/20 shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-text-primary text-sm truncate">{name || 'Customer'}</p>
          <p className="text-xs text-text-tertiary">Customer</p>
        </div>
      </div>

      <div className="space-y-2.5 text-xs sm:text-sm text-text-secondary">
        <div className="flex items-center gap-2.5">
          <Mail className="h-4 w-4 text-text-tertiary shrink-0" />
          <span className="truncate">{email || 'No email provided'}</span>
        </div>

        {phone && (
          <div className="flex items-center gap-2.5">
            <Phone className="h-4 w-4 text-text-tertiary shrink-0" />
            <span className="truncate">{phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}
