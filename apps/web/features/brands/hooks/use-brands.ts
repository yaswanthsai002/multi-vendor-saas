import { useQuery } from '@tanstack/react-query';

import { fetchBrands } from '../services/brands.service';

import { queryKeys } from '@/lib/query-keys';

export function useBrands(filters: {
  page: number;
  limit: number;
  search?: string;
  featured?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.brands.list(filters),
    queryFn: ({ signal }) => fetchBrands(filters, signal),
    staleTime: 60_000,
  });
}
