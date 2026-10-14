'use client';

import { Menu } from '@base-ui-components/react/menu';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import {
  AlertTriangle,
  Check,
  MoreVertical,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import * as React from 'react';

import type { AdminUserItem } from '@/features/admin/services/admin.service';

import { DataTable } from '@/components/ui/data-table';
import { KpiCard } from '@/features/admin/components/kpi-card';
import { useAdminUsers, useUpdateUserStatus } from '@/features/admin/hooks/use-admin';
import { cn } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [selectedUser, setSelectedUser] = React.useState<{
    userId: string;
    fullName: string;
    action: 'suspend' | 'activate';
  } | null>(null);
  const [reason, setReason] = React.useState('');

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useAdminUsers({
    role: 'customer',
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: search.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const updateStatusMutation = useUpdateUserStatus();
  const users = data?.users ?? [];
  const counts = data?.counts ?? { all: 0, active: 0, suspended: 0 };

  const handleActionConfirm = async () => {
    if (!selectedUser) return;

    await updateStatusMutation.mutateAsync({
      userId: selectedUser.userId,
      status: selectedUser.action === 'suspend' ? 'suspended' : 'active',
      reason: reason.trim() || undefined,
    });

    setSelectedUser(null);
    setReason('');
  };

  const columns = React.useMemo<ColumnDef<AdminUserItem>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Name',
        size: 260,
        minSize: 180,
        enableResizing: true,
        cell: ({ row }) => {
          const u = row.original;
          const initials =
            u.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || 'CU';

          const formattedDate = new Date(u.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-accent/10 text-accent font-bold text-xs flex items-center justify-center shrink-0 border border-accent/20">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-text-primary text-sm truncate">{u.fullName}</div>
                <div className="text-[11px] text-text-tertiary">Joined {formattedDate}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 280,
        minSize: 180,
        enableResizing: true,
        cell: ({ row }) => {
          const u = row.original;
          const isVerified = !!u.emailVerifiedAt;

          return (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-text-secondary text-sm font-medium truncate">{u.email}</span>
              {isVerified ? (
                <span
                  title="Email Verified"
                  className="inline-flex items-center text-success shrink-0"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
              ) : (
                <span
                  title="Pending Verification"
                  className="inline-flex items-center text-text-tertiary shrink-0"
                >
                  <Shield className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        minSize: 100,
        enableResizing: false,
        cell: ({ row }) => {
          const status = row.original.status;
          const isActive = status === 'active';

          return (
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border',
                isActive
                  ? 'bg-success-subtle text-success border-success/20'
                  : 'bg-danger-subtle text-danger border-danger/20',
              )}
            >
              {status}
            </span>
          );
        },
      },
      {
        id: 'actions',
        size: 70,
        minSize: 70,
        enableResizing: false,
        header: () => <div className="text-right font-semibold text-text-primary">Actions</div>,
        cell: ({ row }) => {
          const u = row.original;
          const isActive = u.status === 'active';

          return (
            <div className="flex items-center justify-end">
              <Menu.Root>
                <Menu.Trigger
                  aria-label={`Actions for ${u.fullName}`}
                  className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer focus:outline-none"
                >
                  <MoreVertical className="h-4 w-4" />
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner side="bottom" align="end" sideOffset={4} className="z-50">
                    <Menu.Popup className="w-48 rounded-xl bg-surface-raised dark:bg-surface border border-border-default shadow-xl py-1.5 focus:outline-none animate-in fade-in-50 zoom-in-95 duration-100 text-left">
                      {isActive ? (
                        <Menu.Item
                          onClick={() =>
                            setSelectedUser({
                              userId: u.userId,
                              fullName: u.fullName,
                              action: 'suspend',
                            })
                          }
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-danger hover:bg-danger-subtle/50 transition-colors focus:bg-danger-subtle/50 focus:outline-none cursor-pointer"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 text-danger" />
                          <span>Suspend Account</span>
                        </Menu.Item>
                      ) : (
                        <Menu.Item
                          onClick={() =>
                            setSelectedUser({
                              userId: u.userId,
                              fullName: u.fullName,
                              action: 'activate',
                            })
                          }
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-success hover:bg-success-subtle/50 transition-colors focus:bg-success-subtle/50 focus:outline-none cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5 text-success" />
                          <span>Reactivate Account</span>
                        </Menu.Item>
                      )}
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Customer Accounts
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Monitor registered shoppers across the platform, verify authentication status, and enforce
          account standing.
        </p>
      </div>

      {/* Metrics Bar with Persistent Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Total Customers"
          value={isLoading ? '...' : counts.all}
          icon={Users}
          iconBg="bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400"
        />
        <KpiCard
          title="Active Accounts"
          value={isLoading ? '...' : counts.active}
          icon={UserCheck}
          iconBg="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          title="Suspended"
          value={isLoading ? '...' : counts.suspended}
          icon={ShieldAlert}
          iconBg="bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tabs with Persistent Badge Counts */}
        <div
          role="tablist"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-surface-subtle dark:bg-surface border border-border-default/60 overflow-x-auto max-w-full"
        >
          {[
            { id: 'all', label: 'All Customers', count: counts.all },
            { id: 'active', label: 'Active', count: counts.active },
            { id: 'suspended', label: 'Suspended', count: counts.suspended },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
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
            placeholder="Search by customer name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-xl bg-surface-raised dark:bg-surface border border-border-default  text-text-primary placeholder:text-text-tertiary transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-2.5 text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Modern Data Table with Server-Side Pagination and Resizable Columns */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        enableColumnResizing={true}
        manualPagination={true}
        pageCount={data?.pagination?.totalPages || 1}
        totalRows={data?.pagination?.total || 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        emptyMessage={
          search || statusFilter !== 'all'
            ? 'No customers match the active filters.'
            : 'No customer accounts registered yet.'
        }
      />

      {/* Action Confirmation Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface-raised dark:bg-surface rounded-2xl border border-border-default shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedUser.action === 'activate'
                      ? 'bg-success-subtle text-success'
                      : 'bg-danger-subtle text-danger'
                  }`}
                >
                  {selectedUser.action === 'activate' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </div>
                <h3 className="font-bold text-base text-text-primary capitalize">
                  {selectedUser.action === 'suspend'
                    ? 'Suspend Customer Account'
                    : 'Reactivate Customer Account'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-text-tertiary hover:text-text-primary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Are you sure you want to {selectedUser.action}{' '}
              <strong className="text-text-primary">{selectedUser.fullName}</strong>?
              {selectedUser.action === 'suspend' && (
                <span className="block mt-1 text-danger font-medium">
                  Suspended customers will be immediately blocked from logging in or placing orders.
                </span>
              )}
            </p>

            {selectedUser.action === 'suspend' && (
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  Reason for Suspension <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the compliance or fraud reason (minimum 3 characters)..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-surface dark:bg-surface border border-border-default  text-text-primary placeholder:text-text-tertiary"
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-text-secondary hover:bg-surface-hover border border-border-default transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedUser.action === 'suspend' && reason.trim().length < 3}
                onClick={handleActionConfirm}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs ${
                  selectedUser.action === 'activate'
                    ? 'bg-success hover:bg-success/90'
                    : 'bg-danger hover:bg-danger/90'
                }`}
              >
                Confirm {selectedUser.action === 'suspend' ? 'Suspension' : 'Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
