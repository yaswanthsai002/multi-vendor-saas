'use client';

import { ArrowRight, Eye, FileText } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import type { RecentOrder } from '../services/admin.service';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const styles: Record<string, string> = {
    pending: 'bg-warning/15 text-warning border-warning/30',
    processing:
      'bg-secondary-accent/15 text-[#2C657F] dark:text-[#7FB6CA] border-secondary-accent/30',
    shipped: 'bg-accent/15 text-accent border-accent/30',
    delivered: 'bg-success/15 text-emerald-700 dark:text-emerald-400 border-success/30',
    completed: 'bg-success/15 text-emerald-700 dark:text-emerald-400 border-success/30',
    cancelled: 'bg-danger/15 text-danger border-danger/30',
  };

  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        styles[normalized] ?? 'bg-surface-subtle text-text-secondary border-border-default'
      }`}
    >
      {label}
    </span>
  );
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const displayOrders = orders || [];

  return (
    <div className="bg-surface border border-border-default rounded-xl p-6 flex flex-col justify-between transition-colors duration-150 shadow-xs">
      {/* Table Heading & View All Orders link */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-text-secondary stroke-[1.75]" />
          <h3 className="text-lg font-semibold text-text-primary tracking-tight">Recent Orders</h3>
        </div>

        <Link
          href="/admin/orders"
          className="text-xs sm:text-sm font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors group"
        >
          <span>View all orders</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* High-density Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vendor(s)</TableHead>
            <TableHead className="text-right">Items</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="w-10 text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-text-tertiary">
                No recent orders found.
              </TableCell>
            </TableRow>
          ) : (
            displayOrders.map((o) => (
              <TableRow
                key={o.orderId}
                className="group hover:bg-surface-hover/70 transition-colors"
              >
                <TableCell className="font-mono font-medium text-text-primary">
                  <Link
                    href={`/admin/orders/${o.orderId}`}
                    className="hover:underline hover:text-accent transition-colors"
                  >
                    {o.orderNumber}
                  </Link>
                </TableCell>
                <TableCell className="text-text-primary font-medium">{o.customer}</TableCell>
                <TableCell className="text-text-secondary">{o.vendors}</TableCell>
                <TableCell className="text-right font-mono text-text-primary tabular-nums">
                  {o.items}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold text-text-primary tabular-nums">
                  ₹{o.amount.toLocaleString('en-IN')}
                </TableCell>
                <TableCell className="text-right">
                  <StatusBadge status={o.status} />
                </TableCell>
                <TableCell className="text-center">
                  <Link
                    href={`/admin/orders/${o.orderId}`}
                    aria-label={`View order ${o.orderNumber}`}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-surface-subtle text-text-tertiary hover:text-text-primary transition-all inline-flex items-center justify-center"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
