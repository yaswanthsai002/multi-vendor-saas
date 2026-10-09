'use client';

import { ShoppingBag } from 'lucide-react';
import * as React from 'react';

export function OrdersHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Orders</h1>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          Review, manage, and fulfill orders placed by customers across your catalog.
        </p>
      </div>
    </div>
  );
}
