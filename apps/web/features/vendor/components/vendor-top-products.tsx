'use client';

import { ChevronRight, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import type { TopProduct } from '../types/vendor-dashboard.types';

interface VendorTopProductsProps {
  products?: TopProduct[];
  isLoading?: boolean;
}

export function VendorTopProducts({ products = [], isLoading }: VendorTopProductsProps) {
  return (
    <div className="bg-surface-raised dark:bg-surface border border-border-default rounded-xl p-6 flex flex-col justify-between transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-text-primary">Top Products</h3>
        <Link
          href="/vendor/products"
          className="text-xs sm:text-sm font-semibold text-secondary-accent hover:underline flex items-center gap-1 transition-colors"
        >
          <span>View all products</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Products Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-subtle text-xs font-semibold text-text-tertiary">
              <th className="py-2.5 pr-4">Product</th>
              <th className="py-2.5 px-4 text-center">Units Sold</th>
              <th className="py-2.5 px-4">Sales</th>
              <th className="py-2.5 pl-4 text-right">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-sm">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-surface-subtle rounded-lg shrink-0" />
                      <div className="space-y-1">
                        <div className="h-4 w-28 bg-surface-subtle rounded" />
                        <div className="h-3 w-20 bg-surface-subtle rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-4 w-6 bg-surface-subtle rounded mx-auto" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-16 bg-surface-subtle rounded" />
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <div className="h-4 w-8 bg-surface-subtle rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-text-tertiary">
                  No active products found.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const isOutOfStock = product.stock === 0;

                return (
                  <tr
                    key={product.productId}
                    className="hover:bg-surface-hover/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {product.thumbnailUrl ? (
                          <div className="h-9 w-9 rounded-lg overflow-hidden bg-surface-subtle shrink-0 border border-border-default">
                            <Image
                              src={product.thumbnailUrl}
                              alt={product.name}
                              width={36}
                              height={36}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-surface-subtle flex items-center justify-center text-text-tertiary shrink-0 border border-border-subtle">
                            <Package className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary truncate">{product.name}</p>
                          <p className="text-xs text-text-tertiary truncate">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-text-secondary">
                      {product.unitsSold > 0 ? product.unitsSold : '—'}
                    </td>
                    <td className="py-3 px-4 font-medium text-text-primary">
                      {product.sales > 0 ? `₹ ${product.sales.toLocaleString('en-IN')}` : '₹ —'}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <span
                        className={`font-semibold text-xs ${
                          isOutOfStock ? 'text-danger font-bold' : 'text-text-secondary'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
