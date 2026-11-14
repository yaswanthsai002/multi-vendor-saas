'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

import { lookupPostalCode } from '../services/account.service';

export function usePostalCode(postalCode: string) {
  return useQuery({
    queryKey: queryKeys.account.postalCode(postalCode),
    queryFn: ({ signal }) => lookupPostalCode(postalCode, signal),
    enabled: /^[1-9]\d{5}$/.test(postalCode),
    staleTime: 1000 * 60 * 60 * 24,
    retry: false,
  });
}
