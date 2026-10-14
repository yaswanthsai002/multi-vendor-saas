'use client';

import { Menu } from '@base-ui-components/react/menu';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import {
  AlertTriangle,
  Check,
  Clock,
  Eye,
  MoreVertical,
  Plus,
  Search,
  ShieldAlert,
  Star,
  Store,
  UserCheck,
  X,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { toast } from 'sonner';

import type { AdminVendorItem } from '@/features/admin/services/admin.service';

import { DataTable } from '@/components/ui/data-table';
import { KpiCard } from '@/features/admin/components/kpi-card';
import { OnboardVendorDialog } from '@/features/admin/components/onboard-vendor-dialog';
import {
  useAdminVendors,
  useToggleVendorFeature,
  useUpdateVendorStatus,
} from '@/features/admin/hooks/use-admin';
import { cn } from '@/lib/utils';

export default function AdminVendorsPage() {
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [isOnboardOpen, setIsOnboardOpen] = React.useState(false);
  const [inspectingVendor, setInspectingVendor] = React.useState<AdminVendorItem | null>(null);

  const [statusModalTarget, setStatusModalTarget] = React.useState<{
    vendorId: string;
    name: string;
    status: 'pending' | 'active' | 'suspended' | 'rejected';
    actionLabel: string;
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

  const { data, isLoading } = useAdminVendors({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: search.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const updateStatusMutation = useUpdateVendorStatus();
  const toggleFeatureMutation = useToggleVendorFeature();

  const vendors = data?.vendors ?? [];
  const counts = data?.counts ?? {
    all: 0,
    pending: 0,
    active: 0,
    suspended: 0,
    rejected: 0,
  };

  const handleStatusConfirm = async () => {
    if (!statusModalTarget) return;

    await updateStatusMutation.mutateAsync({
      vendorId: statusModalTarget.vendorId,
      status: statusModalTarget.status,
      reason: reason.trim() || undefined,
    });

    if (inspectingVendor?.vendorId === statusModalTarget.vendorId) {
      setInspectingVendor((prev) => (prev ? { ...prev, status: statusModalTarget.status } : null));
    }

    setStatusModalTarget(null);
    setReason('');
  };

  // Bulk status update action
  const handleBulkStatusChange = async (
    selectedVendors: AdminVendorItem[],
    targetStatus: 'active' | 'suspended' | 'rejected',
  ) => {
    const statusLabel =
      targetStatus === 'active'
        ? 'approved'
        : targetStatus === 'suspended'
          ? 'suspended'
          : 'rejected';

    try {
      await Promise.all(
        selectedVendors.map((v) =>
          updateStatusMutation.mutateAsync({
            vendorId: v.vendorId,
            status: targetStatus,
            reason: `Bulk administrative ${statusLabel}`,
          }),
        ),
      );
      toast.success(
        `Successfully ${statusLabel} ${selectedVendors.length} vendor${selectedVendors.length === 1 ? '' : 's'}.`,
      );
    } catch {
      toast.error('An error occurred during bulk status update.');
    }
  };

  const columns = React.useMemo<ColumnDef<AdminVendorItem>[]>(
    () => [
      {
        id: 'select',
        size: 44,
        enableResizing: false,
        enableSorting: false,
        meta: {
          headerClassName: 'w-11 pl-4 pr-1 text-center',
          cellClassName: 'w-11 pl-4 pr-1 text-center',
        },
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            aria-label="Select all vendors"
            className="h-4 w-4 rounded border-border-default text-accent focus:ring-accent accent-accent cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${row.original.name}`}
            className="h-4 w-4 rounded border-border-default text-accent focus:ring-accent accent-accent cursor-pointer"
          />
        ),
      },
      {
        accessorKey: 'name',
        header: 'Brand',
        size: 260,
        minSize: 180,
        enableResizing: true,
        cell: ({ row }) => {
          const v = row.original;
          return (
            <div className="flex items-center gap-3 min-w-0">
              {v.logoUrl ? (
                <div className="relative h-9 w-9 rounded-xl overflow-hidden border border-border-default shrink-0 bg-surface-subtle">
                  <Image src={v.logoUrl} alt={v.name} fill unoptimized className="object-cover" />
                </div>
              ) : (
                <div className="h-9 w-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/20">
                  <Store className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0">
                <div className="font-semibold text-text-primary text-sm truncate flex items-center gap-1.5">
                  <span className="truncate">{v.name}</span>
                  {v.isFeatured && (
                    <span
                      title="Featured Brand"
                      className="inline-flex items-center text-amber-500 shrink-0"
                    >
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'owner',
        header: 'Owner',
        size: 230,
        minSize: 170,
        enableResizing: true,
        cell: ({ row }) => {
          const owner = row.original.owner;
          if (!owner) {
            return <span className="text-xs text-text-tertiary">Unassigned</span>;
          }
          return (
            <div className="min-w-0">
              <div className="font-medium text-text-primary text-sm truncate">{owner.fullName}</div>
              <div className="text-xs text-text-secondary truncate">{owner.email}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'productCount',
        header: 'Catalog',
        size: 130,
        minSize: 100,
        enableResizing: true,
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-text-secondary px-2.5 py-1 rounded-lg bg-surface-subtle border border-border-default font-mono tabular-nums">
            {row.original.productCount} product{row.original.productCount === 1 ? '' : 's'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        minSize: 100,
        enableResizing: false,
        cell: ({ row }) => {
          const status = row.original.status;
          const statusConfig =
            {
              active:
                'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
              pending:
                'bg-amber-300 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/40',
              suspended:
                'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
              rejected: 'bg-surface-subtle text-text-tertiary border-border-default',
            }[status] || 'bg-surface-subtle text-text-tertiary border-border-default';

          return (
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border',
                statusConfig,
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
          const v = row.original;
          const isPending = v.status === 'pending';
          const isActive = v.status === 'active';
          const isSuspended = v.status === 'suspended';
          const isRejected = v.status === 'rejected';

          return (
            <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
              <Menu.Root>
                <Menu.Trigger
                  aria-label={`Actions for ${v.name}`}
                  className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer focus:outline-none"
                >
                  <MoreVertical className="h-4 w-4" />
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner side="bottom" align="end" sideOffset={4} className="z-50">
                    <Menu.Popup className="w-52 rounded-xl bg-surface-raised dark:bg-surface border border-border-default shadow-xl py-1.5 focus:outline-none animate-in fade-in-50 zoom-in-95 duration-100 text-left">
                      <Menu.Item
                        onClick={() => setInspectingVendor(v)}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover transition-colors focus:bg-surface-hover focus:outline-none cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5 text-text-tertiary" />
                        <span>Inspect Store</span>
                      </Menu.Item>

                      {isPending && (
                        <>
                          <Menu.Item
                            onClick={() =>
                              setStatusModalTarget({
                                vendorId: v.vendorId,
                                name: v.name,
                                status: 'active',
                                actionLabel: 'Approve Vendor Store',
                              })
                            }
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-success hover:bg-success-subtle/50 transition-colors focus:bg-success-subtle/50 focus:outline-none cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5 text-success" />
                            <span>Approve Store</span>
                          </Menu.Item>
                          <Menu.Item
                            onClick={() =>
                              setStatusModalTarget({
                                vendorId: v.vendorId,
                                name: v.name,
                                status: 'rejected',
                                actionLabel: 'Reject Vendor Application',
                              })
                            }
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-danger hover:bg-danger-subtle/50 transition-colors focus:bg-danger-subtle/50 focus:outline-none cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5 text-danger" />
                            <span>Reject Store</span>
                          </Menu.Item>
                        </>
                      )}

                      {isActive && (
                        <>
                          <Menu.Item
                            onClick={() =>
                              toggleFeatureMutation.mutate({
                                vendorId: v.vendorId,
                                isFeatured: !v.isFeatured,
                              })
                            }
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover transition-colors focus:bg-surface-hover focus:outline-none cursor-pointer"
                          >
                            <Star
                              className={cn(
                                'h-3.5 w-3.5',
                                v.isFeatured
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-text-tertiary',
                              )}
                            />
                            <span>{v.isFeatured ? 'Remove Featured' : 'Feature Brand'}</span>
                          </Menu.Item>
                          <Menu.Item
                            onClick={() =>
                              setStatusModalTarget({
                                vendorId: v.vendorId,
                                name: v.name,
                                status: 'suspended',
                                actionLabel: 'Suspend Vendor Store',
                              })
                            }
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-danger hover:bg-danger-subtle/50 transition-colors focus:bg-danger-subtle/50 focus:outline-none cursor-pointer"
                          >
                            <ShieldAlert className="h-3.5 w-3.5 text-danger" />
                            <span>Suspend Store</span>
                          </Menu.Item>
                        </>
                      )}

                      {isSuspended && (
                        <Menu.Item
                          onClick={() =>
                            setStatusModalTarget({
                              vendorId: v.vendorId,
                              name: v.name,
                              status: 'active',
                              actionLabel: 'Reactivate Vendor Store',
                            })
                          }
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-success hover:bg-success-subtle/50 transition-colors focus:bg-success-subtle/50 focus:outline-none cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5 text-success" />
                          <span>Reactivate Store</span>
                        </Menu.Item>
                      )}

                      {isRejected && (
                        <Menu.Item
                          onClick={() =>
                            setStatusModalTarget({
                              vendorId: v.vendorId,
                              name: v.name,
                              status: 'active',
                              actionLabel: 'Re-evaluate & Approve Vendor',
                            })
                          }
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-success hover:bg-success-subtle/50 transition-colors focus:bg-success-subtle/50 focus:outline-none cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5 text-success" />
                          <span>Approve Store</span>
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
    [toggleFeatureMutation],
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Vendors & Merchant Stores
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Review onboarding vendor applications, manage verified storefronts, and enforce merchant
            standing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOnboardOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-accent hover:bg-accent/90 transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Onboard Vendor</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Total Vendors"
          value={isLoading ? '...' : counts.all}
          icon={Store}
          iconBg="bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400"
        />
        <KpiCard
          title="Active Stores"
          value={isLoading ? '...' : counts.active}
          icon={UserCheck}
          iconBg="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          title="Pending Approval"
          value={isLoading ? '...' : counts.pending}
          icon={Clock}
          iconBg="bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
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
        {/* Tabs */}
        <div
          role="tablist"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-surface-subtle dark:bg-surface border border-border-default/60 overflow-x-auto max-w-full"
        >
          {[
            { id: 'all', label: 'All Vendors', count: counts.all },
            { id: 'active', label: 'Active', count: counts.active },
            { id: 'pending', label: 'Pending Approval', count: counts.pending },
            { id: 'suspended', label: 'Suspended', count: counts.suspended },
            { id: 'rejected', label: 'Rejected', count: counts.rejected },
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
            placeholder="Search by store name, slug, or owner..."
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

      {/* Modern Data Table with Resizable Columns, Checkboxes & Bulk Actions */}
      <DataTable
        columns={columns}
        data={vendors}
        isLoading={isLoading}
        enableRowSelection={true}
        enableColumnResizing={true}
        onRowClick={(vendor) => setInspectingVendor(vendor)}
        bulkActions={(selectedRows) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkStatusChange(selectedRows, 'active')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-success text-white hover:bg-success/90 transition-colors cursor-pointer"
            >
              <Check className="h-3 w-3" />
              <span>Approve ({selectedRows.length})</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatusChange(selectedRows, 'suspended')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-danger text-white hover:bg-danger/90 transition-colors cursor-pointer"
            >
              <ShieldAlert className="h-3 w-3" />
              <span>Suspend</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatusChange(selectedRows, 'rejected')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-surface-hover text-text-secondary hover:text-text-primary border border-border-default transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span>Reject</span>
            </button>
          </div>
        )}
        manualPagination={true}
        pageCount={data?.pagination?.totalPages || 1}
        totalRows={data?.pagination?.total || 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        emptyMessage={
          search || statusFilter !== 'all'
            ? 'No vendor stores match the active filter criteria.'
            : 'No vendor accounts registered yet.'
        }
      />

      {/* Row-Click Vendor Detail Inspector Modal */}
      {inspectingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface-raised dark:bg-surface rounded-2xl border border-border-default shadow-2xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {inspectingVendor.logoUrl ? (
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-border-default shrink-0 bg-surface-subtle">
                    <Image
                      src={inspectingVendor.logoUrl}
                      alt={inspectingVendor.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/20">
                    <Store className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-text-primary">{inspectingVendor.name}</h3>
                    {inspectingVendor.isFeatured && (
                      <span
                        title="Featured Brand"
                        className="inline-flex items-center text-amber-500"
                      >
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-tertiary font-mono">
                    Store ID: {inspectingVendor.vendorId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingVendor(null)}
                className="text-text-tertiary hover:text-text-primary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle space-y-1">
                <span className="text-text-tertiary font-medium">Standing</span>
                <div className="font-semibold text-text-primary capitalize">
                  {inspectingVendor.status}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle space-y-1">
                <span className="text-text-tertiary font-medium">Catalog Volume</span>
                <div className="font-semibold text-text-primary font-mono tabular-nums">
                  {inspectingVendor.productCount} active products
                </div>
              </div>
              <div className="col-span-2 p-3 rounded-xl bg-surface-subtle border border-border-subtle space-y-1">
                <span className="text-text-tertiary font-medium">Store Owner</span>
                <div className="font-semibold text-text-primary">
                  {inspectingVendor.owner?.fullName || 'Unassigned'}
                </div>
                <div className="text-text-secondary text-[11px]">
                  {inspectingVendor.owner?.email || 'N/A'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => {
                  toggleFeatureMutation.mutate({
                    vendorId: inspectingVendor.vendorId,
                    isFeatured: !inspectingVendor.isFeatured,
                  });
                  setInspectingVendor((prev) =>
                    prev ? { ...prev, isFeatured: !prev.isFeatured } : null,
                  );
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-default text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <Star
                  className={cn(
                    'h-3.5 w-3.5',
                    inspectingVendor.isFeatured
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-text-tertiary',
                  )}
                />
                <span>{inspectingVendor.isFeatured ? 'Unfeature Brand' : 'Feature Brand'}</span>
              </button>

              <div className="flex items-center gap-2">
                {inspectingVendor.status !== 'active' && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusModalTarget({
                        vendorId: inspectingVendor.vendorId,
                        name: inspectingVendor.name,
                        status: 'active',
                        actionLabel: 'Approve Vendor Store',
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-success text-white hover:bg-success/90 transition-colors cursor-pointer"
                  >
                    Approve Store
                  </button>
                )}
                {inspectingVendor.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusModalTarget({
                        vendorId: inspectingVendor.vendorId,
                        name: inspectingVendor.name,
                        status: 'suspended',
                        actionLabel: 'Suspend Vendor Store',
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-danger text-white hover:bg-danger/90 transition-colors cursor-pointer"
                  >
                    Suspend Store
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setInspectingVendor(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface-hover border border-border-default transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {statusModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface-raised dark:bg-surface rounded-2xl border border-border-default shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    statusModalTarget.status === 'active'
                      ? 'bg-success-subtle text-success'
                      : 'bg-danger-subtle text-danger'
                  }`}
                >
                  {statusModalTarget.status === 'active' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </div>
                <h3 className="font-bold text-base text-text-primary">
                  {statusModalTarget.actionLabel}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setStatusModalTarget(null)}
                className="text-text-tertiary hover:text-text-primary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Are you sure you want to update standing for{' '}
              <strong className="text-text-primary">{statusModalTarget.name}</strong>?
              {statusModalTarget.status === 'suspended' && (
                <span className="block mt-1 text-danger font-medium">
                  Products belonging to this vendor will be automatically hidden from search and
                  catalog.
                </span>
              )}
            </p>

            {(statusModalTarget.status === 'suspended' ||
              statusModalTarget.status === 'rejected') && (
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  Reason <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide an explanation for this compliance decision (minimum 3 characters)..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-surface dark:bg-surface border border-border-default  text-text-primary placeholder:text-text-tertiary"
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalTarget(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-text-secondary hover:bg-surface-hover border border-border-default transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  (statusModalTarget.status === 'suspended' ||
                    statusModalTarget.status === 'rejected') &&
                  reason.trim().length < 3
                }
                onClick={handleStatusConfirm}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs ${
                  statusModalTarget.status === 'active'
                    ? 'bg-success hover:bg-success/90'
                    : 'bg-danger hover:bg-danger/90'
                }`}
              >
                Confirm {statusModalTarget.status === 'active' ? 'Approval' : 'Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Vendor Modal */}
      <OnboardVendorDialog isOpen={isOnboardOpen} onClose={() => setIsOnboardOpen(false)} />
    </div>
  );
}
