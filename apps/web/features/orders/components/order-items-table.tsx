'use client';

import { Package } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import type { OrderItemDetail } from '../types/order.types';

interface OrderItemsTableProps {
  items: OrderItemDetail[];
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  return (
    <div className="rounded-2xl border border-border-default bg-surface-raised dark:bg-surface-raised overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-border-default flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Order Items ({items.length})</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border-default bg-surface-subtle/40 dark:bg-surface-subtle/20">
              <th className="py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                Product
              </th>
              <th className="py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider text-right">
                Price
              </th>
              <th className="py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider text-center">
                Qty
              </th>
              <th className="py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider text-right">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/40">
            {items.map((item) => (
              <tr key={item.orderItemId} className="hover:bg-surface-hover/50 transition-colors">
                {/* Product Name & Thumbnail */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-surface-subtle dark:bg-surface border border-border-default/60 flex items-center justify-center shrink-0 overflow-hidden relative">
                      {item.productImageUrl ? (
                        <Image
                          src={item.productImageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-text-tertiary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary text-xs sm:text-sm line-clamp-1">
                        {item.productName}
                      </p>
                      <p className="text-[11px] font-mono text-text-tertiary truncate">
                        ID: {item.productId.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Unit Price */}
                <td className="py-3.5 px-4 text-right text-xs sm:text-sm text-text-secondary whitespace-nowrap">
                  ${item.unitPrice}
                </td>

                {/* Quantity */}
                <td className="py-3.5 px-4 text-center text-xs sm:text-sm font-semibold text-text-primary whitespace-nowrap">
                  {item.quantity}
                </td>

                {/* Subtotal */}
                <td className="py-3.5 px-4 text-right text-xs sm:text-sm font-bold text-text-primary whitespace-nowrap">
                  ${item.subtotal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
