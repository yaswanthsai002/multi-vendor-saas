import type { UpdateVendorProfilePayload, VendorProfile } from '../types/vendor-profile.types';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export const vendorProfileService = {
  getProfile: async (): Promise<VendorProfile> => {
    const res = await makeApiRequest<{ profile: VendorProfile }>({
      url: API_ENDPOINTS.vendor.profile,
      method: 'GET',
    });
    return res.profile;
  },

  updateProfile: async (payload: UpdateVendorProfilePayload): Promise<VendorProfile> => {
    const res = await makeApiRequest<{ message: string; profile: VendorProfile }>({
      url: API_ENDPOINTS.vendor.profile,
      method: 'PATCH',
      data: payload,
    });
    return res.profile;
  },
};
