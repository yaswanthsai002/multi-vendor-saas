'use client';

import { Package, Percent, Plus, Sparkles, Store, Tag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { KpiCard } from '@/features/admin/components/kpi-card';
import {
  useAdminProducts,
  useAdminUsers,
  useMerchandisingOverview,
  useToggleProductFeature,
  useToggleVendorFeature,
} from '@/features/admin/hooks/use-admin';

export default function AdminMerchandisingPage() {
  const [activeTab, setActiveTab] = React.useState<'products' | 'brands' | 'deals'>('products');

  const { data: overview, isLoading: isOverviewLoading } = useMerchandisingOverview();
  const { data: featuredProductsData, isLoading: isProductsLoading } = useAdminProducts({
    isFeatured: 'true',
  });
  const { data: allProductsData } = useAdminProducts({});
  const { data: featuredVendorsData, isLoading: isVendorsLoading } = useAdminUsers({
    role: 'vendor',
  });

  const toggleProductMutation = useToggleProductFeature();
  const toggleVendorMutation = useToggleVendorFeature();

  const featuredProducts = featuredProductsData?.products ?? [];
  const allProducts = allProductsData?.products ?? [];
  const discountedProducts = allProducts.filter(
    (p) => p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price),
  );

  const featuredVendors = (featuredVendorsData?.users ?? [])
    .filter((u) => u.vendor?.isFeatured)
    .map((u) => u.vendor!);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Marketplace Merchandising
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Curate hero showcases, highlight top-tier brand partners, and monitor active flash
            discounts.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-on-accent font-semibold text-xs sm:text-sm hover:bg-accent/90 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Feature More Items</span>
        </Link>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Featured Products"
          value={
            isOverviewLoading
              ? '...'
              : (overview?.counts?.featuredProducts ?? featuredProducts.length)
          }
          icon={Sparkles}
          iconBg="bg-accent/10 text-accent"
        />
        <KpiCard
          title="Featured Brands"
          value={
            isOverviewLoading ? '...' : (overview?.counts?.featuredBrands ?? featuredVendors.length)
          }
          icon={Store}
          iconBg="bg-info-subtle text-info"
        />
        <KpiCard
          title="Active Sale Deals"
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
                ? 'bg-accent/10 text-accent dark:bg-accent/20'
                : 'bg-surface-hover text-text-tertiary'
            }`}
          >
            {featuredProducts.length}
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
                ? 'bg-accent/10 text-accent dark:bg-accent/20'
                : 'bg-surface-hover text-text-tertiary'
            }`}
          >
            {featuredVendors.length}
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
          <span>Active Deals</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${
              activeTab === 'deals'
                ? 'bg-accent/10 text-accent dark:bg-accent/20'
                : 'bg-surface-hover text-text-tertiary'
            }`}
          >
            {discountedProducts.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Featured Products Table */}
      {activeTab === 'products' && (
        <div className="bg-surface-raised dark:bg-surface rounded-xl border border-border-default overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-text-tertiary font-semibold">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Store / Vendor</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4">Moderation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {isProductsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-tertiary">
                      Loading featured catalog...
                    </td>
                  </tr>
                ) : featuredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-text-tertiary">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="h-12 w-12 rounded-full bg-surface-subtle flex items-center justify-center mb-3">
                          <Sparkles className="h-6 w-6 text-text-tertiary" />
                        </div>
                        <span className="font-semibold text-sm text-text-primary">
                          No featured products selected
                        </span>
                        <p className="text-xs text-text-tertiary mt-1">
                          Select products from the catalog to spotlight them on the marketplace
                          homepage.
                        </p>
                        <Link
                          href="/admin/products"
                          className="mt-4 px-4 py-2 rounded-xl bg-accent text-on-accent text-xs font-semibold hover:bg-accent/90 transition-all shadow-xs"
                        >
                          Browse Products Catalog
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  featuredProducts.map((p) => (
                    <tr
                      key={p.productId}
                      className="hover:bg-surface-hover/60 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-surface border border-border-subtle overflow-hidden shrink-0 flex items-center justify-center">
                            {p.imageUrl ? (
                              <Image
                                src={p.imageUrl}
                                alt={p.name}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-text-tertiary" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary">{p.name}</div>
                            <div className="text-xs text-text-tertiary font-mono">{p.slug}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-text-secondary font-medium">
                        {p.vendor?.name || 'Direct Marketplace'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-text-primary tabular-nums">
                          ₹{Number(p.price).toLocaleString('en-IN')}
                        </div>
                        {p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price) && (
                          <div className="text-xs text-text-tertiary line-through tabular-nums">
                            ₹{Number(p.compareAtPrice).toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-subtle text-success border border-success/20 capitalize">
                          {p.moderationStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            toggleProductMutation.mutate({
                              productId: p.productId,
                              isFeatured: false,
                            })
                          }
                          className="px-3 py-1.5 rounded-lg border border-border-default text-text-secondary hover:text-danger hover:border-danger/30 hover:bg-danger-subtle/50 font-medium text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          title="Remove from featured spotlight"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Featured Brands Grid */}
      {activeTab === 'brands' && (
        <div>
          {isVendorsLoading ? (
            <div className="py-12 text-center text-text-tertiary">Loading featured brands...</div>
          ) : featuredVendors.length === 0 ? (
            <div className="bg-surface-raised dark:bg-surface rounded-xl border border-border-default p-16 text-center">
              <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                <div className="h-12 w-12 rounded-full bg-surface-subtle flex items-center justify-center mb-3">
                  <Store className="h-6 w-6 text-text-tertiary" />
                </div>
                <span className="font-semibold text-sm text-text-primary">No featured brands</span>
                <p className="text-xs text-text-tertiary mt-1">
                  Promote verified sellers to spotlight their stores across the marketplace.
                </p>
                <Link
                  href="/admin/vendors"
                  className="mt-4 px-4 py-2 rounded-xl bg-accent text-on-accent text-xs font-semibold hover:bg-accent/90 transition-all shadow-xs"
                >
                  Manage Vendors
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredVendors.map((v) => (
                <div
                  key={v.vendorId}
                  className="p-5 sm:p-6 rounded-xl bg-surface-raised dark:bg-surface border border-border-default flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-accent/10 text-accent font-bold text-sm flex items-center justify-center shrink-0">
                        {v.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-text-primary text-sm sm:text-base">
                          {v.name}
                        </h4>
                        <span className="text-xs text-text-tertiary">@{v.slug}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-subtle text-success border border-success/20">
                      Active
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-text-secondary line-clamp-2">
                    Verified merchant offering curated products on Perigee.
                  </p>

                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                    <span className="text-xs font-medium text-text-tertiary">
                      Featured Marketplace Partner
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        toggleVendorMutation.mutate({
                          vendorId: v.vendorId,
                          isFeatured: false,
                        })
                      }
                      className="px-2.5 py-1 text-xs font-semibold text-text-secondary hover:text-danger rounded-lg hover:bg-danger-subtle/50 transition-colors cursor-pointer"
                    >
                      Unfeature
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Active Deals & Flash Sales */}
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
                          No active discounted deals
                        </span>
                        <p className="text-xs text-text-tertiary mt-1">
                          Items with compare-at price discounts will automatically be organized
                          here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  discountedProducts.map((p) => {
                    const base = Number(p.price);
                    const comp = Number(p.compareAtPrice);
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
