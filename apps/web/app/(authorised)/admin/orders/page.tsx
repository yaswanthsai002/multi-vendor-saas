'use client';

import { CheckCircle2, Clock, RotateCcw, Search, ShoppingCart, X, XCircle } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { KpiCard } from '@/features/admin/components/kpi-card';
import { useAdminOrders } from '@/features/admin/hooks/use-admin';

export default function AdminOrdersPage() {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const { data, isLoading } = useAdminOrders({
    search: search.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const orders = data?.orders ?? [];

  // Compute breakdown stats
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const completedCount = orders.filter(
    (o) => o.status === 'completed' || o.status === 'delivered',
  ).length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-info-subtle text-info border-info/20';
      case 'delivered':
      case 'completed':
        return 'bg-success-subtle text-success border-success/20';
      case 'shipped':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-300/30';
      case 'cancelled':
        return 'bg-danger-subtle text-danger border-danger/20';
      default:
        return 'bg-warning-subtle text-warning border-warning/20';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Platform Orders
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Marketplace-wide order oversight, multi-vendor split-routing, and status tracking.
        </p>
      </div>

      {/* Metric Counters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Orders"
          value={isLoading ? '...' : totalCount}
          icon={ShoppingCart}
          iconBg="bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400"
        />
        <KpiCard
          title="Pending Routing"
          value={isLoading ? '...' : pendingCount}
          icon={Clock}
          iconBg="bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
        />
        <KpiCard
          title="Completed"
          value={isLoading ? '...' : completedCount}
          icon={CheckCircle2}
          iconBg="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          title="Cancelled"
          value={isLoading ? '...' : cancelledCount}
          icon={XCircle}
          iconBg="bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Tabs with Counters */}
        <div
          role="tablist"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-surface-subtle dark:bg-surface border border-border-default/60 overflow-x-auto max-w-full"
        >
          {[
            { id: 'all', label: 'All Orders', count: totalCount },
            { id: 'pending', label: 'Pending', count: pendingCount },
            { id: 'completed', label: 'Completed', count: completedCount },
            { id: 'cancelled', label: 'Cancelled', count: cancelledCount },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-surface-raised dark:bg-surface-raised text-text-primary font-semibold border border-border-default shadow-xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    isActive
                      ? 'bg-accent/10 text-accent dark:bg-accent/20'
                      : 'bg-surface-hover text-text-tertiary'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search order number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-xl bg-surface dark:bg-surface border border-border-default  text-text-primary placeholder:text-text-tertiary transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-raised dark:bg-surface rounded-xl border border-border-default overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-text-tertiary font-semibold">
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Customer Email</th>
                <th className="py-3 px-4">Placed Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-tertiary">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      <span>Loading marketplace orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-text-tertiary">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="h-12 w-12 rounded-full bg-surface-subtle flex items-center justify-center mb-3">
                        <ShoppingCart className="h-6 w-6 text-text-tertiary" />
                      </div>
                      <span className="font-semibold text-sm text-text-primary">
                        No orders found
                      </span>
                      <p className="text-xs text-text-tertiary mt-1">
                        Try adjusting your search query or filter criteria.
                      </p>
                      {statusFilter !== 'all' || search ? (
                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter('all');
                            setSearch('');
                          }}
                          className="mt-3 text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Reset all filters</span>
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.orderId} className="hover:bg-surface-hover/60 transition-colors group">
                    <td className="py-3.5 px-4 font-semibold text-text-primary">
                      <Link href="/admin/orders" className="hover:text-accent hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-text-primary">
                      {o.customer?.name || 'Registered Customer'}
                    </td>

                    <td className="py-3.5 px-4 text-text-secondary">{o.customer?.email || '—'}</td>

                    <td className="py-3.5 px-4 text-text-secondary font-medium">
                      {new Date(o.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getStatusBadge(
                          o.status,
                        )}`}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
