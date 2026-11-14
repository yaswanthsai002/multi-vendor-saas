import {
  type ColumnDef,
  type RowData,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  metaHelper,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
} from '@tanstack/react-table';

export const DATA_TABLE_FEATURES = tableFeatures({
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  expandedRowModel: createExpandedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  sortFns,
  columnMeta: metaHelper<{
    className?: string;
    headerClassName?: string;
    cellClassName?: string;
  }>(),
});

export type DataTableColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<
  typeof DATA_TABLE_FEATURES,
  TData,
  TValue
>;
