'use client';

import { type ColumnDef, type PaginationState, type SortingState } from '@tanstack/react-table';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  CheckCircle2,
  EyeOff,
  Package,
  RotateCcw,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import type { AdminProductItem } from '@/features/admin/services/admin.service';

import { DataTable } from '@/components/ui/data-table';
import { AdminProductActionsMenu } from '@/features/admin/components/admin-product-actions-menu';
import { KpiCard } from '@/features/admin/components/kpi-card';
import { useAdminProducts, useUpdateProductModeration } from '@/features/admin/hooks/use-admin';
import { cn } from '@/lib/utils';

export default function AdminProductsPage() {
  const [searchInput, setSearchInput] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [moderationFilter, setModerationFilter] = React.useState<string>('all');
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [selectedProduct, setSelectedProduct] = React.useState<{
    productId: string;
    name: string;
    currentStatus: string;
    action: 'approved' | 'hidden' | 'rejected';
  } | null>(null);
  const [reason, setReason] = React.useState('');

  // 300ms debounce on product search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Server-side sort extraction
  const currentSort = sorting[0];
  const sortBy = currentSort ? currentSort.id : 'createdAt';
  const sortOrder = currentSort?.desc ? 'desc' : 'asc';

  // Server-side search, status filter, sorting, and pagination
  const { data, isLoading } = useAdminProducts({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: debouncedSearch || undefined,
    moderationStatus: moderationFilter === 'all' ? undefined : moderationFilter,
    sortBy,
    sortOrder,
  });

  const updateModerationMutation = useUpdateProductModeration();

  const products = data?.products ?? [];

  // Summary counts calculated server-side across all moderation statuses
  const counts = data?.counts ?? {
    total: data?.pagination?.total ?? products.length,
    approved: products.filter((p) => p.moderationStatus === 'approved').length,
    hidden: products.filter((p) => p.moderationStatus === 'hidden').length,
    rejected: products.filter((p) => p.moderationStatus === 'rejected').length,
  };

  const totalCount = counts.total;
  const approvedCount = counts.approved;
  const hiddenCount = counts.hidden;
  const rejectedCount = counts.rejected;

  const handleActionConfirm = async () => {
    if (!selectedProduct) return;

    await updateModerationMutation.mutateAsync({
      productId: selectedProduct.productId,
      status: selectedProduct.action,
      reason: reason.trim() || undefined,
    });

    setSelectedProduct(null);
    setReason('');
  };

  // ponytail: status pill badge styling with rounded-full pill tag and dot indicator
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Approved
          </span>
        );
      case 'hidden':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Hidden
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-subtle text-text-secondary border border-border-default">
            {status}
          </span>
        );
    }
  };

  // Helper for sortable column header with active sort indicator
  const renderSortableHeader = (
    title: string,
    column: { getIsSorted: () => false | 'asc' | 'desc'; toggleSorting: (desc?: boolean) => void },
    align: 'left' | 'right' = 'left',
  ) => {
    const isSorted = column.getIsSorted();
    return (
      <div className={align === 'right' ? 'text-right' : 'text-left'}>
        <button
          type="button"
          onClick={() => column.toggleSorting(isSorted === 'asc')}
          className={cn(
            'inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none py-0.5',
            isSorted ? 'text-text-primary font-bold' : 'text-text-tertiary hover:text-text-primary',
          )}
        >
          <span>{title}</span>
          {isSorted === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5 text-accent stroke-[2.5]" />
          ) : isSorted === 'desc' ? (
            <ArrowDown className="h-3.5 w-3.5 text-accent stroke-[2.5]" />
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 text-text-disabled opacity-40 hover:opacity-100" />
          )}
        </button>
      </div>
    );
  };

  // TanStack Table Column Definitions: resizable explicitly on Name and Vendor only
  const columns = React.useMemo<ColumnDef<AdminProductItem, unknown>[]>(
    () => [
      {
        id: 'select',
        size: 48,
        enableResizing: false,
        enableSorting: false,
        meta: {
          headerClassName: 'w-12 pl-4 pr-2 text-center',
          cellClassName: 'w-12 pl-4 pr-2 text-center',
        },
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            aria-label="Select all"
            className="h-4 w-4 rounded border-border-default text-accent focus:ring-accent cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            aria-label="Select row"
            className="h-4 w-4 rounded border-border-default text-accent focus:ring-accent cursor-pointer"
          />
        ),
      },
      {
        accessorKey: 'name',
        size: 300,
        enableResizing: true,
        meta: {
          headerClassName: 'min-w-[280px]',
          cellClassName: 'min-w-[280px]',
        },
        header: ({ column }) => renderSortableHeader('Name', column),
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-surface border border-border-default overflow-hidden shrink-0 flex items-center justify-center">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-4 w-4 text-text-tertiary" />
                )}
              </div>
              <span className="font-medium text-text-primary text-xs truncate max-w-sm">
                {product.name}
              </span>
            </div>
          );
        },
      },
      {
        id: 'vendor',
        size: 160,
        enableResizing: true,
        meta: {
          headerClassName: 'min-w-[160px]',
          cellClassName: 'min-w-[160px]',
        },
        accessorFn: (row) => row.vendor?.name ?? 'Direct Marketplace',
        header: ({ column }) => renderSortableHeader('Vendor', column),
        cell: ({ row }) => (
          <span className="text-text-secondary text-xs truncate block max-w-xs">
            {row.original.vendor?.name ?? 'Direct Marketplace'}
          </span>
        ),
      },
      {
        accessorKey: 'price',
        size: 120,
        enableResizing: false,
        meta: {
          headerClassName: 'w-32 pr-6 text-right',
          cellClassName: 'w-32 pr-6 text-right',
        },
        header: ({ column }) => renderSortableHeader('Price', column, 'right'),
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="text-right font-mono tabular-nums text-xs">
              <span className="font-semibold text-text-primary">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                <div className="text-[11px] text-text-tertiary line-through">
                  ₹{Number(product.compareAtPrice).toLocaleString('en-IN')}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'moderationStatus',
        size: 140,
        enableResizing: false,
        enableSorting: false,
        meta: {
          headerClassName: 'w-36 text-left',
          cellClassName: 'w-36 text-left',
        },
        header: 'Status',
        cell: ({ row }) => renderStatusBadge(row.original.moderationStatus),
      },
      {
        id: 'actions',
        size: 80,
        enableResizing: false,
        enableSorting: false,
        meta: {
          headerClassName: 'w-20 pr-4 text-right',
          cellClassName: 'w-20 pr-4 text-right',
        },
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <AdminProductActionsMenu
              product={row.original}
              onSelectAction={(p, action) =>
                setSelectedProduct({
                  productId: p.productId,
                  name: p.name,
                  currentStatus: p.moderationStatus,
                  action,
                })
              }
            />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Marketplace Products
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Supervise product listings across all vendors, manage catalog visibility, and enforce
          platform standards.
        </p>
      </div>

      {/* Metrics Row: Unified KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Listings"
          value={isLoading ? '...' : totalCount}
          icon={Package}
          iconColor="text-text-tertiary"
        />
        <KpiCard
          title="Approved"
          value={isLoading ? '...' : approvedCount}
          icon={CheckCircle2}
          iconColor="text-emerald-600 dark:text-emerald-400"
          valueClassName="text-emerald-700 dark:text-emerald-400"
        />
        <KpiCard
          title="Hidden"
          value={isLoading ? '...' : hiddenCount}
          icon={EyeOff}
          iconColor="text-amber-600 dark:text-amber-400"
          valueClassName="text-amber-700 dark:text-amber-400"
        />
        <KpiCard
          title="Rejected"
          value={isLoading ? '...' : rejectedCount}
          icon={XCircle}
          iconColor="text-rose-600 dark:text-rose-400"
          valueClassName="text-rose-700 dark:text-rose-400"
        />
      </div>

      {/* Toolbar: Unified Filter Tabs & Debounced Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Unified Pill Filter Tabs matching vendor dashboard & admin customers */}
        <div
          role="tablist"
          aria-label="Filter products by moderation status"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-surface-subtle dark:bg-surface border border-border-default/60 overflow-x-auto max-w-full"
        >
          {[
            { id: 'all', label: 'All Products', count: totalCount },
            { id: 'approved', label: 'Approved', count: approvedCount },
            { id: 'hidden', label: 'Hidden', count: hiddenCount },
            { id: 'rejected', label: 'Rejected', count: rejectedCount },
          ].map((tab) => {
            const isActive = moderationFilter === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => {
                  setModerationFilter(tab.id);
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
                className={cn(
                  'inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer',
                  isActive
                    ? 'bg-surface-raised dark:bg-surface-raised text-text-primary font-semibold border border-border-default shadow-xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 border border-transparent',
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[11px] font-semibold font-mono',
                    isActive
                      ? 'bg-accent/10 text-accent dark:bg-accent/20'
                      : 'bg-surface-hover text-text-tertiary',
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Debounced Search restricted strictly to products */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder="Search products"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="w-full pl-9 pr-8 h-9 text-xs rounded-lg bg-surface-raised dark:bg-surface border border-border-default text-text-primary placeholder:text-text-tertiary transition-colors"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* TanStack Powered Data Table with Server-side Sorting, Pagination, and Resizing on Name/Vendor only */}
      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        enableRowSelection
        enableColumnResizing
        enableSorting
        manualSorting
        sorting={sorting}
        onSortingChange={setSorting}
        manualPagination
        pagination={pagination}
        onPaginationChange={setPagination}
        pageCount={data?.pagination?.totalPages ?? 1}
        totalRows={data?.pagination?.total ?? 0}
        emptyMessage={
          debouncedSearch || moderationFilter !== 'all'
            ? 'No products matched your search or status filter.'
            : 'No products in catalog yet.'
        }
        bulkActions={(selectedRows) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                for (const p of selectedRows) {
                  await updateModerationMutation.mutateAsync({
                    productId: p.productId,
                    status: 'approved',
                  });
                }
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Bulk Approve</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                for (const p of selectedRows) {
                  await updateModerationMutation.mutateAsync({
                    productId: p.productId,
                    status: 'hidden',
                    reason: 'Bulk admin catalog withholding',
                  });
                }
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <EyeOff className="h-3.5 w-3.5" />
              <span>Bulk Hide</span>
            </button>
          </div>
        )}
      />

      {/* Reset Filter Banner when empty search result */}
      {!isLoading && products.length === 0 && (moderationFilter !== 'all' || debouncedSearch) && (
        <div className="flex justify-center -mt-2">
          <button
            type="button"
            onClick={() => {
              setModerationFilter('all');
              setSearchInput('');
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="text-xs font-medium text-accent hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset filters and search query</span>
          </button>
        </div>
      )}

      {/* Moderation Confirmation Dialog Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface-raised dark:bg-surface rounded-2xl border border-border-default shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedProduct.action === 'approved'
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                      : selectedProduct.action === 'hidden'
                        ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                        : 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {selectedProduct.action === 'approved' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : selectedProduct.action === 'hidden' ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </div>
                <h3 className="font-semibold text-sm text-text-primary capitalize">
                  {selectedProduct.action === 'approved'
                    ? 'Approve Product'
                    : selectedProduct.action === 'hidden'
                      ? 'Hide From Catalog'
                      : 'Reject Product'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="text-text-tertiary hover:text-text-primary cursor-pointer p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to change moderation status for{' '}
              <strong className="text-text-primary font-semibold">{selectedProduct.name}</strong> to{' '}
              <strong className="capitalize font-semibold text-text-primary">
                {selectedProduct.action}
              </strong>
              ?
            </p>

            {(selectedProduct.action === 'hidden' || selectedProduct.action === 'rejected') && (
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5">
                  Reason{' '}
                  {selectedProduct.action === 'rejected' ? (
                    <span className="text-danger">*</span>
                  ) : (
                    <span className="text-text-tertiary">(optional)</span>
                  )}
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this listing is being withheld or rejected..."
                  className="w-full p-2.5 text-xs rounded-lg bg-surface-subtle dark:bg-surface border border-border-default focus:outline-none focus:ring-1 focus:ring-accent text-text-primary placeholder:text-text-tertiary"
                  required={selectedProduct.action === 'rejected'}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-hover border border-border-default transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedProduct.action === 'rejected' && !reason.trim()}
                onClick={handleActionConfirm}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs ${
                  selectedProduct.action === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : selectedProduct.action === 'hidden'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {selectedProduct.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
