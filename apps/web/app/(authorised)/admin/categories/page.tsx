'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef, type ExpandedState } from '@tanstack/react-table';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  ChevronsUpDown,
  CornerDownRight,
  Folder,
  GitFork,
  Layers,
  LayoutGrid,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { toast } from 'sonner';

import type { CategoryTableRow } from '@/features/admin/types/category-table';

import { DataTable } from '@/components/ui/data-table';
import { AdminCategoryActionsMenu } from '@/features/admin/components/admin-category-actions-menu';
import { KpiCard } from '@/features/admin/components/kpi-card';
import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/query-keys';
import { cn } from '@/lib/utils';

interface CategoryNode {
  categoryId: string;
  name: string;
  slug: string;
  parentCategoryId: string | null;
  imageUrl?: string | null;
  hasChildren?: boolean;
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [parentId, setParentId] = React.useState<string>('');
  const [targetParentCategory, setTargetParentCategory] = React.useState<CategoryTableRow | null>(
    null,
  );

  const [editTarget, setEditTarget] = React.useState<CategoryTableRow | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editImageUrl, setEditImageUrl] = React.useState('');

  const [deleteTarget, setDeleteTarget] = React.useState<CategoryTableRow | null>(null);

  // Debounce search input and auto-expand tree when searching
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      if (searchInput.trim()) {
        setExpanded(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: categories = [], isLoading } = useQuery<CategoryNode[]>({
    queryKey: queryKeys.categories.list(undefined, true),
    queryFn: () =>
      makeApiRequest<CategoryNode[]>({
        url: `${API_ENDPOINTS.categories.list}?all=true`,
        method: 'GET',
      }),
  });

  const createMutation = useMutation({
    mutationFn: (newCat: {
      name: string;
      parentCategoryId?: string | null;
      imageUrl?: string | null;
    }) =>
      makeApiRequest({
        url: API_ENDPOINTS.categories.create,
        method: 'POST',
        data: newCat,
      }),
    onSuccess: () => {
      toast.success('Category created successfully');
      setIsCreateOpen(false);
      setName('');
      setImageUrl('');
      setParentId('');
      setTargetParentCategory(null);
      if (parentId) {
        // Auto-expand tree so user immediately sees their created subcategory
        setExpanded(true);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to create category';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: { name: string; imageUrl?: string | null };
    }) =>
      makeApiRequest({
        url: API_ENDPOINTS.categories.detail(categoryId),
        method: 'PATCH',
        data: payload,
      }),
    onSuccess: () => {
      toast.success('Category updated successfully');
      setEditTarget(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to update category';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) =>
      makeApiRequest({
        url: API_ENDPOINTS.categories.detail(categoryId),
        method: 'DELETE',
      }),
    onSuccess: () => {
      toast.success('Category deleted successfully');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : 'Cannot delete category: it is assigned to products or has subcategories.';
      toast.error(message);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({
      name: name.trim(),
      parentCategoryId: parentId ? parentId : null,
      imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editName.trim()) return;
    updateMutation.mutate({
      categoryId: editTarget.categoryId,
      payload: {
        name: editName.trim(),
        imageUrl: editImageUrl.trim() ? editImageUrl.trim() : null,
      },
    });
  };

  const handleOpenAddSubcategory = (parentCategory: CategoryTableRow) => {
    setParentId(parentCategory.categoryId);
    setTargetParentCategory(parentCategory);
    setName('');
    setImageUrl('');
    setIsCreateOpen(true);
  };

  const handleOpenCreateRoot = () => {
    setParentId('');
    setTargetParentCategory(null);
    setName('');
    setImageUrl('');
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (category: CategoryTableRow) => {
    setEditTarget(category);
    setEditName(category.name);
    setEditImageUrl(category.imageUrl ?? '');
  };

  // ponytail: recursive tree builder supporting arbitrary category depth
  const tableRows = React.useMemo<CategoryTableRow[]>(() => {
    const idMap = new Map<string, CategoryNode>();
    const childrenByParent = new Map<string, CategoryNode[]>();

    categories.forEach((cat) => {
      idMap.set(cat.categoryId, cat);
      if (cat.parentCategoryId) {
        const existing = childrenByParent.get(cat.parentCategoryId) || [];
        existing.push(cat);
        childrenByParent.set(cat.parentCategoryId, existing);
      }
    });

    const buildNode = (
      cat: CategoryNode,
      depth: number,
      parentName?: string | null,
    ): CategoryTableRow => {
      const rawChildren = childrenByParent.get(cat.categoryId) || [];
      const sortedChildren = [...rawChildren].sort((a, b) => a.name.localeCompare(b.name));
      const subRows = sortedChildren.map((child) => buildNode(child, depth + 1, cat.name));

      return {
        categoryId: cat.categoryId,
        name: cat.name,
        slug: cat.slug,
        parentCategoryId: cat.parentCategoryId,
        parentName: parentName ?? null,
        hasChildren: subRows.length > 0,
        childCount: subRows.length,
        level: depth,
        imageUrl: cat.imageUrl,
        subRows: subRows.length > 0 ? subRows : undefined,
      };
    };

    // Roots are categories without parent OR whose parent is missing in data (orphan safety)
    const roots = categories.filter((c) => !c.parentCategoryId || !idMap.has(c.parentCategoryId));
    const sortedRoots = [...roots].sort((a, b) => a.name.localeCompare(b.name));
    const fullTree = sortedRoots.map((root) => buildNode(root, 0, null));

    const query = search.trim().toLowerCase();
    if (!query) return fullTree;

    // Filter tree keeping ancestor branches if any descendant matches
    const filterBranch = (node: CategoryTableRow): CategoryTableRow | null => {
      const nodeMatches =
        node.name.toLowerCase().includes(query) || node.slug.toLowerCase().includes(query);

      const filteredSubRows = (node.subRows || [])
        .map(filterBranch)
        .filter((r): r is CategoryTableRow => r !== null);

      if (nodeMatches || filteredSubRows.length > 0) {
        return {
          ...node,
          subRows: filteredSubRows.length > 0 ? filteredSubRows : undefined,
        };
      }
      return null;
    };

    return fullTree.map(filterBranch).filter((r): r is CategoryTableRow => r !== null);
  }, [categories, search]);

  const rootCount = categories.filter((c) => !c.parentCategoryId).length;
  const subCount = categories.filter((c) => !!c.parentCategoryId).length;

  const isAllExpanded =
    expanded === true || (typeof expanded === 'object' && Object.keys(expanded).length > 0);

  const handleToggleExpandAll = () => {
    setExpanded((prev) => {
      const currentlyExpanded =
        prev === true || (typeof prev === 'object' && Object.keys(prev).length > 0);
      return currentlyExpanded ? {} : true;
    });
  };

  // TanStack Table Columns
  const columns = React.useMemo<ColumnDef<CategoryTableRow>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            aria-label="Select all rows"
            className="h-4 w-4 rounded border-border-default text-accent focus:ring-accent accent-accent cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            aria-label={`Select category ${row.original.name}`}
            className="h-4 w-4 rounded border-border-default text-accent focus:ring-accent accent-accent cursor-pointer"
          />
        ),
        enableSorting: false,
        size: 48,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-semibold text-text-primary hover:text-accent transition-colors cursor-pointer"
            >
              <span>Category</span>
              {isSorted === 'asc' ? (
                <ArrowUp className="h-3.5 w-3.5 text-accent" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="h-3.5 w-3.5 text-accent" />
              ) : (
                <ArrowUpDown className="h-3.5 w-3.5 text-text-disabled" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const item = row.original;
          const isChild = row.depth > 0;
          const canExpand = row.getCanExpand();
          const isExpanded = row.getIsExpanded();

          return (
            <div
              className="flex items-center gap-2.5 min-w-0"
              style={{
                paddingLeft: isChild ? `${row.depth * 24}px` : undefined,
              }}
            >
              {isChild && <CornerDownRight className="h-3.5 w-3.5 text-text-disabled shrink-0" />}
              {canExpand ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    row.toggleExpanded();
                  }}
                  aria-label={isExpanded ? `Collapse ${item.name}` : `Expand ${item.name}`}
                  className="h-6 w-6 rounded-md hover:bg-surface-hover flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors cursor-pointer shrink-0"
                >
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-transform duration-150',
                      isExpanded && 'rotate-90 text-accent',
                    )}
                  />
                </button>
              ) : (
                <div className="w-6 shrink-0" />
              )}

              {item.imageUrl ? (
                <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-border-default shrink-0 bg-surface-subtle">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : row.depth === 0 ? (
                <div className="h-8 w-8 rounded-lg bg-surface-subtle border border-border-default flex items-center justify-center text-accent shrink-0">
                  <Layers className="h-4 w-4" />
                </div>
              ) : (
                <div className="h-7 w-7 rounded-lg bg-surface-subtle border border-border-subtle flex items-center justify-center text-text-tertiary shrink-0">
                  <Folder className="h-3.5 w-3.5" />
                </div>
              )}

              <div className="flex items-center gap-2 min-w-0 truncate">
                <span
                  className={cn(
                    'truncate',
                    isChild
                      ? 'font-medium text-text-secondary text-xs sm:text-sm'
                      : 'font-semibold text-text-primary text-sm',
                  )}
                >
                  {item.name}
                </span>
                {item.childCount > 0 && (
                  <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-subtle text-text-secondary border border-border-default font-mono tabular-nums">
                    {item.childCount} sub{item.childCount === 1 ? '' : 's'}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'slug',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1.5 font-semibold text-text-primary hover:text-accent transition-colors cursor-pointer"
            >
              <span>Slug Path</span>
              {isSorted === 'asc' ? (
                <ArrowUp className="h-3.5 w-3.5 text-accent" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="h-3.5 w-3.5 text-accent" />
              ) : (
                <ArrowUpDown className="h-3.5 w-3.5 text-text-disabled" />
              )}
            </button>
          );
        },
        cell: ({ row }) => (
          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-surface-subtle text-text-secondary border border-border-subtle inline-block">
            /{row.original.slug}
          </span>
        ),
      },
      {
        id: 'structure',
        accessorFn: (row) => (row.parentCategoryId ? 'Subcategory' : 'Root'),
        header: 'Type',
        cell: ({ row }) => {
          const depth = row.depth;
          return depth === 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
              <Layers className="h-3 w-3" />
              <span>Root</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-subtle text-text-secondary border border-border-default">
              <Folder className="h-3 w-3 text-text-tertiary" />
              <span>Subcategory {depth > 1 ? `(L${depth + 1})` : ''}</span>
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right font-semibold text-text-primary">Actions</div>,
        cell: ({ row }) => {
          const item = row.original;
          const isRoot = !item.parentCategoryId;

          return (
            <div className="flex items-center justify-end gap-1.5">
              <AdminCategoryActionsMenu
                category={item}
                onEdit={handleOpenEdit}
                onAddSubcategory={handleOpenAddSubcategory}
                onDelete={setDeleteTarget}
              />
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Marketplace Categories
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Global taxonomy and hierarchical category catalog for marketplace product
            classification.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateRoot}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-on-accent font-semibold text-xs sm:text-sm hover:bg-accent/90 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Unified KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Total Categories"
          value={isLoading ? '...' : categories.length}
          icon={Layers}
          iconBg="bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400"
        />
        <KpiCard
          title="Root Categories"
          value={isLoading ? '...' : rootCount}
          icon={LayoutGrid}
          iconBg="bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
        />
        <KpiCard
          title="Subcategories"
          value={isLoading ? '...' : subCount}
          icon={GitFork}
          iconBg="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Toolbar: Search + Expand All Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search categories or subcategories..."
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

          {search && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggleExpandAll}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border-default bg-surface dark:bg-surface-subtle hover:bg-surface-hover text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <ChevronsUpDown className="h-3.5 w-3.5 text-text-tertiary" />
          <span>{isAllExpanded ? 'Collapse All' : 'Expand All'}</span>
        </button>
      </div>

      {/* Tree Data Table */}
      <DataTable
        columns={columns}
        data={tableRows}
        getSubRows={(row) => row.subRows}
        expanded={expanded}
        onExpandedChange={setExpanded}
        paginateExpandedRows={false}
        isLoading={isLoading}
        enableRowSelection
        enableSorting
        emptyMessage={
          search
            ? 'No categories match the search query.'
            : 'No categories found in the marketplace catalog.'
        }
        bulkActions={(selectedRows) => (
          <button
            type="button"
            onClick={() => {
              const ids = selectedRows.map((r) => r.categoryId);
              toast.info(
                `Selected ${ids.length} categories. Use individual category actions menu to delete with dependency checks.`,
              );
            }}
            className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-xs font-semibold text-danger border border-border-default transition-colors cursor-pointer"
          >
            Action on Selected ({selectedRows.length})
          </button>
        )}
      />

      {/* Create Category Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-raised dark:bg-surface border border-border-default rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  {targetParentCategory
                    ? `Add Subcategory under ${targetParentCategory.name}`
                    : 'Create Root Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setTargetParentCategory(null);
                }}
                className="text-text-tertiary hover:text-text-primary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {targetParentCategory ? (
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Parent Category
                  </label>
                  <div className="p-3 rounded-xl bg-surface-subtle border border-border-default text-xs font-medium text-text-primary flex items-center gap-2">
                    <Layers className="h-4 w-4 text-accent" />
                    <span>{targetParentCategory.name}</span>
                    <span className="text-text-tertiary font-mono">
                      (/{targetParentCategory.slug})
                    </span>
                  </div>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  Category Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    targetParentCategory ? 'e.g. In-Ear Monitors' : 'e.g. Audio Equipment'
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-surface dark:bg-surface border border-border-default  text-text-primary placeholder:text-text-tertiary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/category-image.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-surface dark:bg-surface border border-border-default  text-text-primary placeholder:text-text-tertiary"
                />
              </div>

              {!targetParentCategory && (
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Parent Category (Optional)
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full p-3 text-xs sm:text-sm rounded-xl bg-surface dark:bg-surface border border-border-default  text-text-primary cursor-pointer"
                  >
                    <option value="">None (Top-Level Root Category)</option>
                    {categories
                      .filter((c) => !c.parentCategoryId)
                      .map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setTargetParentCategory(null);
                  }}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-text-secondary hover:bg-surface-hover border border-border-default transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || createMutation.isPending}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-accent text-on-accent hover:bg-accent/90 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                >
                  {createMutation.isPending
                    ? 'Creating...'
                    : targetParentCategory
                      ? 'Add Subcategory'
                      : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-raised dark:bg-surface border border-border-default rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <Pencil className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-text-primary">Edit Category</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="text-text-tertiary hover:text-text-primary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  Category Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-surface dark:bg-surface border border-border-default  text-text-primary placeholder:text-text-tertiary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/category-image.png"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-surface dark:bg-surface border border-border-default  text-text-primary placeholder:text-text-tertiary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-text-secondary hover:bg-surface-hover border border-border-default transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editName.trim() || updateMutation.isPending}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-accent text-on-accent hover:bg-accent/90 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-raised dark:bg-surface border border-border-default rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-danger-subtle text-danger flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Delete Category</h3>
            </div>

            {deleteTarget.hasChildren ? (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">{deleteTarget.name}</strong> cannot be
                  deleted because it contains{' '}
                  <span className="font-semibold text-danger">
                    {deleteTarget.childCount} subcategory
                    {deleteTarget.childCount === 1 ? '' : 'ies'}
                  </span>
                  .
                </p>
                <div className="p-3 rounded-xl bg-warning-subtle/40 border border-warning/20 text-xs text-text-secondary">
                  Please delete or reassign its child subcategories before attempting to delete this
                  category.
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-text-primary">{deleteTarget.name}</strong>? This action
                cannot be undone. Categories assigned to active products cannot be deleted.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-text-secondary hover:bg-surface-hover border border-border-default transition-colors cursor-pointer"
              >
                {deleteTarget.hasChildren ? 'Close' : 'Cancel'}
              </button>
              {!deleteTarget.hasChildren && (
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(deleteTarget.categoryId)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-danger text-white hover:bg-danger/90 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
