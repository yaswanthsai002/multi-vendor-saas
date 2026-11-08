import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export interface HomeCategory {
  categoryId: string;
  name: string;
  slug: string;
  parentCategoryId: string | null;
  imageUrl: string | null;
  hasChildren: boolean;
}

export interface HomeBrand {
  vendorId: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isFeatured: boolean;
}

export interface HomeProduct {
  productId: string;
  name: string;
  slug: string;
  price: string;
  regularPrice?: string;
  mrp: string;
  stock: number;
  isFeatured: boolean;
  imageUrl: string | null;
  rating: number | null;
  ratingCount: number;
  vendor: { vendorId: string; name: string; slug: string; logoUrl: string | null };
}

export interface HomepageCampaignProduct {
  productId: string;
  name: string;
  slug: string;
  regularPrice: string;
  dealPrice: string;
  mrp: string;
  stock: number;
  imageUrl: string | null;
  rating: number | null;
  ratingCount: number;
  vendor: { vendorId: string; name: string; slug: string };
}

export interface HomepageCampaign {
  campaignId: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string | null;
  ctaLabel: string;
  ctaHref: string;
  startsAt: string;
  endsAt: string;
  products: HomepageCampaignProduct[];
}

export interface HomepageCampaignResponse {
  active: HomepageCampaign[];
  upcoming: HomepageCampaign[];
}

export async function fetchHomeCategories(signal?: AbortSignal) {
  return makeApiRequest<HomeCategory[]>({
    url: API_ENDPOINTS.categories.list,
    method: 'GET',
    params: { all: 'true' },
    signal,
  });
}

export async function fetchFeaturedBrands(signal?: AbortSignal) {
  return makeApiRequest<{ items: HomeBrand[] }>({
    url: API_ENDPOINTS.brands.list,
    method: 'GET',
    params: { featured: true, page: 1, limit: 6 },
    signal,
  });
}

export async function fetchHomeProducts(
  params: { isFeatured?: boolean; sortBy?: 'newest'; limit?: number },
  signal?: AbortSignal,
) {
  return makeApiRequest<{ items: HomeProduct[] }>({
    url: API_ENDPOINTS.catalog.products,
    method: 'GET',
    params: { ...params, inStock: true, page: 1 },
    signal,
  });
}

export async function fetchHomepageCampaigns(signal?: AbortSignal) {
  return makeApiRequest<HomepageCampaignResponse>({
    url: API_ENDPOINTS.merchandising.homepage,
    method: 'GET',
    signal,
  });
}
