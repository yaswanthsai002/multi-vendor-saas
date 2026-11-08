import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const hooks = vi.hoisted(() => ({
  useFeaturedBrands: vi.fn(),
  useHomeCategories: vi.fn(),
  useHomeProducts: vi.fn(),
  useHomepageCampaigns: vi.fn(),
}));

vi.mock('../hooks/use-homepage-data', () => hooks);

import DealsSpotlight from './DealsSpotlight';
import FeaturedBrands from './FeaturedBrands';
import Hero from './Hero';
import NewArrivals from './NewArrivals';
import ShopbyCategory from './ShopbyCategory';

describe('homepage data sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hooks.useFeaturedBrands.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
    });
    hooks.useHomeCategories.mockReturnValue({ data: [], isLoading: false, isError: false });
    hooks.useHomeProducts.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
    });
    hooks.useHomepageCampaigns.mockReturnValue({
      data: { active: [], upcoming: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  afterEach(cleanup);

  it('shows featured-brand loading and recoverable error states', () => {
    hooks.useFeaturedBrands.mockReturnValue({ isLoading: true, isError: false });
    const { rerender } = render(<FeaturedBrands />);
    expect(screen.getByLabelText('Loading featured brands')).toBeTruthy();

    const refetch = vi.fn();
    hooks.useFeaturedBrands.mockReturnValue({ isLoading: false, isError: true, refetch });
    rerender(<FeaturedBrands />);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByRole('alert').textContent).toContain('Featured brands couldn’t load.');
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('renders featured vendors returned by the brands query', () => {
    hooks.useFeaturedBrands.mockReturnValue({
      data: {
        items: [
          { vendorId: 'vendor-1', name: 'Northstar Audio', slug: 'northstar-audio', logoUrl: null },
        ],
      },
      isLoading: false,
      isError: false,
    });

    render(<FeaturedBrands />);

    expect(screen.getByRole('link', { name: /Northstar Audio/ }).getAttribute('href')).toBe(
      '/products?vendor=northstar-audio',
    );
  });

  it('keeps campaign loading feedback in the hero only', () => {
    hooks.useHomepageCampaigns.mockReturnValue({ isLoading: true, isError: false });

    render(
      <>
        <Hero />
        <DealsSpotlight />
      </>,
    );

    expect(screen.getByLabelText('Loading promotions')).toBeTruthy();
    expect(screen.queryByLabelText('Loading deals')).toBeNull();
  });

  it('shows one recoverable campaign error instead of duplicate section errors', () => {
    const refetch = vi.fn();
    hooks.useHomepageCampaigns.mockReturnValue({ isLoading: false, isError: true, refetch });

    render(
      <>
        <Hero />
        <DealsSpotlight />
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reload promotions' }));

    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('keeps new-arrival and category failures recoverable', () => {
    const productRetry = vi.fn();
    hooks.useHomeProducts.mockReturnValue({
      isLoading: false,
      isError: true,
      refetch: productRetry,
    });
    const { rerender } = render(<NewArrivals />);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(productRetry).toHaveBeenCalledOnce();

    const categoryRetry = vi.fn();
    hooks.useHomeCategories.mockReturnValue({
      isLoading: false,
      isError: true,
      refetch: categoryRetry,
    });
    rerender(<ShopbyCategory />);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(categoryRetry).toHaveBeenCalledOnce();
  });
});
