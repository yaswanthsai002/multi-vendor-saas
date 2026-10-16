import { useQuery } from '@tanstack/react-query';

import {
  fetchCatalogFacets,
  fetchCatalogProductBySlug,
  fetchCatalogProducts,
} from '../services/catalog.service';

import type { CatalogFilters } from '../types/catalog.types';

import { queryKeys } from '@/lib/query-keys';

export function useCatalog(filters: CatalogFilters = {}) {
  return useQuery({
    queryKey: queryKeys.catalog.list(filters),
    queryFn: () => fetchCatalogProducts(filters),
  });
}

export function useCatalogFacets() {
  return useQuery({
    queryKey: queryKeys.catalog.facets(),
    queryFn: () => fetchCatalogFacets(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCatalogProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.catalog.detail(slug),
    queryFn: () => fetchCatalogProductBySlug(slug),
    enabled: Boolean(slug),
  });
}
