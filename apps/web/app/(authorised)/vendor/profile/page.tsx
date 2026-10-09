import type { Metadata } from 'next';

import { VendorProfileView } from '@/features/vendor-profile/components/vendor-profile-view';

export const metadata: Metadata = {
  title: 'Store Profile | Perigee Vendor',
  description: 'Manage your store brand, banner, logo, and owner profile.',
};

export default function VendorProfilePage() {
  return <VendorProfileView />;
}
