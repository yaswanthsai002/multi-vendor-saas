'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Folder,
  Loader2,
  Search,
  Tag,
  X,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/query-keys';

interface CategoryItem {
  categoryId: string;
  name: string;
  slug: string;
  parentCategoryId: string | null;
  imageUrl?: string | null;
  hasChildren: boolean;
}

export interface SelectedCategory {
  categoryId: string;
  name: string;
  imageUrl?: string | null;
  path?: string;
}

interface ProductCategoryPickerProps {
  selectedCategories: SelectedCategory[];
  onToggleCategory: (category: SelectedCategory) => void;
  error?: string;
}

/**
 * Renders category image provided by admin or falls back to generic Lucide icon.
 * No hardcoded emojis.
 */
function CategoryVisual({
  imageUrl,
  name,
  isFolder = false,
  size = 'md',
}: {
  imageUrl?: string | null;
  name: string;
  isFolder?: boolean;
  size?: 'sm' | 'md';
}) {
  const [hasError, setHasError] = React.useState(false);

  const containerClasses = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const iconClasses = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  if (imageUrl && !hasError) {
    return (
      <div
        className={`relative ${containerClasses} rounded-sm overflow-hidden shrink-0 border border-border-default/60 bg-surface-subtle`}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          unoptimized
          sizes="20px"
          className="object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  if (isFolder) {
    return <Folder className={`${iconClasses} text-text-tertiary shrink-0`} />;
  }

  return <Tag className={`${iconClasses} text-text-tertiary shrink-0`} />;
}

export function ProductCategoryPicker({
  selectedCategories,
  onToggleCategory,
  error,
}: ProductCategoryPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeParentId, setActiveParentId] = React.useState<string | undefined>(undefined);
  const [parentPath, setParentPath] = React.useState<Array<{ id: string; name: string }>>([]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Single selected category (Option A: 1 leaf category)
  const selectedCategory = selectedCategories[0] || null;

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSearching = searchQuery.trim().length > 0;
  const trimmedSearch = searchQuery.trim();

  // 1. Query for hierarchy browsing
  const { data: browseCategories, isLoading: isBrowseLoading } = useQuery({
    queryKey: queryKeys.categories.list(activeParentId),
    queryFn: () =>
      makeApiRequest<CategoryItem[]>({
        url: API_ENDPOINTS.categories.list,
        method: 'GET',
        params: activeParentId ? { parentCategoryId: activeParentId } : undefined,
      }),
    enabled: isOpen && !isSearching,
  });

  // 2. Query for global search results
  const { data: searchCategories, isLoading: isSearchLoading } = useQuery({
    queryKey: ['categories', 'search', trimmedSearch],
    queryFn: () =>
      makeApiRequest<CategoryItem[]>({
        url: API_ENDPOINTS.categories.list,
        method: 'GET',
        params: { search: trimmedSearch },
      }),
    enabled: isOpen && isSearching,
  });

  const isLoading = isSearching ? isSearchLoading : isBrowseLoading;
  const displayedCategories = (isSearching ? searchCategories : browseCategories) || [];

  const handleDrilldown = (cat: CategoryItem) => {
    setActiveParentId(cat.categoryId);
    setParentPath((prev) => [...prev, { id: cat.categoryId, name: cat.name }]);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleGoBack = () => {
    if (parentPath.length <= 1) {
      setActiveParentId(undefined);
      setParentPath([]);
    } else {
      const nextPath = parentPath.slice(0, -1);
      setActiveParentId(nextPath[nextPath.length - 1].id);
      setParentPath(nextPath);
    }
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const currentPathString = parentPath.map((p) => p.name).join(' > ');

  return (
    <div className="rounded-2xl border border-border-default bg-surface dark:bg-surface-subtle p-6 space-y-4 shadow-xs">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">
          Categories
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
          Select a leaf category for your product.
        </p>
      </div>

      {error ? <p className="text-xs text-danger font-medium">{error}</p> : null}

      {/* Single-Select Fixed-Height Combobox Container */}
      <div ref={containerRef} className="relative">
        <div
          onClick={() => {
            inputRef.current?.focus();
            setIsOpen(true);
          }}
          className={`w-full h-11 px-3.5 flex items-center justify-between gap-2.5 rounded-xl border bg-surface dark:bg-surface-subtle transition-colors cursor-pointer ${
            error
              ? 'border-danger ring-1 ring-danger'
              : isOpen
                ? 'border-accent ring-2 ring-accent/20'
                : 'border-border-default hover:border-border-strong'
          }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0 h-full">
            <Search className="h-4 w-4 text-text-tertiary shrink-0" />

            {selectedCategory && !isSearching ? (
              /* Selected single category chip */
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-hover dark:bg-white/10 text-text-primary border border-border-default hover:border-accent/40 shadow-2xs truncate">
                  <CategoryVisual
                    imageUrl={selectedCategory.imageUrl}
                    name={selectedCategory.name}
                    size="sm"
                  />
                  <span
                    className="truncate max-w-[200px] sm:max-w-[300px]"
                    title={selectedCategory.path || selectedCategory.name}
                  >
                    {selectedCategory.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCategory(selectedCategory);
                      setSearchQuery('');
                      inputRef.current?.focus();
                    }}
                    className="text-text-tertiary hover:text-danger cursor-pointer rounded p-0.5 transition-colors ml-0.5"
                    aria-label={`Remove ${selectedCategory.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
            ) : (
              /* Single search input */
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!isOpen) setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={
                  selectedCategory
                    ? 'Search to change category...'
                    : 'Search or select a category...'
                }
                className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none!"
              />
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {searchQuery ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className="text-text-tertiary hover:text-text-primary p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen((prev) => !prev);
              }}
              className="text-text-tertiary hover:text-text-primary p-0.5 cursor-pointer"
              aria-label="Toggle categories dropdown"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-text-primary' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Dropdown Results List */}
        {isOpen ? (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-border-default bg-surface dark:bg-surface-subtle shadow-xl overflow-hidden flex flex-col max-h-[340px] animate-in fade-in-50 zoom-in-95 duration-100">
            {/* Header: Breadcrumbs (when browsing) or Search notice (when searching) */}
            {!isSearching ? (
              parentPath.length > 0 ? (
                <div className="flex items-center gap-1.5 px-3.5 py-2 text-xs border-b border-border-subtle bg-surface-subtle/30 text-text-secondary">
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="inline-flex items-center gap-1 font-semibold text-accent hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                  <span className="text-text-tertiary">/</span>
                  <span className="truncate font-medium text-text-primary">
                    {currentPathString}
                  </span>
                </div>
              ) : (
                <div className="px-3.5 py-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider border-b border-border-subtle">
                  All Categories
                </div>
              )
            ) : (
              <div className="flex items-center justify-between px-3.5 py-2 text-xs text-text-tertiary border-b border-border-subtle bg-surface-subtle/20">
                <span>Search results for &ldquo;{trimmedSearch}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-accent hover:underline cursor-pointer text-[11px] font-medium"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Scrollable Category Options */}
            <div className="overflow-y-auto p-1.5 space-y-0.5 flex-1 min-h-[140px] max-h-[280px]">
              {isLoading ? (
                <div className="p-8 flex items-center justify-center text-text-tertiary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : displayedCategories.length > 0 ? (
                displayedCategories.map((cat) => {
                  const isLeaf = !cat.hasChildren;
                  const isSelected = selectedCategory?.categoryId === cat.categoryId;

                  if (isLeaf) {
                    /* Leaf category: Single-select radio choice */
                    return (
                      <div
                        key={cat.categoryId}
                        onClick={() => {
                          onToggleCategory({
                            categoryId: cat.categoryId,
                            name: cat.name,
                            imageUrl: cat.imageUrl,
                            path: currentPathString
                              ? `${currentPathString} > ${cat.name}`
                              : cat.name,
                          });
                          setIsOpen(false);
                          setSearchQuery('');
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer select-none transition-colors ${
                          isSelected
                            ? 'bg-accent/10 dark:bg-accent/15 text-text-primary border-l-2 border-accent'
                            : 'hover:bg-surface-hover text-text-primary'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <CategoryVisual imageUrl={cat.imageUrl} name={cat.name} size="md" />
                          <span className="truncate">{cat.name}</span>
                        </div>

                        {/* Semantic Radio Indicator */}
                        <div
                          className={`h-4 w-4 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
                            isSelected
                              ? 'border-accent bg-accent text-on-accent'
                              : 'border-border-strong bg-surface'
                          }`}
                        >
                          {isSelected ? (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          ) : null}
                        </div>
                      </div>
                    );
                  }

                  /* Parent category: Drills down on click */
                  return (
                    <button
                      key={cat.categoryId}
                      type="button"
                      onClick={() => handleDrilldown(cat)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-text-primary hover:bg-surface-hover cursor-pointer transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <CategoryVisual
                          imageUrl={cat.imageUrl}
                          name={cat.name}
                          isFolder
                          size="md"
                        />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-text-tertiary">
                  {isSearching
                    ? `No categories matching "${trimmedSearch}".`
                    : 'No subcategories found in this category.'}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
