'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/query-keys';
import { useCurrentUser } from '@/shared/hooks/use-current-user';

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: string;
  mrp: string;
  stock: number;
  imageUrl: string | null;
  vendorName: string;
  createdAt: string;
}

export function useWishlist() {
  const queryClient = useQueryClient();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const userId = currentUser?.user?.userId;
  const queryKey = queryKeys.wishlist.list(userId);
  const wishlist = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      makeApiRequest<{ items: WishlistItem[] }>({
        url: API_ENDPOINTS.wishlist.root,
        method: 'GET',
        signal,
      }),
    enabled: Boolean(userId),
  });
  const mutation = useMutation({
    mutationFn: ({ productId, saved }: { productId: string; saved: boolean }) =>
      makeApiRequest<void>({
        url: saved ? API_ENDPOINTS.wishlist.items : API_ENDPOINTS.wishlist.item(productId),
        method: saved ? 'POST' : 'DELETE',
        ...(saved ? { data: { productId } } : {}),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: () => toast.error('Could not update wishlist. Try again.'),
  });
  const productIds = new Set(wishlist.data?.items.map((item) => item.productId) ?? []);

  return {
    userId,
    isUserLoading,
    wishlist,
    mutation,
    productIds,
    toggle: (productId: string) =>
      mutation.mutate({ productId, saved: !productIds.has(productId) }),
    remove: (productId: string) => mutation.mutate({ productId, saved: false }),
  };
}
