'use client';

import { Package } from 'lucide-react';
import Image from 'next/image';

import type { AdminProductItem } from '../services/admin.service';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function PromotionProductPickerResults({
  products,
  selectedIds,
  selectedCount,
  maxSelected,
  isLoading,
  isError,
  canSelectPage,
  selectedEntirePage,
  onRetry,
  onProductToggle,
  onTogglePage,
}: {
  products: AdminProductItem[];
  selectedIds: Set<string>;
  selectedCount: number;
  maxSelected: number;
  isLoading: boolean;
  isError: boolean;
  canSelectPage: boolean;
  selectedEntirePage: boolean;
  onRetry: () => void;
  onProductToggle: (product: AdminProductItem, checked: boolean) => void;
  onTogglePage: () => void;
}) {
  if (isLoading) {
    return (
      <div aria-label="Loading products" className="space-y-3 py-4">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="h-12 animate-pulse rounded-md bg-surface-subtle" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="rounded-lg border border-border-default p-5 text-center">
        <p className="text-sm text-text-secondary">Products couldn’t load.</p>
        <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Select</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const checked = selectedIds.has(product.productId);
            return (
              <TableRow key={product.productId}>
                <TableCell>
                  <input
                    type="checkbox"
                    aria-label={`${checked ? 'Remove' : 'Add'} ${product.name}`}
                    checked={checked}
                    disabled={!checked && selectedCount >= maxSelected}
                    onChange={(event) => onProductToggle(product, event.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-accent"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex min-w-52 items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-subtle">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <Package size={18} className="text-text-tertiary" aria-hidden="true" />
                      )}
                    </div>
                    <span className="line-clamp-2 font-medium">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-text-secondary">
                  {product.vendor.name}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-nums">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
            );
          })}
          {!products.length && (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center text-text-secondary">
                No matching published products.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {products.length > 0 && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-3"
          disabled={!canSelectPage}
          onClick={onTogglePage}
        >
          {selectedEntirePage ? 'Clear this page' : 'Select this page'}
        </Button>
      )}
    </>
  );
}
