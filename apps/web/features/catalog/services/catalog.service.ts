import type {
  CatalogFacetsResponse,
  CatalogFilters,
  CatalogProductDetail,
  CatalogResponse,
} from '../types/catalog.types';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export async function fetchCatalogProducts(filters: CatalogFilters = {}): Promise<CatalogResponse> {
  return makeApiRequest<CatalogResponse>({
    url: API_ENDPOINTS.catalog.products,
    method: 'GET',
    params: filters,
  });
}

export async function fetchCatalogProductBySlug(
  slug: string,
): Promise<{ product: CatalogProductDetail }> {
  return makeApiRequest<{ product: CatalogProductDetail }>({
    url: API_ENDPOINTS.catalog.productDetail(slug),
    method: 'GET',
  });
}

export async function fetchCatalogFacets(): Promise<CatalogFacetsResponse> {
  return makeApiRequest<CatalogFacetsResponse>({
    url: API_ENDPOINTS.catalog.facets,
    method: 'GET',
  });
}
