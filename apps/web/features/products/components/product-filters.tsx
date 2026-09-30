'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Folder, Loader2, Search, X } from 'lucide-react';
import * as React from 'react';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/query-keys';

interface CategoryItem {
  categoryId: string;
  name: string;
  slug: string;
  parentCategoryId: string | null;
  hasChildren: boolean;
}

interface ProductFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  categoryId?: string;
  onCategoryChange: (categoryId?: string) => void;
  stock: 'all' | 'in_stock' | 'out_of_stock';
  onStockChange: (stock: 'all' | 'in_stock' | 'out_of_stock') => void;
  sortBy: 'createdAt' | 'price' | 'name' | 'stock';
  sortOrder: 'asc' | 'desc';
  onSortChange: (
    sortBy: 'createdAt' | 'price' | 'name' | 'stock',
    sortOrder: 'asc' | 'desc',
  ) => void;
}

const SORT_OPTIONS: Array<{
  id: string;
  label: string;
  sortBy: 'createdAt' | 'price' | 'name' | 'stock';
  sortOrder: 'asc' | 'desc';
}> = [
  { id: 'newest', label: 'Newest', sortBy: 'createdAt', sortOrder: 'desc' },
  { id: 'oldest', label: 'Oldest', sortBy: 'createdAt', sortOrder: 'asc' },
  { id: 'name_asc', label: 'Name A–Z', sortBy: 'name', sortOrder: 'asc' },
  { id: 'name_desc', label: 'Name Z–A', sortBy: 'name', sortOrder: 'desc' },
  { id: 'price_asc', label: 'Price Low–High', sortBy: 'price', sortOrder: 'asc' },
  { id: 'price_desc', label: 'Price High–Low', sortBy: 'price', sortOrder: 'desc' },
  { id: 'stock_asc', label: 'Stock Low–High', sortBy: 'stock', sortOrder: 'asc' },
  { id: 'stock_desc', label: 'Stock High–Low', sortBy: 'stock', sortOrder: 'desc' },
];

export function ProductFilters({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  stock,
  onStockChange,
  sortBy,
  sortOrder,
  onSortChange,
}: ProductFiltersProps) {
  // Search local state with debounce
  const [localSearch, setLocalSearch] = React.useState(search);
  const [prevSearch, setPrevSearch] = React.useState(search);

  if (search !== prevSearch) {
    setPrevSearch(search);
    setLocalSearch(search);
  }

  React.useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  // Dropdown open states
  const [categoryOpen, setCategoryOpen] = React.useState(false);
  const [stockOpen, setStockOpen] = React.useState(false);
  const [sortOpen, setSortOpen] = React.useState(false);

  // Active parent for hierarchical category browsing inside the dropdown
  const [activeParentId, setActiveParentId] = React.useState<string | undefined>(undefined);
  const [parentPath, setParentPath] = React.useState<Array<{ id: string; name: string }>>([]);

  const categoryRef = React.useRef<HTMLDivElement>(null);
  const stockRef = React.useRef<HTMLDivElement>(null);
  const sortRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
      if (stockRef.current && !stockRef.current.contains(e.target as Node)) {
        setStockOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch categories for the current active parent
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: queryKeys.categories.list(activeParentId),
    queryFn: () =>
      makeApiRequest<CategoryItem[]>({
        url: API_ENDPOINTS.categories.list,
        method: 'GET',
        params: activeParentId ? { parentCategoryId: activeParentId } : undefined,
      }),
    enabled: categoryOpen,
  });

  // Selected category detail (for button label)
  const { data: selectedCategoryDetail } = useQuery({
    queryKey: queryKeys.categories.detail(categoryId || ''),
    queryFn: () =>
      makeApiRequest<CategoryItem>({
        url: API_ENDPOINTS.categories.detail(categoryId!),
        method: 'GET',
      }),
    enabled: Boolean(categoryId),
  });

  const currentSortOption =
    SORT_OPTIONS.find((opt) => opt.sortBy === sortBy && opt.sortOrder === sortOrder) ||
    SORT_OPTIONS[0];

  const stockLabel =
    stock === 'in_stock' ? 'In stock' : stock === 'out_of_stock' ? 'Out of stock' : 'Stock';

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-tertiary">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
          className="block w-full pl-9 pr-8 py-2 text-sm bg-surface dark:bg-surface-subtle border border-border-default rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-colors"
        />
        {localSearch ? (
          <button
            type="button"
            onClick={() => {
              setLocalSearch('');
              onSearchChange('');
            }}
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-tertiary hover:text-text-primary cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Filter Dropdowns Container */}
      <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
        {/* Category Filter */}
        <div className="relative" ref={categoryRef}>
          <button
            type="button"
            onClick={() => setCategoryOpen((prev) => !prev)}
            className={`inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
              categoryId
                ? 'bg-blue-50/70 border-blue-200 text-blue-700 dark:bg-atmospheric-blue-950/70 dark:border-atmospheric-blue-800 dark:text-atmospheric-blue-200'
                : 'bg-surface dark:bg-surface-subtle border-border-default hover:bg-surface-hover text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="truncate max-w-[130px]">
              {selectedCategoryDetail ? selectedCategoryDetail.name : 'Category'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
          </button>

          {categoryOpen ? (
            <div className="absolute right-0 sm:left-0 mt-1.5 w-64 rounded-xl bg-surface-raised dark:bg-surface border border-border-default shadow-xl p-1.5 z-30 animate-in fade-in-50 zoom-in-95 duration-100">
              {/* Category Breadcrumbs when drilled down */}
              {parentPath.length > 0 ? (
                <div className="flex items-center gap-1 px-2 py-1.5 text-xs text-text-tertiary border-b border-border-subtle mb-1 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveParentId(undefined);
                      setParentPath([]);
                    }}
                    className="hover:text-text-primary hover:underline cursor-pointer whitespace-nowrap"
                  >
                    Root
                  </button>
                  {parentPath.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      <ChevronRight className="h-3 w-3 shrink-0" />
                      <button
                        type="button"
                        onClick={() => {
                          setActiveParentId(item.id);
                          setParentPath((prev) => prev.slice(0, idx + 1));
                        }}
                        className={`hover:text-text-primary hover:underline cursor-pointer truncate max-w-[80px] ${
                          idx === parentPath.length - 1 ? 'font-semibold text-text-primary' : ''
                        }`}
                      >
                        {item.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              ) : null}

              {/* All Categories Option */}
              <button
                type="button"
                onClick={() => {
                  onCategoryChange(undefined);
                  setCategoryOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-left cursor-pointer transition-colors ${
                  !categoryId
                    ? 'bg-blue-50 text-blue-700 dark:bg-atmospheric-blue-950/80 dark:text-atmospheric-blue-200'
                    : 'text-text-primary hover:bg-surface-hover'
                }`}
              >
                <span>All Categories</span>
                {!categoryId ? <span className="text-xs font-bold">✓</span> : null}
              </button>

              <div className="h-px bg-border-subtle my-1" />

              {/* Category List */}
              <div className="max-h-56 overflow-y-auto space-y-0.5">
                {isCategoriesLoading ? (
                  <div className="p-4 flex items-center justify-center text-text-tertiary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : categoriesData && categoriesData.length > 0 ? (
                  categoriesData.map((cat) => (
                    <div
                      key={cat.categoryId}
                      className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-surface-hover transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onCategoryChange(cat.categoryId);
                          setCategoryOpen(false);
                        }}
                        className={`flex-1 flex items-center gap-2 text-xs font-medium text-left cursor-pointer truncate ${
                          categoryId === cat.categoryId
                            ? 'text-blue-700 dark:text-atmospheric-blue-200 font-semibold'
                            : 'text-text-primary'
                        }`}
                      >
                        <Folder className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
                        <span className="truncate">{cat.name}</span>
                      </button>

                      {cat.hasChildren ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveParentId(cat.categoryId);
                            setParentPath((prev) => [
                              ...prev,
                              { id: cat.categoryId, name: cat.name },
                            ]);
                          }}
                          aria-label={`Explore subcategories of ${cat.name}`}
                          className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-text-tertiary">
                    No subcategories found.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Stock Filter */}
        <div className="relative" ref={stockRef}>
          <button
            type="button"
            onClick={() => setStockOpen((prev) => !prev)}
            className={`inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
              stock !== 'all'
                ? 'bg-blue-50/70 border-blue-200 text-blue-700 dark:bg-atmospheric-blue-950/70 dark:border-atmospheric-blue-800 dark:text-atmospheric-blue-200'
                : 'bg-surface dark:bg-surface-subtle border-border-default hover:bg-surface-hover text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>{stockLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
          </button>

          {stockOpen ? (
            <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-surface-raised dark:bg-surface border border-border-default shadow-xl p-1 z-30 animate-in fade-in-50 zoom-in-95 duration-100">
              {(['all', 'in_stock', 'out_of_stock'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onStockChange(opt);
                    setStockOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left cursor-pointer transition-colors ${
                    stock === opt
                      ? 'bg-blue-50 text-blue-700 dark:bg-atmospheric-blue-950/80 dark:text-atmospheric-blue-200 font-semibold'
                      : 'text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  <span>
                    {opt === 'all' ? 'All' : opt === 'in_stock' ? 'In stock' : 'Out of stock'}
                  </span>
                  {stock === opt ? <span className="text-xs font-bold">✓</span> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Sort Filter */}
        <div className="relative" ref={sortRef}>
          <button
            type="button"
            onClick={() => setSortOpen((prev) => !prev)}
            className="inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border border-border-default bg-surface dark:bg-surface-subtle hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <span>Sort: {currentSortOption.label}</span>
            <ChevronDown className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
          </button>

          {sortOpen ? (
            <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-surface-raised dark:bg-surface border border-border-default shadow-xl p-1 z-30 animate-in fade-in-50 zoom-in-95 duration-100">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = opt.sortBy === sortBy && opt.sortOrder === sortOrder;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSortChange(opt.sortBy, opt.sortOrder);
                      setSortOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 dark:bg-atmospheric-blue-950/80 dark:text-atmospheric-blue-200 font-semibold'
                        : 'text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected ? <span className="text-xs font-bold">✓</span> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
