'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { useCatalog, useCatalogFacets } from '../hooks/use-catalog';

import { CatalogFilters } from './catalog-filters';
import { CatalogProductGrid } from './catalog-product-grid';
import { CatalogSortBar } from './catalog-sort-bar';

import type { CatalogFilters as FilterValues, CatalogSortBy } from '../types/catalog.types';

import { Pagination } from '@/shared/components/pagination/pagination';

interface CatalogViewProps {
  initialCategory?: string;
}

export function CatalogView({ initialCategory }: CatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);

  // Parse filters from URL search params
  const filters: FilterValues = React.useMemo(() => {
    const page = Number(searchParams?.get('page')) || 1;
    const limit = Number(searchParams?.get('limit')) || 20;
    const search = searchParams?.get('search') || undefined;
    const categoryParam = searchParams?.get('category');
    const category = initialCategory
      ? initialCategory
      : categoryParam
        ? categoryParam
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;
    const vendor = searchParams?.get('vendor') || undefined;
    const minPrice = searchParams?.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : undefined;
    const maxPrice = searchParams?.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined;
    const inStock = searchParams?.get('inStock') === 'true' ? true : undefined;
    const isFeatured = searchParams?.get('isFeatured') === 'true' ? true : undefined;
    const sortBy = (searchParams?.get('sortBy') as CatalogSortBy) || 'featured';

    return {
      page,
      limit,
      search,
      category,
      vendor,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      sortBy,
    };
  }, [searchParams, initialCategory]);

  const { data: catalogData, isLoading } = useCatalog(filters);
  const { data: facetsData } = useCatalogFacets();

  // Helper to push URL changes
  const updateUrl = React.useCallback(
    (newFilters: FilterValues) => {
      const params = new URLSearchParams();

      if (newFilters.page && newFilters.page > 1) {
        params.set('page', String(newFilters.page));
      }
      if (newFilters.limit && newFilters.limit !== 20) {
        params.set('limit', String(newFilters.limit));
      }
      if (newFilters.search) {
        params.set('search', newFilters.search);
      }
      if (newFilters.category && !initialCategory) {
        if (Array.isArray(newFilters.category)) {
          if (newFilters.category.length > 0) {
            params.set('category', newFilters.category.join(','));
          }
        } else {
          params.set('category', newFilters.category);
        }
      }
      if (newFilters.vendor) {
        params.set('vendor', newFilters.vendor);
      }
      if (newFilters.minPrice !== undefined) {
        params.set('minPrice', String(newFilters.minPrice));
      }
      if (newFilters.maxPrice !== undefined) {
        params.set('maxPrice', String(newFilters.maxPrice));
      }
      if (newFilters.inStock) {
        params.set('inStock', 'true');
      }
      if (newFilters.isFeatured) {
        params.set('isFeatured', 'true');
      }
      if (newFilters.sortBy && newFilters.sortBy !== 'featured') {
        params.set('sortBy', newFilters.sortBy);
      }

      const queryString = params.toString();
      const targetPath = initialCategory ? `/category/${initialCategory}` : '/products';
      router.replace(queryString ? `${targetPath}?${queryString}` : targetPath, { scroll: false });
    },
    [router, initialCategory],
  );

  const handleFilterChange = React.useCallback(
    (updates: Partial<FilterValues>) => {
      updateUrl({ ...filters, ...updates });
    },
    [filters, updateUrl],
  );

  const handleResetFilters = React.useCallback(() => {
    updateUrl({
      page: 1,
      limit: 20,
      sortBy: 'featured',
      category: initialCategory,
    });
  }, [updateUrl, initialCategory]);

  // Construct active filter chips
  const activeFilterChips = React.useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (filters.search) {
      chips.push({
        key: 'search',
        label: `Search: "${filters.search}"`,
        onRemove: () => handleFilterChange({ search: undefined, page: 1 }),
      });
    }

    if (filters.category && !initialCategory) {
      const selectedSlugs = Array.isArray(filters.category)
        ? filters.category
        : filters.category
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

      for (const slug of selectedSlugs) {
        const matchedCat = facetsData?.categories.find(
          (c) => c.slug === slug || c.categoryId === slug,
        );
        chips.push({
          key: `cat-${slug}`,
          label: matchedCat ? matchedCat.name : slug,
          onRemove: () => {
            const next = selectedSlugs.filter((s) => s !== slug);
            handleFilterChange({ category: next.length > 0 ? next : undefined, page: 1 });
          },
        });
      }
    }

    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      chips.push({
        key: 'price',
        label: `₹${filters.minPrice} – ₹${filters.maxPrice}`,
        onRemove: () => handleFilterChange({ minPrice: undefined, maxPrice: undefined, page: 1 }),
      });
    } else if (filters.minPrice !== undefined) {
      chips.push({
        key: 'minPrice',
        label: `Min: ₹${filters.minPrice}`,
        onRemove: () => handleFilterChange({ minPrice: undefined, page: 1 }),
      });
    } else if (filters.maxPrice !== undefined) {
      chips.push({
        key: 'maxPrice',
        label: `Max: ₹${filters.maxPrice}`,
        onRemove: () => handleFilterChange({ maxPrice: undefined, page: 1 }),
      });
    }

    if (filters.inStock) {
      chips.push({
        key: 'inStock',
        label: 'In Stock Only',
        onRemove: () => handleFilterChange({ inStock: undefined, page: 1 }),
      });
    }

    if (filters.isFeatured) {
      chips.push({
        key: 'isFeatured',
        label: 'Featured Only',
        onRemove: () => handleFilterChange({ isFeatured: undefined, page: 1 }),
      });
    }

    return chips;
  }, [filters, initialCategory, facetsData, handleFilterChange]);

  const currentCategoryName = React.useMemo(() => {
    if (!filters.category) return null;
    if (Array.isArray(filters.category)) {
      if (filters.category.length === 0) return null;
      if (filters.category.length === 1) {
        const cat = facetsData?.categories.find(
          (c) => c.slug === filters.category![0] || c.categoryId === filters.category![0],
        );
        return cat ? cat.name : filters.category[0];
      }
      return `${filters.category.length} Categories Selected`;
    }
    const cat = facetsData?.categories.find(
      (c) => c.slug === filters.category || c.categoryId === filters.category,
    );
    return cat ? cat.name : filters.category;
  }, [filters.category, facetsData]);

  const hasFilters =
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    Boolean(filters.inStock) ||
    Boolean(filters.isFeatured);

  return (
    <div className="w-full bg-background min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumbs"
          className="flex items-center gap-1.5 text-xs text-text-tertiary mb-4 flex-wrap"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-text-primary transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-text-tertiary" />
          <Link
            href="/products"
            className={`hover:text-text-primary transition-colors ${
              !currentCategoryName ? 'font-bold text-text-primary' : ''
            }`}
          >
            Products
          </Link>
          {currentCategoryName && (
            <>
              <ChevronRight className="h-3 w-3 text-text-tertiary" />
              <span className="font-bold text-text-primary">{currentCategoryName}</span>
            </>
          )}
        </nav>

        {/* Section Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-text-primary tracking-tight">
            {filters.search
              ? `Search Results for "${filters.search}"`
              : currentCategoryName
                ? currentCategoryName
                : 'All Products'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">
            {currentCategoryName
              ? `Explore verified products direct from makers in ${currentCategoryName}.`
              : 'Direct from authorized makers and verified independent vendors. Quality guaranteed.'}
          </p>
        </div>

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr] gap-6 lg:gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block sticky top-20 rounded-xl border border-border-default bg-surface-raised p-4 shadow-2xs">
            <CatalogFilters
              categories={facetsData?.categories || []}
              filters={filters}
              priceRange={facetsData?.priceRange}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />
          </aside>

          {/* Main Product Catalog Section */}
          <main className="flex flex-col min-w-0">
            {/* Sort & active filters toolbar */}
            <CatalogSortBar
              totalItems={catalogData?.pagination.total ?? 0}
              currentSort={filters.sortBy || 'featured'}
              onSortChange={(sortBy) => handleFilterChange({ sortBy, page: 1 })}
              activeFilterChips={activeFilterChips}
              activeFilterCount={activeFilterChips.length}
              onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
            />

            {/* Product Card Grid */}
            <CatalogProductGrid
              products={catalogData?.items || []}
              isLoading={isLoading}
              hasFilters={hasFilters}
              onResetFilters={handleResetFilters}
            />

            {/* Pagination Controls */}
            {catalogData && catalogData.pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  page={catalogData.pagination.page}
                  totalPages={catalogData.pagination.totalPages}
                  totalItems={catalogData.pagination.total}
                  limit={catalogData.pagination.limit}
                  onPageChange={(page) => handleFilterChange({ page })}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-xs transition-opacity">
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-surface-raised shadow-xl">
            <CatalogFilters
              categories={facetsData?.categories || []}
              filters={filters}
              priceRange={facetsData?.priceRange}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              isMobileModal={true}
              onCloseMobileModal={() => setIsMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
