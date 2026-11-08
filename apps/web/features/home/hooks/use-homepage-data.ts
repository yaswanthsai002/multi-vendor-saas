import { useQuery } from '@tanstack/react-query';

import {
  fetchFeaturedBrands,
  fetchHomeCategories,
  fetchHomeProducts,
  fetchHomepageCampaigns,
} from '../services/home.service';

import { queryKeys } from '@/lib/query-keys';

export function useHomeCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(undefined, true),
    queryFn: ({ signal }) => fetchHomeCategories(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHomeProducts(params: {
  isFeatured?: boolean;
  sortBy?: 'newest';
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.catalog.list({ ...params, inStock: true }),
    queryFn: ({ signal }) => fetchHomeProducts(params, signal),
    staleTime: 60 * 1000,
  });
}

export function useFeaturedBrands() {
  return useQuery({
    queryKey: queryKeys.brands.list({ featured: true, page: 1, limit: 6 }),
    queryFn: ({ signal }) => fetchFeaturedBrands(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHomepageCampaigns() {
  return useQuery({
    queryKey: queryKeys.merchandising.homepage(),
    queryFn: ({ signal }) => fetchHomepageCampaigns(signal),
    staleTime: 30 * 1000,
  });
}
