'use client';

import { Menu } from '@base-ui-components/react/menu';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { useHomeCategories, useHomepageCampaigns } from '../hooks/use-homepage-data';

import type { HomeCategory } from '../services/home.service';

const itemClass =
  'flex w-full cursor-pointer items-center justify-between gap-4 rounded-md px-3 py-2 text-sm text-text-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus';

function CategoryItems({
  categories,
  parentId,
}: {
  categories: HomeCategory[];
  parentId: string | null;
}) {
  return (
    <>
      {categories
        .filter((category) => category.parentCategoryId === parentId)
        .map((category) => {
          const children = categories.filter(
            (item) => item.parentCategoryId === category.categoryId,
          );
          if (!children.length) {
            return (
              <Menu.Item
                key={category.categoryId}
                render={<Link href={`/category/${category.slug}`} className={itemClass} />}
              >
                {category.name}
              </Menu.Item>
            );
          }
          return (
            <Menu.SubmenuRoot key={category.categoryId}>
              <Menu.SubmenuTrigger className={`${itemClass} data-[highlighted]:bg-surface-hover`}>
                {category.name}
                <ChevronRight size={14} aria-hidden="true" />
              </Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner side="right" align="start" sideOffset={4} className="z-[60]">
                  <Menu.Popup className="max-h-[70vh] min-w-56 overflow-y-auto rounded-xl border border-border-default bg-surface-raised p-1 text-text-primary shadow-xl outline-none">
                    <CategoryItems categories={categories} parentId={category.categoryId} />
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
          );
        })}
    </>
  );
}

export function HomeCategoryNavigation() {
  const { data, isLoading, isError } = useHomeCategories();
  const { data: campaigns } = useHomepageCampaigns();
  const categories = data ?? [];
  const hasDeals = Boolean(campaigns?.active.length || campaigns?.upcoming.length);
  const dealHref = campaigns?.active.length ? '/#active-deals' : '/#upcoming-campaigns';

  return (
    <div className="flex items-center gap-2">
      <Menu.Root>
        <Menu.Trigger className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1.5 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
          Shop By <ChevronDown size={14} aria-hidden="true" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side="bottom" align="start" sideOffset={8} className="z-50">
            <Menu.Popup className="min-w-52 rounded-xl border border-border-default bg-surface-raised p-2 text-text-primary shadow-xl outline-none">
              <Menu.Item render={<Link href="/#shop-categories" className={itemClass} />}>
                Categories
              </Menu.Item>
              <Menu.Item render={<Link href="/brands" className={itemClass} />}>Brands</Menu.Item>
              {hasDeals && (
                <Menu.Item render={<Link href={dealHref} className={itemClass} />}>Deals</Menu.Item>
              )}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <Menu.Root>
        <Menu.Trigger className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1.5 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
          Categories <ChevronDown size={14} aria-hidden="true" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side="bottom" align="start" sideOffset={8} className="z-50">
            <Menu.Popup className="max-h-[75vh] min-w-64 overflow-y-auto rounded-xl border border-border-default bg-surface-raised p-2 text-text-primary shadow-xl outline-none">
              {isLoading ? (
                <p className="px-3 py-2 text-sm text-text-secondary">Loading categories…</p>
              ) : isError ? (
                <p className="px-3 py-2 text-sm text-text-secondary">Categories unavailable.</p>
              ) : (
                <CategoryItems categories={categories} parentId={null} />
              )}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      {hasDeals && (
        <Link href={dealHref} className="rounded px-2 py-1.5 hover:bg-surface-hover">
          Deals
        </Link>
      )}
      <Link href="/products?isFeatured=true" className="rounded px-2 py-1.5 hover:bg-surface-hover">
        Featured
      </Link>
      <Link href="/brands" className="rounded px-2 py-1.5 hover:bg-surface-hover">
        Brands
      </Link>
    </div>
  );
}
