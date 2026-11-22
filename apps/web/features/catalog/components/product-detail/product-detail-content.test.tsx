import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/lib/query-keys';

import { ProductDetailContent } from './product-detail-content';

import type { ReviewPage } from './product-review.types';
import type { CatalogProductDetail } from '../../types/catalog.types';

const product: CatalogProductDetail = {
  productId: 'product',
  name: 'Lamp',
  slug: 'lamp',
  description: 'A lamp',
  shortDescription: null,
  price: '10.00',
  mrp: '12.00',
  stock: 3,
  isFeatured: false,
  createdAt: '2026-11-22T10:00:00Z',
  imageUrl: null,
  primaryImage: null,
  gallery: [],
  categories: [],
  vendor: { vendorId: 'vendor', name: 'Seller', slug: 'seller', logoUrl: null },
};
const author = {
  reviewId: 'review',
  authorName: 'Maya',
  authorAvatarUrl: 'https://example.test/avatar.webp',
  rating: 4,
  reviewText: '<script>alert(1)</script>\nUseful lamp',
  createdAt: '2026-11-22T10:00:00Z',
};
const page: ReviewPage = {
  items: [author],
  pagination: { page: 1, totalPages: 2, hasMore: true },
  averageRating: 4,
  ratingCount: 2,
  distribution: [1, 2, 3, 4, 5].map((rating) => ({ rating, count: rating === 4 ? 2 : 0 })),
};
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function mount(first = page) {
  const client = new QueryClient();
  const next = vi.fn().mockResolvedValue({
    ...page,
    items: [
      {
        ...author,
        reviewId: 'second',
        authorName: 'Arun',
        authorAvatarUrl: null,
        reviewText: null,
      },
    ],
    pagination: { page: 2, totalPages: 2, hasMore: false },
  });
  function Content() {
    const reviews = useInfiniteQuery({
      queryKey: queryKeys.catalog.reviews('lamp'),
      queryFn: next,
      initialPageParam: 1,
      getNextPageParam: (last: ReviewPage) =>
        last.pagination.hasMore ? last.pagination.page + 1 : undefined,
      initialData: { pages: [first], pageParams: [1] },
      staleTime: Infinity,
    });
    return <ProductDetailContent product={product} reviews={reviews} />;
  }
  return {
    ...render(
      <QueryClientProvider client={client}>
        <Content />
      </QueryClientProvider>,
    ),
    client,
    next,
  };
}
describe('public review profiles', () => {
  it('shows current photo and name, escapes feedback and retains pagination and rating-only reviews', async () => {
    const { container, next } = mount();
    expect(screen.getByText('Maya')).toBeDefined();
    expect(container.querySelector('img')?.getAttribute('src')).toBe(author.authorAvatarUrl);
    expect(container.querySelector('script')).toBeNull();
    expect(screen.getByText(/<script>alert/)).toBeDefined();
    await userEvent.click(screen.getByRole('button', { name: 'Show more reviews' }));
    expect(await screen.findByText('Arun')).toBeDefined();
    expect(next).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Show more reviews' })).toBeNull();
    expect(screen.getAllByLabelText('4 out of 5 stars')).toHaveLength(2);
  });
});
