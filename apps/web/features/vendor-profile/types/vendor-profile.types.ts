export interface VendorProfileUser {
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
  emailVerifiedAt: string | null;
}

export interface VendorProfile {
  vendorId: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  createdAt: string;
  updatedAt: string;
  user: VendorProfileUser;
}

export interface UpdateVendorProfilePayload {
  name?: string;
  tagline?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  fullName?: string;
}
