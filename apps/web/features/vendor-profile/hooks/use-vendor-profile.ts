import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { vendorProfileService } from '../services/vendor-profile.service';

import type { UpdateVendorProfilePayload } from '../types/vendor-profile.types';

import { queryKeys } from '@/lib/query-keys';

export function useVendorProfile() {
  return useQuery({
    queryKey: queryKeys.profile.all(),
    queryFn: () => vendorProfileService.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useUpdateVendorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateVendorProfilePayload) =>
      vendorProfileService.updateProfile(payload),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(queryKeys.profile.all(), updatedProfile);
      // Invalidate me query to keep session store/user state synchronized
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      toast.success('Store profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update store profile');
    },
  });
}
