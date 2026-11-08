import { beforeEach, describe, expect, it, vi } from 'vitest';

const { makeApiRequest } = vi.hoisted(() => ({ makeApiRequest: vi.fn() }));

vi.mock('@/lib/api-client', () => ({ makeApiRequest }));

import {
  fetchFeaturedBrands,
  fetchHomeCategories,
  fetchHomeProducts,
  fetchHomepageCampaigns,
} from './home.service';

import { API_ENDPOINTS } from '@/lib/api-endpoints';

describe('fetchFeaturedBrands', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requests vendors marked featured from the brands endpoint', async () => {
    await fetchFeaturedBrands();

    expect(makeApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: API_ENDPOINTS.brands.list,
        method: 'GET',
        params: { featured: true, page: 1, limit: 6 },
      }),
    );
  });
});

describe('homepage service requests', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requests the complete category tree', async () => {
    await fetchHomeCategories();

    expect(makeApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: API_ENDPOINTS.categories.list,
        params: { all: 'true' },
      }),
    );
  });

  it('requests in-stock products with the requested sort and limit', async () => {
    await fetchHomeProducts({ sortBy: 'newest', limit: 8 });

    expect(makeApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: API_ENDPOINTS.catalog.products,
        params: { sortBy: 'newest', limit: 8, inStock: true, page: 1 },
      }),
    );
  });

  it('requests active and upcoming homepage campaigns', async () => {
    await fetchHomepageCampaigns();

    expect(makeApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: API_ENDPOINTS.merchandising.homepage, method: 'GET' }),
    );
  });
});
