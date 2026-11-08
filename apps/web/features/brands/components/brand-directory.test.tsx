import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { useBrands, push, replace } = vi.hoisted(() => ({
  useBrands: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('../hooks/use-brands', () => ({ useBrands }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace }) }));

import { BrandDirectory } from './brand-directory';

describe('BrandDirectory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('shows active brands and links to their catalog', () => {
    useBrands.mockReturnValue({
      data: {
        items: [
          {
            vendorId: 'vendor-1',
            name: 'Northstar Audio',
            slug: 'northstar-audio',
            tagline: 'Thoughtful sound',
            description: null,
            logoUrl: null,
            bannerUrl: null,
            isFeatured: true,
            productCount: 8,
          },
          {
            vendorId: 'vendor-2',
            name: 'Morrow Goods',
            slug: 'morrow-goods',
            tagline: null,
            description: null,
            logoUrl: null,
            bannerUrl: null,
            isFeatured: false,
            productCount: 1,
          },
        ],
        pagination: { page: 1, limit: 24, total: 1, totalPages: 1 },
      },
      isLoading: false,
      isError: false,
    });

    render(<BrandDirectory initialPage={1} initialSearch="" />);

    expect(screen.getByRole('heading', { name: 'Northstar Audio' })).toBeTruthy();
    expect(screen.getAllByText('Shop')).toHaveLength(2);
    expect(screen.getByText('Featured')).toBeTruthy();
    expect(screen.getByText('8 products')).toBeTruthy();
    expect(screen.getByText('1 product')).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Pagination Navigation' })).toBeNull();
    expect(screen.getByRole('link', { name: /Northstar Audio/ }).getAttribute('href')).toBe(
      '/products?vendor=northstar-audio',
    );
  });

  it('shows retry action when brand request fails', () => {
    const refetch = vi.fn();
    useBrands.mockReturnValue({ isLoading: false, isError: true, refetch });

    render(<BrandDirectory initialPage={1} initialSearch="" />);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(refetch).toHaveBeenCalledOnce();
  });

  it('shows pagination when results span multiple pages', () => {
    useBrands.mockReturnValue({
      data: {
        items: [
          {
            vendorId: 'vendor-1',
            name: 'Northstar Audio',
            slug: 'northstar-audio',
            tagline: null,
            description: null,
            logoUrl: null,
            bannerUrl: null,
            isFeatured: false,
            productCount: 1,
          },
        ],
        pagination: { page: 1, limit: 24, total: 100, totalPages: 5 },
      },
      isLoading: false,
      isError: false,
    });

    render(<BrandDirectory initialPage={1} initialSearch="" />);
    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));

    expect(push).toHaveBeenCalledWith('/brands?page=2');
  });

  it('debounces search and updates results without a submit action', () => {
    vi.useFakeTimers();
    useBrands.mockReturnValue({
      data: { items: [], pagination: { page: 1, limit: 24, total: 0, totalPages: 0 } },
      isLoading: false,
      isError: false,
    });

    render(<BrandDirectory initialPage={1} initialSearch="" />);
    fireEvent.change(screen.getByRole('textbox', { name: /Search brands/ }), {
      target: { value: 'morrow' },
    });

    act(() => vi.advanceTimersByTime(299));
    expect(useBrands).toHaveBeenLastCalledWith({ page: 1, limit: 24, search: undefined });

    act(() => vi.advanceTimersByTime(1));
    expect(useBrands).toHaveBeenLastCalledWith({ page: 1, limit: 24, search: 'morrow' });
    expect(replace).toHaveBeenCalledWith('/brands?page=1&search=morrow', { scroll: false });
    expect(screen.getByRole('button', { name: 'Clear brand search' })).toBeTruthy();
  });

  it('clears search immediately and requests the unfiltered directory after debounce', () => {
    vi.useFakeTimers();
    useBrands.mockReturnValue({
      data: { items: [], pagination: { page: 1, limit: 24, total: 0, totalPages: 0 } },
      isLoading: false,
      isError: false,
    });

    render(<BrandDirectory initialPage={1} initialSearch="unknown" />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear brand search' }));

    expect((screen.getByRole('textbox', { name: /Search brands/ }) as HTMLInputElement).value).toBe(
      '',
    );
    act(() => vi.advanceTimersByTime(300));

    expect(useBrands).toHaveBeenLastCalledWith({ page: 1, limit: 24, search: undefined });
    expect(replace).toHaveBeenCalledWith('/brands?page=1', { scroll: false });
  });
});
