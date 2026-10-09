import * as React from 'react';

interface OrderSummaryCardProps {
  itemCount: number;
  total: string;
}

export function OrderSummaryCard({ itemCount, total }: OrderSummaryCardProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-border-default bg-surface-raised dark:bg-surface-raised shadow-xs">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Payment & Order Summary</h3>

      <div className="space-y-2.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between text-text-secondary">
          <span>
            Items Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium text-text-primary">${total}</span>
        </div>

        <div className="h-[1px] bg-border-default/60 my-2" />

        <div className="flex items-center justify-between font-bold text-sm sm:text-base text-text-primary">
          <span>Vendor Order Total</span>
          <span className="text-accent text-base sm:text-lg">${total}</span>
        </div>
      </div>
    </div>
  );
}
