'use client';

import { Menu } from '@base-ui-components/react/menu';
import { CheckCircle2, ExternalLink, EyeOff, MoreHorizontal, XCircle } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import type { AdminProductItem } from '../services/admin.service';

interface AdminProductActionsMenuProps {
  product: AdminProductItem;
  onSelectAction: (product: AdminProductItem, action: 'approved' | 'hidden' | 'rejected') => void;
}

export function AdminProductActionsMenu({ product, onSelectAction }: AdminProductActionsMenuProps) {
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
          <Menu.Popup className="w-48 rounded-xl bg-surface-raised dark:bg-surface border border-border-default shadow-xl py-1.5 focus:outline-none animate-in fade-in-50 zoom-in-95 duration-100 text-left">
            {/* View on storefront / details */}
            <Menu.Item
              render={
                <Link
                  href={`/shop/products/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover transition-colors focus:bg-surface-hover focus:outline-none cursor-pointer"
                />
              }
            >
              <ExternalLink className="h-3.5 w-3.5 text-text-tertiary" />
              <span>View in marketplace</span>
            </Menu.Item>

            <Menu.Separator className="h-px bg-border-subtle my-1" />

            {/* Approve Listing */}
            {product.moderationStatus !== 'approved' && (
              <Menu.Item
                onClick={() => onSelectAction(product, 'approved')}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-success hover:bg-success-subtle/50 transition-colors focus:bg-success-subtle/50 focus:outline-none cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                <span>Approve product</span>
              </Menu.Item>
            )}

            {/* Hide from Storefront */}
            {product.moderationStatus !== 'hidden' && (
              <Menu.Item
                onClick={() => onSelectAction(product, 'hidden')}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-warning hover:bg-warning-subtle/50 transition-colors focus:bg-warning-subtle/50 focus:outline-none cursor-pointer"
              >
                <EyeOff className="h-3.5 w-3.5 text-warning" />
                <span>Hide from catalog</span>
              </Menu.Item>
            )}

            {/* Reject Listing */}
            {product.moderationStatus !== 'rejected' && (
              <Menu.Item
                onClick={() => onSelectAction(product, 'rejected')}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-danger hover:bg-danger-subtle/50 transition-colors focus:bg-danger-subtle/50 focus:outline-none cursor-pointer"
              >
                <XCircle className="h-3.5 w-3.5 text-danger" />
                <span>Reject product</span>
              </Menu.Item>
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
