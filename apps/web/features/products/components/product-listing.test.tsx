import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ProductBulkBar } from './product-bulk-bar';
import { ProductEmptyState } from './product-empty-state';
import { ProductHeader } from './product-header';
import { ProductTable } from './product-table';
import { ProductTabs } from './product-tabs';

import type { ProductItem } from '../types/product.types';

describe('Product Listing Components', () => {
  afterEach(() => {
    cleanup();
  });

  describe('ProductHeader', () => {
    it('renders heading, description, and link actions', () => {
      render(<ProductHeader />);
      expect(screen.getByRole('heading', { name: /products/i })).toBeDefined();
      expect(screen.getByText(/manage your product catalog and inventory/i)).toBeDefined();

      const bulkLink = screen.getByRole('link', { name: /bulk upload products/i });
      expect(bulkLink.getAttribute('href')).toBe('/vendor/products/bulk-upload');

      const createLink = screen.getByRole('link', { name: /create product/i });
      expect(createLink.getAttribute('href')).toBe('/vendor/products/new');
    });
  });

  describe('ProductTabs', () => {
    it('renders exactly four tabs and handles tab change clicks', async () => {
      const handleTabChange = vi.fn();
      render(<ProductTabs activeTab="all" onTabChange={handleTabChange} />);

      expect(screen.getByRole('button', { name: 'All Products' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Published' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Unpublished' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Archived' })).toBeDefined();

      const publishedBtn = screen.getByRole('button', { name: 'Published' });
      await userEvent.click(publishedBtn);
      expect(handleTabChange).toHaveBeenCalledWith('published');
    });
  });

  describe('ProductBulkBar', () => {
    it('renders selected count and triggers bulk action buttons', async () => {
      const handleBulkAction = vi.fn();
      const handleClear = vi.fn();

      render(
        <ProductBulkBar
          selectedCount={3}
          activeTab="all"
          onBulkAction={handleBulkAction}
          onClearSelection={handleClear}
        />,
      );

      expect(screen.getByText('3 selected')).toBeDefined();

      const archiveBtn = screen.getByRole('button', { name: /archive selected/i });
      await userEvent.click(archiveBtn);
      expect(handleBulkAction).toHaveBeenCalledWith('archive');

      const publishBtn = screen.getByRole('button', { name: /^publish selected$/i });
      await userEvent.click(publishBtn);
      expect(handleBulkAction).toHaveBeenCalledWith('publish');

      const unpublishBtn = screen.getByRole('button', { name: /^unpublish selected$/i });
      await userEvent.click(unpublishBtn);
      expect(handleBulkAction).toHaveBeenCalledWith('unpublish');

      const deleteBtn = screen.getByRole('button', { name: /delete selected/i });
      await userEvent.click(deleteBtn);
      expect(handleBulkAction).toHaveBeenCalledWith('delete');

      const clearBtn = screen.getByRole('button', { name: /deselect all/i });
      await userEvent.click(clearBtn);
      expect(handleClear).toHaveBeenCalled();
    });

    it('renders "Restore selected" instead of Archive on archived tab', async () => {
      const handleBulkAction = vi.fn();
      render(
        <ProductBulkBar
          selectedCount={2}
          activeTab="archived"
          onBulkAction={handleBulkAction}
          onClearSelection={vi.fn()}
        />,
      );

      expect(screen.getByRole('button', { name: /restore selected/i })).toBeDefined();
      expect(screen.queryByRole('button', { name: /archive selected/i })).toBeNull();
    });

    it('renders nothing when selectedCount is 0', () => {
      const { container } = render(
        <ProductBulkBar
          selectedCount={0}
          activeTab="all"
          onBulkAction={vi.fn()}
          onClearSelection={vi.fn()}
        />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('ProductEmptyState', () => {
    it('renders catalog empty state with onboarding actions', () => {
      render(<ProductEmptyState isFiltered={false} />);
      expect(screen.getByText('No products yet')).toBeDefined();
      expect(screen.getByRole('link', { name: /create product/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /bulk upload products/i })).toBeDefined();
    });

    it('renders filtered empty state with clear filters button', async () => {
      const handleClear = vi.fn();
      render(<ProductEmptyState isFiltered={true} onClearFilters={handleClear} />);
      expect(screen.getByText('No products found')).toBeDefined();

      const clearBtn = screen.getByRole('button', { name: /clear filters/i });
      await userEvent.click(clearBtn);
      expect(handleClear).toHaveBeenCalled();
    });
  });

  describe('ProductTable', () => {
    const mockProducts: ProductItem[] = [
      {
        productId: 'prod-1',
        name: 'Sony WH-1000XM5',
        slug: 'sony-wh-1000xm5',
        shortDescription: 'Wireless Headphones',
        description: 'Industry leading noise canceling headphones',
        price: '24999.00',
        stock: 12,
        published: true,
        isSoftDeleted: false,
        rating: 4.8,
        primaryImage: null,
        categories: [
          { categoryId: 'cat-1', name: 'Electronics', slug: 'electronics' },
          { categoryId: 'cat-2', name: 'Headphones', slug: 'headphones' },
          { categoryId: 'cat-3', name: 'Audio', slug: 'audio' },
        ],
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
      {
        productId: 'prod-2',
        name: 'Coffee Machine',
        slug: 'coffee-machine',
        shortDescription: null,
        description: 'Brew espresso at home',
        price: '8499.00',
        stock: 0,
        published: false,
        isSoftDeleted: false,
        rating: null,
        primaryImage: null,
        categories: [{ categoryId: 'cat-4', name: 'Home & Kitchen', slug: 'home-kitchen' }],
        createdAt: '2026-09-02T00:00:00Z',
        updatedAt: '2026-09-02T00:00:00Z',
      },
    ];

    it('renders products, formatted prices, categories, out of stock indicator, and rating or dash', () => {
      render(
        <ProductTable
          products={mockProducts}
          total={2}
          page={1}
          limit={20}
          activeTab="all"
          selectedIds={[]}
          onToggleSelect={vi.fn()}
          onToggleSelectAll={vi.fn()}
          onPageChange={vi.fn()}
          onTogglePublish={vi.fn()}
          onArchive={vi.fn()}
          onRestore={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      // Names & Subtitles
      expect(screen.getByText('Sony WH-1000XM5')).toBeDefined();
      expect(screen.getByText('Wireless Headphones')).toBeDefined();
      expect(screen.getByText('Coffee Machine')).toBeDefined();
      expect(screen.getAllByText('Home & Kitchen').length).toBeGreaterThanOrEqual(1);

      // Formatted prices in INR
      expect(screen.getByText('₹24,999')).toBeDefined();
      expect(screen.getByText('₹8,499')).toBeDefined();

      // Categories with +1 badge for > 2 categories
      expect(screen.getByText('Electronics')).toBeDefined();
      expect(screen.getByText('Headphones')).toBeDefined();
      expect(screen.getByText('+1')).toBeDefined();

      // Stock
      expect(screen.getByText('12')).toBeDefined();
      const zeroStock = screen.getByText('0');
      expect(zeroStock.className).toContain('text-danger-500');

      // Rating: 4.8 and —
      expect(screen.getByText('4.8')).toBeDefined();
      expect(screen.getByText('—')).toBeDefined();
    });

    it('toggles product selection when checkbox is clicked', async () => {
      const handleToggleSelect = vi.fn();
      render(
        <ProductTable
          products={mockProducts}
          total={2}
          page={1}
          limit={20}
          activeTab="all"
          selectedIds={['prod-1']}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={vi.fn()}
          onPageChange={vi.fn()}
          onTogglePublish={vi.fn()}
          onArchive={vi.fn()}
          onRestore={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      const checkbox = screen.getByRole('checkbox', { name: /select coffee machine/i });
      await userEvent.click(checkbox);
      expect(handleToggleSelect).toHaveBeenCalledWith('prod-2');
    });

    it('triggers publish status change when switch is toggled', async () => {
      const handleTogglePublish = vi.fn();
      render(
        <ProductTable
          products={mockProducts}
          total={2}
          page={1}
          limit={20}
          activeTab="all"
          selectedIds={[]}
          onToggleSelect={vi.fn()}
          onToggleSelectAll={vi.fn()}
          onPageChange={vi.fn()}
          onTogglePublish={handleTogglePublish}
          onArchive={vi.fn()}
          onRestore={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      const switchToggle = screen.getByRole('switch', {
        name: /toggle published status for sony wh-1000xm5/i,
      });
      await userEvent.click(switchToggle);
      expect(handleTogglePublish).toHaveBeenCalledWith('prod-1', false);
    });
  });
});
