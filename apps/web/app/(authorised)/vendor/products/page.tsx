'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import type {
  BulkProductAction,
  ProductItem,
  ProductListFilters,
  ProductTab,
} from '@/features/products/types/product.types';

import { ProductBulkBar } from '@/features/products/components/product-bulk-bar';
import { ProductDeleteDialog } from '@/features/products/components/product-delete-dialog';
import { ProductEmptyState } from '@/features/products/components/product-empty-state';
import { ProductFilters } from '@/features/products/components/product-filters';
import { ProductHeader } from '@/features/products/components/product-header';
import { ProductTable } from '@/features/products/components/product-table';
import { ProductTableSkeleton } from '@/features/products/components/product-table-skeleton';
import { ProductTabs } from '@/features/products/components/product-tabs';
import {
  useArchiveProduct,
  useBulkProductAction,
  useDeleteProduct,
  useRestoreProduct,
  useUpdateProduct,
  useVendorProducts,
} from '@/features/products/hooks/use-products';

function VendorProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL query parameters
  const tabParam = (searchParams.get('tab') as ProductTab) || 'all';
  const activeTab: ProductTab = ['all', 'published', 'unpublished', 'archived'].includes(tabParam)
    ? tabParam
    : 'all';
  const searchQuery = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || undefined;
  const stockParam = searchParams.get('stock') as 'all' | 'in_stock' | 'out_of_stock';
  const stock: 'all' | 'in_stock' | 'out_of_stock' = ['all', 'in_stock', 'out_of_stock'].includes(
    stockParam,
  )
    ? stockParam
    : 'all';
  const sortByParam = searchParams.get('sortBy') as 'createdAt' | 'price' | 'name' | 'stock';
  const sortBy: 'createdAt' | 'price' | 'name' | 'stock' = [
    'createdAt',
    'price',
    'name',
    'stock',
  ].includes(sortByParam)
    ? sortByParam
    : 'createdAt';
  const sortOrderParam = searchParams.get('sortOrder') as 'asc' | 'desc';
  const sortOrder: 'asc' | 'desc' = sortOrderParam === 'asc' ? 'asc' : 'desc';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  // Selection state
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  // Delete dialog state
  const [deletingProduct, setDeletingProduct] = React.useState<ProductItem | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false);
  // Track toggle publish in-flight product
  const [publishingId, setPublishingId] = React.useState<string | null>(null);

  // Helper to update URL params and reset page to 1 on filter/search change
  const updateParams = React.useCallback(
    (updates: Record<string, string | null | undefined>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === undefined || val === '') {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      if (resetPage) {
        params.delete('page');
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  // Query filters mapping
  const filters: ProductListFilters = React.useMemo(() => {
    const f: ProductListFilters = {
      page,
      limit: 20,
      stock,
      sortBy,
      sortOrder,
    };

    if (searchQuery.trim()) {
      f.search = searchQuery.trim();
    }

    if (categoryId) {
      f.categoryId = categoryId;
    }

    if (activeTab === 'archived') {
      f.archived = 'true';
    } else {
      f.archived = 'false';
      if (activeTab === 'published') {
        f.published = 'true';
      } else if (activeTab === 'unpublished') {
        f.published = 'false';
      } else {
        f.published = 'all';
      }
    }

    return f;
  }, [activeTab, searchQuery, categoryId, stock, sortBy, sortOrder, page]);

  // Data fetching & mutations
  const { data, isLoading } = useVendorProducts(filters);
  const updateMutation = useUpdateProduct();
  const archiveMutation = useArchiveProduct();
  const restoreMutation = useRestoreProduct();
  const deleteMutation = useDeleteProduct();
  const bulkActionMutation = useBulkProductAction();

  const products = React.useMemo(() => data?.products || [], [data?.products]);
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };

  // Filter change handlers (resets page and clears selection)
  const handleTabChange = React.useCallback(
    (newTab: ProductTab) => {
      setSelectedIds([]);
      updateParams({ tab: newTab === 'all' ? null : newTab });
    },
    [updateParams],
  );

  const handleSearchChange = React.useCallback(
    (newSearch: string) => {
      setSelectedIds([]);
      updateParams({ search: newSearch.trim() || null });
    },
    [updateParams],
  );

  const handleCategoryChange = React.useCallback(
    (newCatId?: string) => {
      setSelectedIds([]);
      updateParams({ category: newCatId || null });
    },
    [updateParams],
  );

  const handleStockChange = React.useCallback(
    (newStock: 'all' | 'in_stock' | 'out_of_stock') => {
      setSelectedIds([]);
      updateParams({ stock: newStock === 'all' ? null : newStock });
    },
    [updateParams],
  );

  const handleSortChange = React.useCallback(
    (newSortBy: 'createdAt' | 'price' | 'name' | 'stock', newSortOrder: 'asc' | 'desc') => {
      setSelectedIds([]);
      updateParams({
        sortBy: newSortBy === 'createdAt' ? null : newSortBy,
        sortOrder: newSortOrder === 'desc' ? null : newSortOrder,
      });
    },
    [updateParams],
  );

  const handlePageChange = React.useCallback(
    (newPage: number) => {
      setSelectedIds([]);
      updateParams({ page: newPage.toString() }, false);
    },
    [updateParams],
  );

  const handleResetFilters = React.useCallback(() => {
    setSelectedIds([]);
    updateParams({
      search: null,
      category: null,
      stock: null,
      sortBy: null,
      sortOrder: null,
    });
  }, [updateParams]);

  const handleClearAllFilters = React.useCallback(() => {
    setSelectedIds([]);
    router.replace(pathname);
  }, [router, pathname]);

  // Selection handlers
  const handleToggleSelect = React.useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const handleToggleSelectAll = React.useCallback(() => {
    const pageIds = products.map((p) => p.productId);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  }, [products, selectedIds]);

  // Single row actions
  const handleTogglePublish = async (productId: string, nextPublished: boolean) => {
    setPublishingId(productId);
    try {
      await updateMutation.mutateAsync({
        productId,
        data: { published: nextPublished },
      });
    } finally {
      setPublishingId(null);
    }
  };

  const handleArchive = (productId: string) => {
    archiveMutation.mutate(productId);
  };

  const handleRestore = (productId: string) => {
    restoreMutation.mutate(productId);
  };

  const handleDelete = (product: ProductItem) => {
    setDeletingProduct(product);
  };

  // Bulk actions
  const handleBulkAction = async (action: BulkProductAction) => {
    if (selectedIds.length === 0) return;
    if (action === 'delete') {
      setIsBulkDeleting(true);
      return;
    }

    try {
      await bulkActionMutation.mutateAsync({
        action,
        productIds: selectedIds,
      });
      setSelectedIds([]);
    } catch {
      // Handled by toast
    }
  };

  // Deletion confirm
  const handleConfirmDelete = async () => {
    if (deletingProduct) {
      try {
        await deleteMutation.mutateAsync(deletingProduct.productId);
        setDeletingProduct(null);
        setSelectedIds((prev) => prev.filter((id) => id !== deletingProduct.productId));
      } catch {
        // Handled by toast
      }
    } else if (isBulkDeleting) {
      try {
        await bulkActionMutation.mutateAsync({
          action: 'delete',
          productIds: selectedIds,
        });
        setIsBulkDeleting(false);
        setSelectedIds([]);
      } catch {
        // Handled by toast
      }
    }
  };

  const isFiltered = Boolean(
    activeTab !== 'all' || searchQuery.trim() || categoryId || stock !== 'all',
  );

  return (
    <div className="space-y-6">
      {/* 1. Header with Bulk Upload & Create Product */}
      <ProductHeader />

      {/* 2. Tabs: All Products, Published, Unpublished, Archived */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <ProductTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* 3. Filter Bar: Search, Category, Stock, Sort */}
      <ProductFilters
        search={searchQuery}
        onSearchChange={handleSearchChange}
        categoryId={categoryId}
        onCategoryChange={handleCategoryChange}
        stock={stock}
        onStockChange={handleStockChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onReset={handleResetFilters}
      />

      {/* 4. Bulk Action Bar (when items selected) */}
      <ProductBulkBar
        selectedCount={selectedIds.length}
        activeTab={activeTab}
        onBulkAction={handleBulkAction}
        onClearSelection={() => setSelectedIds([])}
        isPending={bulkActionMutation.isPending}
      />

      {/* 5. Product Table, Skeletons, or Empty State */}
      {isLoading ? (
        <ProductTableSkeleton />
      ) : products.length === 0 ? (
        <ProductEmptyState isFiltered={isFiltered} onClearFilters={handleClearAllFilters} />
      ) : (
        <ProductTable
          products={products}
          total={pagination.total}
          page={page}
          limit={pagination.limit}
          activeTab={activeTab}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onPageChange={handlePageChange}
          onTogglePublish={handleTogglePublish}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onDelete={handleDelete}
          isPublishPendingId={publishingId}
        />
      )}

      {/* 6. Delete Confirmation Dialog */}
      <ProductDeleteDialog
        open={Boolean(deletingProduct) || isBulkDeleting}
        count={isBulkDeleting ? selectedIds.length : 1}
        productName={deletingProduct?.name}
        onClose={() => {
          setDeletingProduct(null);
          setIsBulkDeleting(false);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending || bulkActionMutation.isPending}
      />
    </div>
  );
}

export default function VendorProductsPage() {
  return (
    <React.Suspense fallback={<ProductTableSkeleton />}>
      <VendorProductsContent />
    </React.Suspense>
  );
}
