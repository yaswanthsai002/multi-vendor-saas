import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export interface Brand {
  vendorId: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  isFeatured: boolean;
  productCount: number;
}

export interface BrandListResponse {
  items: Brand[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function fetchBrands(
  filters: { page: number; limit: number; search?: string; featured?: boolean },
  signal?: AbortSignal,
) {
  return makeApiRequest<BrandListResponse>({
    url: API_ENDPOINTS.brands.list,
    method: 'GET',
    params: filters,
    signal,
  });
}
