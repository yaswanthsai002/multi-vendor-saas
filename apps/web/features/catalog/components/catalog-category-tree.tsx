'use client';

import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import * as React from 'react';

import type { CatalogCategory } from '../types/catalog.types';

interface CategoryNode extends CatalogCategory {
  children: CategoryNode[];
}

interface CatalogCategoryTreeProps {
  categories: CatalogCategory[];
  selectedCategories: string[];
  onToggleCategory: (categorySlug: string) => void;
  onClearCategories: () => void;
}

// ponytail: build 2-level category tree from flat list of categories
function buildCategoryTree(categories: CatalogCategory[]): CategoryNode[] {
  const nodeMap = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const c of categories) {
    nodeMap.set(c.categoryId, { ...c, children: [] });
  }

  for (const c of categories) {
    const node = nodeMap.get(c.categoryId)!;
    if (c.parentCategoryId && nodeMap.has(c.parentCategoryId)) {
      nodeMap.get(c.parentCategoryId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function CatalogCategoryTree({
  categories,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
}: CatalogCategoryTreeProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [manualToggles, setManualToggles] = React.useState<Record<string, boolean>>({});

  const tree = React.useMemo(() => buildCategoryTree(categories), [categories]);

  const toggleExpand = (categoryId: string, currentlyExpanded: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    setManualToggles((prev) => ({
      ...prev,
      [categoryId]: !currentlyExpanded,
    }));
  };

  const filteredTree = React.useMemo(() => {
    if (!searchTerm.trim()) return tree;
    const term = searchTerm.toLowerCase();

    return tree
      .map((root) => {
        const rootMatches = root.name.toLowerCase().includes(term);
        const matchingChildren = root.children.filter((child) =>
          child.name.toLowerCase().includes(term),
        );

        if (rootMatches || matchingChildren.length > 0) {
          return {
            ...root,
            children: rootMatches ? root.children : matchingChildren,
          };
        }
        return null;
      })
      .filter((node): node is CategoryNode => node !== null);
  }, [tree, searchTerm]);

  const isAllSelected = selectedCategories.length === 0;

  return (
    <div className="flex flex-col gap-2">
      {/* Category In-sidebar Search (if >6 categories) */}
      {categories.length > 6 && (
        <div className="relative mb-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-7.5 w-full rounded-md border border-border-default bg-surface pl-8 pr-2.5 text-xs text-text-primary placeholder:text-text-tertiary "
          />
        </div>
      )}

      <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1 no-scrollbar">
        {/* All Categories reset pill */}
        <button
          type="button"
          onClick={onClearCategories}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left cursor-pointer ${
            isAllSelected
              ? 'bg-accent/10 text-accent font-bold'
              : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
          }`}
        >
          <span className="flex items-center gap-2">
            <span
              className={`h-3.5 w-3.5 rounded border flex items-center justify-center transition-colors ${
                isAllSelected
                  ? 'border-accent bg-accent text-white'
                  : 'border-border-default bg-surface-raised'
              }`}
            >
              {isAllSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            <span>All Categories</span>
          </span>
          <span className="text-[10px] text-text-tertiary">
            ({categories.reduce((acc, c) => acc + (c.productCount || 0), 0)})
          </span>
        </button>

        {/* Tree Nodes */}
        {filteredTree.map((root) => {
          const isRootSelected =
            selectedCategories.includes(root.slug) || selectedCategories.includes(root.categoryId);
          const hasChildren = root.children.length > 0;
          const isAutoExpanded =
            isRootSelected ||
            root.children.some(
              (child) =>
                selectedCategories.includes(child.slug) ||
                selectedCategories.includes(child.categoryId),
            );
          const isExpanded =
            Boolean(searchTerm) || (manualToggles[root.categoryId] ?? isAutoExpanded);

          return (
            <div key={root.categoryId} className="flex flex-col">
              {/* Root Category Row */}
              <div
                className={`group flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer select-none ${
                  isRootSelected
                    ? 'bg-accent/10 text-accent font-semibold'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
                onClick={() => onToggleCategory(root.slug)}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {/* Chevron Toggle */}
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(root.categoryId, isExpanded, e)}
                      className="p-0.5 rounded text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer shrink-0"
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${root.name}`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-text-secondary" />
                      )}
                    </button>
                  ) : (
                    <span className="w-4 shrink-0" />
                  )}

                  {/* Multi-select Checkbox */}
                  <input
                    type="checkbox"
                    checked={isRootSelected}
                    onChange={() => onToggleCategory(root.slug)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Filter by ${root.name}`}
                    className="h-3.5 w-3.5 rounded border-border-default text-accent focus:ring-border-focus cursor-pointer shrink-0"
                  />

                  {/* Category Name */}
                  <span className="truncate">{root.name}</span>
                </div>

                {/* Product Count */}
                {root.productCount !== undefined && (
                  <span className="text-[10px] text-text-tertiary shrink-0 ml-1">
                    ({root.productCount})
                  </span>
                )}
              </div>

              {/* Nested Subcategories (indented underneath) */}
              {hasChildren && isExpanded && (
                <div className="flex flex-col gap-0.5 pl-6 my-0.5 border-l border-border-subtle ml-3">
                  {root.children.map((child) => {
                    const isChildSelected =
                      selectedCategories.includes(child.slug) ||
                      selectedCategories.includes(child.categoryId);

                    return (
                      <div
                        key={child.categoryId}
                        className={`flex items-center justify-between px-2 py-1 rounded-md text-xs transition-colors cursor-pointer select-none ${
                          isChildSelected
                            ? 'bg-accent/10 text-accent font-semibold'
                            : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                        }`}
                        onClick={() => onToggleCategory(child.slug)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChildSelected}
                            onChange={() => onToggleCategory(child.slug)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Filter by ${child.name}`}
                            className="h-3.5 w-3.5 rounded border-border-default text-accent focus:ring-border-focus cursor-pointer shrink-0"
                          />
                          <span className="truncate">{child.name}</span>
                        </div>

                        {child.productCount !== undefined && (
                          <span className="text-[10px] text-text-tertiary shrink-0 ml-1">
                            ({child.productCount})
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
