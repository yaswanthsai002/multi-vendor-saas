'use client';

import {
  type ColumnDef,
  type ColumnResizeMode,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type OnChangeFn,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import * as React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  enableRowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  bulkActions?: (selectedRows: TData[]) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
  enableSorting?: boolean;
  initialSorting?: SortingState;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
  manualPagination?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  totalRows?: number;
  enableColumnResizing?: boolean;
  columnResizeMode?: ColumnResizeMode;
  getSubRows?: (row: TData) => TData[] | undefined;
  expanded?: ExpandedState;
  onExpandedChange?: OnChangeFn<ExpandedState>;
  paginateExpandedRows?: boolean;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  enableRowSelection = false,
  onRowSelectionChange,
  bulkActions,
  emptyMessage = 'No records found.',
  className,
  enableSorting = true,
  initialSorting = [],
  sorting,
  onSortingChange,
  manualSorting = false,
  manualPagination = false,
  pageCount,
  pagination,
  onPaginationChange,
  totalRows,
  enableColumnResizing = false,
  columnResizeMode = 'onChange',
  getSubRows,
  expanded,
  onExpandedChange,
  paginateExpandedRows = false,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(initialSorting);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [internalExpanded, setInternalExpanded] = React.useState<ExpandedState>({});

  const currentSorting = sorting ?? internalSorting;
  const currentPagination = pagination ?? internalPagination;
  const currentExpanded = expanded ?? internalExpanded;
  const handleSortingChange = onSortingChange ?? setInternalSorting;
  const handlePaginationChange = onPaginationChange ?? setInternalPagination;
  const handleExpandedChange = onExpandedChange ?? setInternalExpanded;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: currentSorting,
      rowSelection,
      pagination: currentPagination,
      expanded: currentExpanded,
    },
    enableSorting,
    enableRowSelection,
    enableColumnResizing,
    columnResizeMode,
    manualSorting,
    manualPagination,
    pageCount,
    getSubRows,
    paginateExpandedRows,
    onSortingChange: handleSortingChange,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: handlePaginationChange,
    onExpandedChange: handleExpandedChange,
    getCoreRowModel: getCoreRowModel(),
    ...(getSubRows ? { getExpandedRowModel: getExpandedRowModel() } : {}),
    ...(!manualSorting && enableSorting ? { getSortedRowModel: getSortedRowModel() } : {}),
    ...(!manualPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  });

  // Notify parent of row selection changes
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, table, onRowSelectionChange]);

  const selectedRowsList = table.getSelectedRowModel().rows.map((r) => r.original);
  const selectedCount = selectedRowsList.length;

  const totalFilteredRows =
    totalRows ?? (manualPagination ? data.length : table.getFilteredRowModel().rows.length);
  const startItem =
    totalFilteredRows === 0 ? 0 : currentPagination.pageIndex * currentPagination.pageSize + 1;
  const endItem = Math.min(
    (currentPagination.pageIndex + 1) * currentPagination.pageSize,
    totalFilteredRows,
  );
  const computedPageCount = pageCount ?? Math.max(1, table.getPageCount());

  return (
    <div className={cn('space-y-4', className)}>
      {/* Bulk Action Bar (when rows selected) */}
      {selectedCount > 0 && bulkActions ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle border border-border-default transition-all">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-primary">
              {selectedCount} item{selectedCount === 1 ? '' : 's'} selected
            </span>
            <button
              type="button"
              onClick={() => table.toggleAllRowsSelected(false)}
              className="text-xs text-text-tertiary hover:text-text-primary underline cursor-pointer"
            >
              Deselect all
            </button>
          </div>
          <div>{bulkActions(selectedRowsList)}</div>
        </div>
      ) : null}

      {/* Main Table Container */}
      <div className="rounded-2xl border border-border-default bg-surface-raised dark:bg-surface overflow-hidden shadow-none">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    { headerClassName?: string; className?: string } | undefined;
                  const size = header.getSize();
                  const isDefaultSize = !header.column.columnDef.size && size === 150;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'py-3.5 px-4 relative',
                        meta?.headerClassName || meta?.className,
                      )}
                      style={
                        !isDefaultSize ? { width: `${size}px`, minWidth: `${size}px` } : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {enableColumnResizing && header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="group/resizer absolute right-0 top-0 h-full w-3.5 -mr-1.5 flex items-center justify-center cursor-col-resize select-none touch-none z-10"
                          aria-label="Resize column"
                        >
                          <div
                            className={cn(
                              'w-px h-3.5 rounded-full bg-border-default dark:bg-border-strong group-hover/resizer:bg-text-tertiary group-hover/resizer:h-4.5 transition-all duration-150',
                              header.column.getIsResizing() &&
                                'w-0.5 h-full bg-text-primary dark:bg-text-primary',
                            )}
                          />
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center text-text-tertiary">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-5 w-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={cn('transition-colors', onRowClick && 'cursor-pointer')}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      { cellClassName?: string; className?: string } | undefined;
                    const size = cell.column.getSize();
                    const isDefaultSize = !cell.column.columnDef.size && size === 150;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn('py-3.5 px-4', meta?.cellClassName || meta?.className)}
                        style={
                          !isDefaultSize ? { width: `${size}px`, minWidth: `${size}px` } : undefined
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center text-text-tertiary">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="h-10 w-10 rounded-xl bg-surface-subtle flex items-center justify-center text-text-tertiary">
                      <Inbox className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-text-secondary">{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Prominent Pagination Controls */}
      {(totalFilteredRows > 0 || data.length > 0) && (
        <div className="pt-4 border-t border-border-default flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-text-secondary select-none">
          {/* Item count summary */}
          <div className="text-xs text-text-secondary">
            Showing{' '}
            <span className="font-semibold text-text-primary font-mono tabular-nums">
              {startItem}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-text-primary font-mono tabular-nums">
              {endItem}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-text-primary font-mono tabular-nums">
              {totalFilteredRows}
            </span>{' '}
            entries
          </div>

          {/* Right Controls: Rows per page, Page indicator, Navigation buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-tertiary">Rows per page:</span>
              <select
                aria-label="Rows per page"
                value={currentPagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="bg-surface-raised dark:bg-surface border border-border-default rounded-lg px-2.5 py-1 text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-text-secondary font-medium">
              Page{' '}
              <span className="font-bold text-text-primary font-mono tabular-nums">
                {currentPagination.pageIndex + 1}
              </span>{' '}
              of{' '}
              <span className="font-bold text-text-primary font-mono tabular-nums">
                {computedPageCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-border-default bg-surface dark:bg-surface-subtle hover:bg-surface-hover text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs font-semibold"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-border-default bg-surface dark:bg-surface-subtle hover:bg-surface-hover text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs font-semibold"
                aria-label="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
