'use client';

import { ChevronRight, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import type { OrderStatus, RecentOrder } from '../types/vendor-dashboard.types';

interface VendorRecentOrdersProps {
  orders?: RecentOrder[];
  isLoading?: boolean;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    pending: 'bg-warning-subtle text-warning border-warning/20',
    processing: 'bg-info-subtle text-info border-info/20',
    shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-300/30',
    delivered: 'bg-success-subtle text-success border-success/20',
    cancelled: 'bg-danger-subtle text-danger border-danger/20',
  };

  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        styles[status] ?? styles.pending
      }`}
    >
      {label}
    </span>
  );
}

export function VendorRecentOrders({ orders = [], isLoading }: VendorRecentOrdersProps) {
  return (
    <div className="bg-surface-raised dark:bg-surface border border-border-default rounded-xl p-6 flex flex-col justify-between transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-text-primary">Recent Orders</h3>
        <Link
          href="/vendor/orders"
          className="text-xs sm:text-sm font-semibold text-secondary-accent hover:underline flex items-center gap-1 transition-colors"
        >
          <span>View all orders</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Orders Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-subtle text-xs font-semibold text-text-tertiary">
              <th className="py-2.5 pr-4">Order #</th>
              <th className="py-2.5 px-4 text-center">Items</th>
              <th className="py-2.5 px-4">Amount</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 pl-2 text-right">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-sm">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3 pr-4">
                    <div className="h-4 w-16 bg-surface-subtle rounded" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-4 w-6 bg-surface-subtle rounded mx-auto" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-16 bg-surface-subtle rounded" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-5 w-20 bg-surface-subtle rounded-full" />
                  </td>
                  <td className="py-3 pl-2 text-right" />
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-text-tertiary">
                  No orders placed yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.vendorOrderId}
                  className="hover:bg-surface-hover/60 transition-colors group cursor-pointer"
                >
                  <td className="py-3 pr-4 font-medium text-text-primary">
                    <div className="flex items-center gap-2.5">
                      {order.thumbnailUrl ? (
                        <div className="h-8 w-8 rounded-md overflow-hidden bg-surface-subtle shrink-0 border border-border-default">
                          <Image
                            src={order.thumbnailUrl}
                            alt=""
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-md bg-surface-subtle flex items-center justify-center text-text-tertiary shrink-0 border border-border-subtle">
                          <Package className="h-4 w-4" />
                        </div>
                      )}
                      <span>{order.orderNumber}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-text-secondary">
                    {order.itemsCount}
                  </td>
                  <td className="py-3 px-4 font-medium text-text-primary">
                    {order.amount > 0 ? `₹ ${order.amount.toLocaleString('en-IN')}` : '₹ —'}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 pl-2 text-right text-text-tertiary group-hover:text-text-primary transition-colors">
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
