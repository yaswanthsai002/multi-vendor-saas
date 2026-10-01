'use client';

import { Menu } from '@base-ui-components/react/menu';
import { Archive, Eye, MoreHorizontal, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';

import type { ProductItem } from '../types/product.types';

interface ProductTableActionsMenuProps {
  product: ProductItem;
  isArchivedTab: boolean;
  onArchive: (productId: string) => void;
  onRestore: (productId: string) => void;
  onDelete: (product: ProductItem) => void;
}

export function ProductTableActionsMenu({
  product,
  isArchivedTab,
  onArchive,
  onRestore,
  onDelete,
}: ProductTableActionsMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`Actions for ${product.name}`}
        className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer focus:outline-none"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={4} className="z-50">
          <Menu.Popup className="w-44 rounded-xl bg-surface-raised dark:bg-surface border border-border-default shadow-xl py-1.5 focus:outline-none animate-in fade-in-50 zoom-in-95 duration-100 text-left">
            {/* View Product */}
            <Menu.Item
              render={
                <Link
                  href={`/vendor/products/${product.productId}`}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover transition-colors focus:bg-surface-hover focus:outline-none cursor-pointer"
                />
              }
            >
              <Eye className="h-3.5 w-3.5 text-text-tertiary" />
              <span>View details</span>
            </Menu.Item>

            {/* Edit Product */}
            <Menu.Item
              render={
                <Link
                  href={`/vendor/products/${product.productId}/edit`}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover transition-colors focus:bg-surface-hover focus:outline-none cursor-pointer"
                />
              }
            >
              <Pencil className="h-3.5 w-3.5 text-text-tertiary" />
              <span>Edit product</span>
            </Menu.Item>

            <Menu.Separator className="h-px bg-border-subtle my-1" />

            {/* Archive or Restore */}
            {product.isSoftDeleted || isArchivedTab ? (
              <Menu.Item
                onClick={() => onRestore(product.productId)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover transition-colors focus:bg-surface-hover focus:outline-none cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 text-text-tertiary" />
                <span>Restore product</span>
              </Menu.Item>
            ) : (
              <Menu.Item
                onClick={() => onArchive(product.productId)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover transition-colors focus:bg-surface-hover focus:outline-none cursor-pointer"
              >
                <Archive className="h-3.5 w-3.5 text-text-tertiary" />
                <span>Archive product</span>
              </Menu.Item>
            )}

            {/* Delete permanently */}
            <Menu.Item
              onClick={() => onDelete(product)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-danger-500 hover:bg-danger-500/10 transition-colors focus:bg-danger-500/10 focus:outline-none cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete permanently</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
