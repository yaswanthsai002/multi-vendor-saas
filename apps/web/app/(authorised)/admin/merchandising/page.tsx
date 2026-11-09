'use client';

import { Package, Percent, Sparkles, Store, Tag } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { KpiCard } from '@/features/admin/components/kpi-card';
import { MerchandisingFeaturedBrands } from '@/features/admin/components/merchandising-featured-brands';
import { MerchandisingFeaturedProducts } from '@/features/admin/components/merchandising-featured-products';
import { useAdminProducts, useMerchandisingOverview } from '@/features/admin/hooks/use-admin';

export default function AdminMerchandisingPage() {
  const [activeTab, setActiveTab] = React.useState<'products' | 'brands' | 'deals'>('products');

  const { data: overview, isLoading: isOverviewLoading } = useMerchandisingOverview();
  const { data: allProductsData } = useAdminProducts({});
  const allProducts = allProductsData?.products ?? [];
  const discountedProducts = allProducts.filter((p) => p.mrp && Number(p.mrp) > Number(p.price));
  const featuredProductCount = overview?.counts?.featuredProducts ?? 0;
  const featuredBrandCount = overview?.counts?.featuredBrands ?? 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Marketplace Merchandising
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Choose products and brands to feature across the marketplace.
          </p>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Featured Products"
          value={isOverviewLoading ? '...' : featuredProductCount}
          icon={Sparkles}
          iconBg="bg-accent/10 text-accent"
        />
        <KpiCard
          title="Featured Brands"
          value={isOverviewLoading ? '...' : featuredBrandCount}
          icon={Store}
          iconBg="bg-info-subtle text-info"
        />
        <KpiCard
          title="Product Discounts"
          value={
            isOverviewLoading ? '...' : (overview?.counts?.activeDeals ?? discountedProducts.length)
          }
          icon={Percent}
          iconBg="bg-success-subtle text-success"
        />
      </div>

      {/* Segmented Pill Tabs */}
      <div
        role="tablist"
        className="inline-flex items-center gap-1 p-1 rounded-xl bg-surface-subtle dark:bg-surface border border-border-default/60 overflow-x-auto max-w-full"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'products'}
          onClick={() => setActiveTab('products')}
          className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
            activeTab === 'products'
              ? 'bg-surface-raised dark:bg-surface-raised text-text-primary font-semibold border border-border-default shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 border border-transparent'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Featured Products</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${
              activeTab === 'products'
                ? 'bg-accent-subtle text-accent'
                : 'bg-surface-hover text-text-tertiary'
            }`}
          >
            {featuredProductCount}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'brands'}
          onClick={() => setActiveTab('brands')}
          className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
            activeTab === 'brands'
              ? 'bg-surface-raised dark:bg-surface-raised text-text-primary font-semibold border border-border-default shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 border border-transparent'
          }`}
        >
          <Store className="h-4 w-4" />
          <span>Featured Brands</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${
              activeTab === 'brands'
                ? 'bg-accent-subtle text-accent'
                : 'bg-surface-hover text-text-tertiary'
            }`}
          >
            {featuredBrandCount}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'deals'}
          onClick={() => setActiveTab('deals')}
          className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
            activeTab === 'deals'
              ? 'bg-surface-raised dark:bg-surface-raised text-text-primary font-semibold border border-border-default shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 border border-transparent'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Price Discounts</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${
              activeTab === 'deals'
                ? 'bg-accent-subtle text-accent'
                : 'bg-surface-hover text-text-tertiary'
            }`}
          >
            {discountedProducts.length}
          </span>
        </button>
      </div>

      {activeTab === 'products' && <MerchandisingFeaturedProducts />}
      {activeTab === 'brands' && <MerchandisingFeaturedBrands />}
      {/* Vendor price discounts from product price versus MRP. */}
      {activeTab === 'deals' && (
        <div className="bg-surface-raised dark:bg-surface rounded-xl border border-border-default overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-text-tertiary font-semibold">
                  <th className="py-3 px-4">Deal Item</th>
                  <th className="py-3 px-4">Store</th>
                  <th className="py-3 px-4 text-right">Sale Price</th>
                  <th className="py-3 px-4 text-right">Regular Price</th>
                  <th className="py-3 px-4 text-center">Discount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {discountedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-text-tertiary">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="h-12 w-12 rounded-full bg-surface-subtle flex items-center justify-center mb-3">
                          <Percent className="h-6 w-6 text-text-tertiary" />
                        </div>
                        <span className="font-semibold text-sm text-text-primary">
                          No products priced below MRP
                        </span>
                        <p className="text-xs text-text-tertiary mt-1">
                          These vendor-set prices are separate from scheduled campaigns.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  discountedProducts.map((p) => {
                    const base = Number(p.price);
                    const comp = Number(p.mrp);
                    const discountPercent = Math.round(((comp - base) / comp) * 100);

                    return (
                      <tr key={p.productId} className="hover:bg-surface-hover/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-md bg-surface border border-border-subtle overflow-hidden shrink-0 flex items-center justify-center">
                              {p.imageUrl ? (
                                <Image
                                  src={p.imageUrl}
                                  alt={p.name}
                                  width={36}
                                  height={36}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-4 w-4 text-text-tertiary" />
                              )}
                            </div>
                            <span className="font-semibold text-text-primary">{p.name}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-text-secondary font-medium">
                          {p.vendor?.name || 'Direct Marketplace'}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-text-primary tabular-nums">
                          ₹{base.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 text-right text-text-tertiary line-through tabular-nums">
                          ₹{comp.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-warning-subtle text-warning border border-warning/20">
                            {discountPercent}% OFF
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
      )}
    </div>
  );
}
