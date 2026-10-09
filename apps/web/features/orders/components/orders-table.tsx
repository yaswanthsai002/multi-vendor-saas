'use client';

import { ArrowRight, Inbox } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { OrderStatusBadge } from './order-status-badge';

import type { VendorOrderListItem } from '../types/order.types';

interface OrdersTableProps {
  orders: VendorOrderListItem[];
  onResetFilters?: () => void;
  hasFilters?: boolean;
}

export function OrdersTable({ orders, onResetFilters, hasFilters }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-border-default bg-surface-raised dark:bg-surface-raised p-12 text-center shadow-xs">
        <div className="inline-flex p-4 rounded-2xl bg-surface-subtle dark:bg-surface border border-border-default/60 mb-4 text-text-tertiary">
          <Inbox className="h-8 w-8" />
        </div>
        <h3 className="text-base font-semibold text-text-primary">No orders found</h3>
        <p className="text-sm text-text-secondary max-w-sm mx-auto mt-1">
          {hasFilters
            ? 'No orders match your current filter criteria. Try clearing filters or searching for something else.'
            : 'You have not received any customer orders yet. They will appear here once placed.'}
        </p>
        {hasFilters && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-accent text-on-accent hover:bg-accent/90 shadow-xs transition-colors cursor-pointer"
          >
            <span>Reset filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-border-default bg-surface-raised dark:bg-surface-raised overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border-default bg-surface-subtle/40 dark:bg-surface-subtle/20">
              <th className="py-3.5 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                Order
              </th>
              <th className="py-3.5 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                Customer
              </th>
              <th className="py-3.5 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                Date
              </th>
              <th className="py-3.5 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                Items
              </th>
              <th className="py-3.5 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                Total
              </th>
              <th className="py-3.5 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="py-3.5 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/40">
            {orders.map((order) => {
              const formattedDate = new Date(order.placedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              const initials = order.customer.name
                ? order.customer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'CU';

              return (
                <tr
                  key={order.vendorOrderId}
                  className="hover:bg-surface-hover/60 transition-colors group"
                >
                  {/* Order Number */}
                  <td className="py-3.5 px-4 font-medium text-text-primary whitespace-nowrap">
                    <Link
                      href={`/vendor/orders/${order.vendorOrderId}`}
                      className="font-mono text-xs sm:text-sm font-semibold text-text-primary hover:text-accent transition-colors"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-surface-subtle dark:bg-surface border border-border-default/60 flex items-center justify-center text-xs font-bold text-text-secondary shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary truncate text-xs sm:text-sm">
                          {order.customer.name || 'Anonymous'}
                        </p>
                        <p className="text-[11px] text-text-tertiary truncate">
                          {order.customer.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-xs sm:text-sm text-text-secondary whitespace-nowrap">
                    {formattedDate}
                  </td>

                  {/* Items count */}
                  <td className="py-3.5 px-4 text-xs sm:text-sm text-text-secondary whitespace-nowrap">
                    <span className="font-semibold text-text-primary">{order.itemCount}</span>{' '}
                    {order.itemCount === 1 ? 'item' : 'items'}
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-4 text-xs sm:text-sm font-semibold text-text-primary whitespace-nowrap">
                    ${order.total}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <OrderStatusBadge status={order.status} />
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Link
                      href={`/vendor/orders/${order.vendorOrderId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-border-default bg-surface hover:bg-surface-hover text-text-primary shadow-2xs transition-colors cursor-pointer group-hover:border-accent/40"
                    >
                      <span>View</span>
                      <ArrowRight className="h-3.5 w-3.5 text-text-tertiary group-hover:text-accent transition-colors" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
