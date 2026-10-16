import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CatalogCategoryTree } from './catalog-category-tree';
import { CatalogEmptyState } from './catalog-empty-state';
import { CatalogFilters } from './catalog-filters';
import { CatalogProductGrid } from './catalog-product-grid';
import { CatalogSortBar } from './catalog-sort-bar';

import type { CatalogCategory, CatalogProduct } from '../types/catalog.types';

describe('Catalog Components', () => {
  afterEach(() => {
    cleanup();
  });

  describe('CatalogEmptyState', () => {
    it('renders no matching products message with reset button when filters active', () => {
      const handleReset = vi.fn();
      render(<CatalogEmptyState hasFilters={true} onResetFilters={handleReset} />);

      expect(screen.getByText('No matching products found')).toBeDefined();
      const resetButton = screen.getByRole('button', { name: /reset all filters/i });
      expect(resetButton).toBeDefined();

      fireEvent.click(resetButton);
      expect(handleReset).toHaveBeenCalledTimes(1);
    });

    it('renders generic empty message without reset button when no filters active', () => {
      const handleReset = vi.fn();
      render(<CatalogEmptyState hasFilters={false} onResetFilters={handleReset} />);

      expect(screen.getByText('No products available')).toBeDefined();
      expect(screen.queryByRole('button', { name: /reset all filters/i })).toBeNull();
    });
  });

  describe('CatalogCategoryTree', () => {
    const mockCategories: CatalogCategory[] = [
      {
        categoryId: 'root-1',
        name: 'Electronics',
        slug: 'electronics',
        parentCategoryId: null,
        productCount: 20,
      },
      {
        categoryId: 'child-1',
        name: 'Audio & Sound',
        slug: 'audio',
        parentCategoryId: 'root-1',
        productCount: 8,
      },
      {
        categoryId: 'root-2',
        name: 'Fashion',
        slug: 'fashion',
        parentCategoryId: null,
        productCount: 15,
      },
    ];

    it('renders parent categories with product counts and reveals subcategories on expand', () => {
      const handleToggle = vi.fn();
      const handleClear = vi.fn();

      render(
        <CatalogCategoryTree
          categories={mockCategories}
          selectedCategories={[]}
          onToggleCategory={handleToggle}
          onClearCategories={handleClear}
        />,
      );

      expect(screen.getByText('Electronics')).toBeDefined();
      expect(screen.getByText('Fashion')).toBeDefined();

      // Audio is nested under Electronics, not visible before expanding
      const expandButton = screen.getByRole('button', { name: /expand electronics/i });
      fireEvent.click(expandButton);

      // Now subcategory is visible
      expect(screen.getByText('Audio & Sound')).toBeDefined();

      // Clicking subcategory calls toggle with child slug
      fireEvent.click(screen.getByText('Audio & Sound'));
      expect(handleToggle).toHaveBeenCalledWith('audio');
    });

    it('auto-expands parent when subcategory is selected', () => {
      render(
        <CatalogCategoryTree
          categories={mockCategories}
          selectedCategories={['audio']}
          onToggleCategory={vi.fn()}
          onClearCategories={vi.fn()}
        />,
      );

      expect(screen.getByText('Audio & Sound')).toBeDefined();
    });
  });

  describe('CatalogFilters', () => {
    it('applies price preset when radio clicked and clears when re-clicked', () => {
      const handleFilterChange = vi.fn();

      const { rerender } = render(
        <CatalogFilters
          categories={[]}
          filters={{}}
          onFilterChange={handleFilterChange}
          onResetFilters={vi.fn()}
        />,
      );

      // Click radio preset
      const presetRadio = screen.getByLabelText('₹500 – ₹1,000');
      fireEvent.click(presetRadio);
      expect(handleFilterChange).toHaveBeenCalledWith({
        minPrice: 500,
        maxPrice: 1000,
        page: 1,
      });

      // Rerender with active filter and click again to deselect
      rerender(
        <CatalogFilters
          categories={[]}
          filters={{ minPrice: 500, maxPrice: 1000 }}
          onFilterChange={handleFilterChange}
          onResetFilters={vi.fn()}
        />,
      );

      fireEvent.click(presetRadio);
      expect(handleFilterChange).toHaveBeenCalledWith({
        minPrice: undefined,
        maxPrice: undefined,
        page: 1,
      });
    });

    it('auto-applies custom price range after 1000ms debounce without Go button', () => {
      vi.useFakeTimers();
      const handleFilterChange = vi.fn();

      render(
        <CatalogFilters
          categories={[]}
          filters={{}}
          onFilterChange={handleFilterChange}
          onResetFilters={vi.fn()}
        />,
      );

      const minInput = screen.getByLabelText(/minimum price/i);
      const maxInput = screen.getByLabelText(/maximum price/i);

      fireEvent.change(minInput, { target: { value: '250' } });
      fireEvent.change(maxInput, { target: { value: '750' } });

      // Before 1000ms, should not have triggered
      expect(handleFilterChange).not.toHaveBeenCalled();

      // Fast-forward 1000ms
      vi.advanceTimersByTime(1000);

      expect(handleFilterChange).toHaveBeenCalledWith({
        minPrice: 250,
        maxPrice: 750,
        page: 1,
      });

      vi.useRealTimers();
    });
  });

  describe('CatalogSortBar', () => {
    it('renders item count, Sort by label, Base UI sort trigger, and active filter chips', () => {
      const handleSort = vi.fn();
      const handleRemoveChip = vi.fn();

      render(
        <CatalogSortBar
          totalItems={42}
          currentSort="featured"
          onSortChange={handleSort}
          activeFilterChips={[
            {
              key: 'search',
              label: 'Search: "audio"',
              onRemove: handleRemoveChip,
            },
          ]}
          onOpenMobileFilters={vi.fn()}
          activeFilterCount={1}
        />,
      );

      expect(screen.getByText('42')).toBeDefined();
      expect(screen.getByText('products found')).toBeDefined();
      expect(screen.getByText('Sort by:')).toBeDefined();
      expect(screen.getByText('Search: "audio"')).toBeDefined();

      const sortTrigger = screen.getByRole('combobox', { name: /sort products/i });
      expect(sortTrigger).toBeDefined();

      const removeButton = screen.getByLabelText(/remove filter: search: "audio"/i);
      fireEvent.click(removeButton);
      expect(handleRemoveChip).toHaveBeenCalledTimes(1);
    });
  });

  describe('CatalogProductGrid', () => {
    const mockProducts: CatalogProduct[] = [
      {
        productId: 'prod-1',
        name: 'Wireless Studio Headphones',
        slug: 'wireless-studio-headphones',
        shortDescription: 'High fidelity audio',
        price: '2499.00',
        compareAtPrice: '3999.00',
        stock: 12,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        imageUrl: null,
        vendor: {
          vendorId: 'v-1',
          name: 'SoundLab',
          slug: 'soundlab',
          logoUrl: null,
        },
        categories: [{ categoryId: 'c-1', name: 'Audio', slug: 'audio' }],
      },
    ];

    it('renders product cards for loaded catalog products', () => {
      render(
        <CatalogProductGrid
          products={mockProducts}
          isLoading={false}
          hasFilters={false}
          onResetFilters={vi.fn()}
        />,
      );

      expect(screen.getByText('Wireless Studio Headphones')).toBeDefined();
      expect(screen.getByText('SoundLab')).toBeDefined();
      expect(screen.getByText('₹2,499')).toBeDefined();
      expect(screen.getByText('Featured')).toBeDefined();
    });

    it('renders empty state when products array is empty', () => {
      render(
        <CatalogProductGrid
          products={[]}
          isLoading={false}
          hasFilters={true}
          onResetFilters={vi.fn()}
        />,
      );

      expect(screen.getByText('No matching products found')).toBeDefined();
    });
  });
});
