import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as productService from '../services/product.service';

import { ProductForm } from './product-form';

import type { ProductDetail } from '../types/product.types';

import { QueryProvider } from '@/providers/query-provider';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('../services/product.service', () => ({
  createVendorProduct: vi.fn(),
  updateVendorProduct: vi.fn(),
}));

// Mock global category API call
vi.mock('@/features/category/services/category.service', () => ({
  fetchCategories: vi.fn().mockResolvedValue({
    categories: [
      {
        categoryId: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
        name: 'Electronics',
        slug: 'electronics',
        parentId: null,
        isLeaf: false,
        isActive: true,
      },
      {
        categoryId: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
        name: 'Smartphones',
        slug: 'smartphones',
        parentId: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
        isLeaf: true,
        isActive: true,
      },
    ],
  }),
}));

const mockProductDetail: ProductDetail = {
  productId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  name: 'Mechanical Keyboard',
  slug: 'mechanical-keyboard',
  shortDescription: 'Tactile switches mechanical keyboard',
  description: '<p>A durable keyboard for coding.</p>',
  price: '4999.00',
  stock: 25,
  published: true,
  isSoftDeleted: false,
  rating: null,
  productImageId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  primaryImage: {
    mediaId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    type: 'image',
    originalFileName: 'keyboard.png',
    mimeType: 'image/png',
    fileSizeBytes: 10240,
    width: 800,
    height: 800,
    status: 'active',
    original: 'https://example.com/keyboard.png',
    variants: {
      thumbnail: 'https://example.com/keyboard-thumb.png',
      medium: 'https://example.com/keyboard-med.png',
      large: 'https://example.com/keyboard-large.png',
    },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  gallery: [
    {
      mediaId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
      type: 'image',
      originalFileName: 'gallery-1.png',
      mimeType: 'image/png',
      fileSizeBytes: 20480,
      width: 1200,
      height: 800,
      status: 'active',
      sortOrder: 0,
      original: 'https://example.com/gallery-1.png',
      variants: {
        thumbnail: 'https://example.com/gallery-1-thumb.png',
        medium: 'https://example.com/gallery-1-med.png',
        large: 'https://example.com/gallery-1-large.png',
      },
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ],
  categories: [
    {
      categoryId: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
      name: 'Smartphones',
      slug: 'smartphones',
    },
  ],
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-02T00:00:00Z',
};

function renderProductForm(props: React.ComponentProps<typeof ProductForm>) {
  return render(
    <QueryProvider>
      <ProductForm {...props} />
    </QueryProvider>,
  );
}

describe('ProductForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Create Mode', () => {
    it('renders all product form sections and empty inputs', () => {
      renderProductForm({ mode: 'create' });

      expect(screen.getByRole('heading', { name: /^create product$/i })).toBeDefined();
      expect(screen.getByPlaceholderText(/enter product name/i)).toBeDefined();
      expect(screen.getByPlaceholderText(/enter a short description/i)).toBeDefined();
      expect(screen.getByPlaceholderText(/0\.00/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /save draft/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /save & publish/i })).toBeDefined();
    });

    it('shows validation errors when submitting with empty required fields', async () => {
      renderProductForm({ mode: 'create' });

      const saveDraftBtn = screen.getByRole('button', { name: /save draft/i });
      await userEvent.click(saveDraftBtn);

      expect(toast.error).toHaveBeenCalledWith('Please fix the form errors before submitting.');
      expect(screen.getByText(/product name must be at least 2 characters/i)).toBeDefined();
      expect(screen.getByText(/price is required/i)).toBeDefined();
      expect(screen.getByText(/stock is required/i)).toBeDefined();
    });

    it('successfully submits draft product and navigates to edit page', async () => {
      const user = userEvent.setup();
      vi.mocked(productService.createVendorProduct).mockResolvedValue({
        message: 'Product created successfully',
        product: {
          ...mockProductDetail,
          productId: '11111111-2222-3333-4444-555555555555',
          name: 'Noise Canceling Headphones',
          price: '8999.00',
          stock: 10,
          published: false,
        },
      });

      renderProductForm({ mode: 'create' });

      const nameInput = screen.getByPlaceholderText(/enter product name/i);
      await user.type(nameInput, 'Noise Canceling Headphones');

      const priceInput = screen.getByPlaceholderText(/0\.00/i);
      await user.type(priceInput, '8999');

      const stockInput = screen.getByPlaceholderText(/e\.g\. 10/i);
      await user.type(stockInput, '10');

      const saveDraftBtn = screen.getByRole('button', { name: /save draft/i });
      await user.click(saveDraftBtn);

      await waitFor(() => {
        expect(productService.createVendorProduct).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Noise Canceling Headphones',
            price: '8999',
            stock: 10,
            published: false,
          }),
        );
        expect(mockPush).toHaveBeenCalledWith(
          '/vendor/products/11111111-2222-3333-4444-555555555555/edit',
        );
      });
    });

    it('successfully submits and publishes product, navigating to product list', async () => {
      const user = userEvent.setup();
      vi.mocked(productService.createVendorProduct).mockResolvedValue({
        message: 'Product created and published successfully',
        product: {
          ...mockProductDetail,
          productId: '22222222-3333-4444-5555-666666666666',
          name: 'Gaming Mouse',
          price: '2499.00',
          stock: 5,
          published: true,
        },
      });

      renderProductForm({ mode: 'create' });

      const nameInput = screen.getByPlaceholderText(/enter product name/i);
      await user.type(nameInput, 'Gaming Mouse');

      const priceInput = screen.getByPlaceholderText(/0\.00/i);
      await user.type(priceInput, '2499');

      const stockInput = screen.getByPlaceholderText(/e\.g\. 10/i);
      await user.type(stockInput, '5');

      const savePublishBtn = screen.getByRole('button', { name: /save & publish/i });
      await user.click(savePublishBtn);

      await waitFor(() => {
        expect(productService.createVendorProduct).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Gaming Mouse',
            price: '2499',
            stock: 5,
            published: true,
          }),
        );
        expect(mockPush).toHaveBeenCalledWith('/vendor/products');
      });
    });
  });

  describe('Edit Mode', () => {
    it('populates initialData correctly in all input fields and status indicator', () => {
      renderProductForm({ mode: 'edit', initialData: mockProductDetail });

      expect(screen.getByRole('heading', { name: /^edit product$/i })).toBeDefined();
      expect(screen.getByDisplayValue('Mechanical Keyboard')).toBeDefined();
      expect(screen.getByDisplayValue('Tactile switches mechanical keyboard')).toBeDefined();
      expect(screen.getByDisplayValue('4999.00')).toBeDefined();
      expect(screen.getByDisplayValue('25')).toBeDefined();

      // Top header actions in edit mode
      expect(screen.getByRole('button', { name: /save changes/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /save & publish/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /cancel/i })).toBeDefined();

      // Status card indicators
      expect(screen.getByText(/^published$/i)).toBeDefined();
    });

    it('updates product and stays on page when clicking "Save changes"', async () => {
      const user = userEvent.setup();
      vi.mocked(productService.updateVendorProduct).mockResolvedValue({
        message: 'Product updated successfully',
        product: {
          ...mockProductDetail,
          price: '5499.00',
        },
      });

      renderProductForm({ mode: 'edit', initialData: mockProductDetail });

      const priceInput = screen.getByDisplayValue('4999.00');
      await user.clear(priceInput);
      await user.type(priceInput, '5499.00');

      const saveChangesBtn = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveChangesBtn);

      await waitFor(() => {
        expect(productService.updateVendorProduct).toHaveBeenCalledWith(
          'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          expect.objectContaining({
            price: '5499.00',
            published: true,
          }),
        );
      });
    });

    it('updates product and navigates to listing when clicking "Save & Publish"', async () => {
      const user = userEvent.setup();
      vi.mocked(productService.updateVendorProduct).mockResolvedValue({
        message: 'Product published successfully',
        product: {
          ...mockProductDetail,
          published: true,
        },
      });

      renderProductForm({ mode: 'edit', initialData: mockProductDetail });

      const savePublishBtn = screen.getByRole('button', { name: /save & publish/i });
      await user.click(savePublishBtn);

      await waitFor(() => {
        expect(productService.updateVendorProduct).toHaveBeenCalledWith(
          'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          expect.objectContaining({
            published: true,
          }),
        );
        expect(mockPush).toHaveBeenCalledWith('/vendor/products');
      });
    });
  });
});
