import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const hooks = vi.hoisted(() => ({
  useAdminProducts: vi.fn(),
  useAdminVendors: vi.fn(),
  useToggleProductFeature: vi.fn(),
  useToggleVendorFeature: vi.fn(),
}));

vi.mock('@/features/admin/hooks/use-admin', () => hooks);

import { MerchandisingFeaturedBrands } from './merchandising-featured-brands';
import { MerchandisingFeaturedProducts } from './merchandising-featured-products';

const product = {
  productId: 'product-1',
  name: 'Desk lamp',
  slug: 'desk-lamp',
  price: '1200',
  mrp: '1500',
  stock: 10,
  published: true,
  moderationStatus: 'approved',
  isFeatured: true,
  imageUrl: null,
  vendor: { vendorId: 'vendor-1', name: 'Light Co', slug: 'light-co', status: 'active' },
};

const vendor = {
  vendorId: 'vendor-1',
  name: 'Light Co',
  slug: 'light-co',
  logoUrl: null,
  status: 'active',
  isFeatured: true,
  productCount: 4,
  owner: { fullName: 'Alex Owner', status: 'active' },
};

function response<T>(key: 'products' | 'vendors', item: T, totalPages = 1, page = 1) {
  return {
    data: {
      [key]: [item],
      pagination: { page, limit: 20, total: totalPages * 20, totalPages },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  };
}

describe('merchandising featured tables', () => {
  const toggleProduct = vi.fn();
  const toggleVendor = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    hooks.useAdminProducts.mockImplementation((params) =>
      response(
        'products',
        params?.isFeatured === 'true' ? product : { ...product, isFeatured: false },
      ),
    );
    hooks.useAdminVendors.mockImplementation((params) =>
      response(
        'vendors',
        params?.isFeatured === 'true' ? vendor : { ...vendor, isFeatured: false },
      ),
    );
    hooks.useToggleProductFeature.mockReturnValue({
      mutate: toggleProduct,
      isPending: false,
      variables: undefined,
    });
    hooks.useToggleVendorFeature.mockReturnValue({
      mutate: toggleVendor,
      isPending: false,
      variables: undefined,
    });
  });

  afterEach(cleanup);

  it('queries only featured products and features candidates from the picker', async () => {
    const user = userEvent.setup();
    render(<MerchandisingFeaturedProducts />);

    expect(hooks.useAdminProducts).toHaveBeenCalledWith(
      expect.objectContaining({ isFeatured: 'true' }),
    );
    expect(screen.getByText('Desk lamp')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Feature product' }));
    await waitFor(() =>
      expect(hooks.useAdminProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isFeatured: 'false',
          published: 'true',
          moderationStatus: 'approved',
        }),
        true,
      ),
    );
    await user.click(screen.getByRole('button', { name: 'Feature' }));
    expect(toggleProduct).toHaveBeenCalledWith({ productId: 'product-1', isFeatured: true });
  });

  it('keeps brand pagination intact and disables ineligible candidates', async () => {
    const user = userEvent.setup();
    hooks.useAdminVendors.mockImplementation((params) => {
      if (params?.isFeatured === 'true') return response('vendors', vendor);
      const ineligibleVendor = {
        ...vendor,
        owner: { ...vendor.owner, status: 'suspended' },
        productCount: 0,
      };
      if (params?.page === 2) {
        return response('vendors', { ...vendor, name: 'New Brand' }, 2, 2);
      }
      return response('vendors', ineligibleVendor, 2);
    });

    render(<MerchandisingFeaturedBrands />);
    expect(hooks.useAdminVendors).toHaveBeenCalledWith(
      expect.objectContaining({ isFeatured: 'true' }),
    );
    await user.click(screen.getByRole('button', { name: 'Feature brand' }));
    await waitFor(() =>
      expect(hooks.useAdminVendors).toHaveBeenLastCalledWith(
        expect.objectContaining({ isFeatured: 'false', status: 'active' }),
        true,
      ),
    );

    expect(screen.getAllByText('Light Co')).toHaveLength(2);
    expect(screen.getByText('Owner account inactive')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Feature', hidden: true })).toHaveProperty(
      'disabled',
      true,
    );

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() =>
      expect(hooks.useAdminVendors).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2, isFeatured: 'false' }),
        true,
      ),
    );
    expect(screen.getByText('New Brand')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Feature' }));
    expect(toggleVendor).toHaveBeenCalledWith({ vendorId: 'vendor-1', isFeatured: true });
  });

  it('removes featured products and brands from their tables', async () => {
    const user = userEvent.setup();
    render(
      <>
        <MerchandisingFeaturedProducts />
        <MerchandisingFeaturedBrands />
      </>,
    );

    await user.click(
      screen.getByRole('button', { name: 'Remove Desk lamp from featured products' }),
    );
    await user.click(screen.getByRole('button', { name: 'Remove Light Co from featured brands' }));
    expect(toggleProduct).toHaveBeenCalledWith({ productId: 'product-1', isFeatured: false });
    expect(toggleVendor).toHaveBeenCalledWith({ vendorId: 'vendor-1', isFeatured: false });
  });
});
