'use client';

import { Menu } from '@base-ui-components/react/menu';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';

import type { CategoryTableRow } from '../types/category-table';

interface AdminCategoryActionsMenuProps {
  category: CategoryTableRow;
  onEdit?: (category: CategoryTableRow) => void;
  onAddSubcategory: (category: CategoryTableRow) => void;
  onDelete: (category: CategoryTableRow) => void;
}

export function AdminCategoryActionsMenu({
  category,
  onEdit,
  onAddSubcategory,
  onDelete,
}: AdminCategoryActionsMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`Actions for ${category.name}`}
        className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer focus:outline-none"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={4} className="z-50">
          <Menu.Popup className="w-48 rounded-xl bg-surface-raised dark:bg-surface border border-border-default shadow-xl py-1.5 focus:outline-none animate-in fade-in-50 zoom-in-95 duration-100 text-left">
            {onEdit && (
              <Menu.Item
                onClick={() => onEdit(category)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover transition-colors focus:bg-surface-hover focus:outline-none cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5 text-text-tertiary" />
                <span>Edit Category</span>
              </Menu.Item>
            )}

            <Menu.Item
              onClick={() => onAddSubcategory(category)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover transition-colors focus:bg-surface-hover focus:outline-none cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-text-tertiary" />
              <span>Add Subcategory</span>
            </Menu.Item>

            <Menu.Separator className="h-px bg-border-subtle my-1" />

            <Menu.Item
              onClick={() => onDelete(category)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-danger hover:bg-danger-subtle/50 transition-colors focus:bg-danger-subtle/50 focus:outline-none cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-danger" />
              <span>Delete Category</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
