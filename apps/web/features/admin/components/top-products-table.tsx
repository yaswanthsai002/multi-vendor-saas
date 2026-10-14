'use client';

import { Package, Trophy } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import type { TopProduct } from '../services/admin.service';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTab } from '@/components/ui/tabs';

interface TopProductsTableProps {
  products: TopProduct[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  const [tab, setTab] = React.useState<string>('products');

  const displayProducts = products || [];

  return (
    <div className="bg-surface border border-border-default rounded-xl p-6 flex flex-col transition-colors duration-150 shadow-xs h-full">
      {/* Header & Shared Tabs Switcher */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-text-secondary stroke-[1.75]" />
          <h3 className="text-base font-semibold text-text-primary tracking-tight">Top Products</h3>
        </div>

        {/* Shared Tabs Switcher */}
        <Tabs value={tab} onValueChange={(val) => val && setTab(val)}>
          <TabsList>
            <TabsTab value="products">Products</TabsTab>
            <TabsTab value="vendors">Vendors</TabsTab>
          </TabsList>
        </Tabs>
      </div>

      {/* Table Data */}
      {tab === 'products' ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 text-center font-mono">#</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Units Sold</TableHead>
              <TableHead className="text-right">Orders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-text-tertiary">
                  No top products recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              displayProducts.map((item) => (
                <TableRow
                  key={item.productId}
                  className="hover:bg-surface-hover/70 transition-colors"
                >
                  <TableCell className="text-text-tertiary font-mono text-center">
                    {item.rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-md bg-surface-subtle border border-border-subtle overflow-hidden shrink-0 flex items-center justify-center">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-4 w-4 text-text-tertiary" />
                        )}
                      </div>
                      <span className="font-medium text-text-primary truncate max-w-50">
                        {item.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-secondary font-medium">{item.vendor}</TableCell>
                  <TableCell className="text-right font-mono font-medium text-text-primary tabular-nums">
                    {item.unitsSold}
                  </TableCell>
                  <TableCell className="text-right font-mono text-text-secondary tabular-nums">
                    {item.orders}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 text-center font-mono">#</TableHead>
              <TableHead>Vendor Store</TableHead>
              <TableHead className="text-right">Units Sold</TableHead>
              <TableHead className="text-right">Total Orders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-text-tertiary">
                  No vendor performance recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              displayProducts.map((item, idx) => (
                <TableRow
                  key={item.vendor + idx}
                  className="hover:bg-surface-hover/70 transition-colors"
                >
                  <TableCell className="text-text-tertiary font-mono text-center">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-text-primary">{item.vendor}</TableCell>
                  <TableCell className="text-right font-mono font-medium text-text-primary tabular-nums">
                    {item.unitsSold * 3}
                  </TableCell>
                  <TableCell className="text-right font-mono text-text-secondary tabular-nums">
                    {item.orders * 3}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
