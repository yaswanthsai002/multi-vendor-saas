export type CatalogSortBy = 'featured' | 'price_asc' | 'price_desc' | 'newest';

export interface CatalogVendor {
  vendorId: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  tagline?: string | null;
  description?: string | null;
}

export interface CatalogCategory {
  categoryId: string;
  name: string;
  slug: string;
  parentCategoryId?: string | null;
  productCount?: number;
}

export interface CatalogProduct {
  productId: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  isFeatured: boolean;
  createdAt: string;
  imageUrl: string | null;
  vendor: CatalogVendor;
  categories: CatalogCategory[];
}

export interface CatalogProductDetail extends CatalogProduct {
  description: string;
  primaryImage: string | null;
  gallery: {
    mediaId: string;
    url: string;
    sortOrder: number;
  }[];
}

export interface CatalogFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string | string[];
  vendor?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  sortBy?: CatalogSortBy;
}

export interface CatalogResponse {
  items: CatalogProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CatalogFacetsResponse {
  priceRange: {
    min: number;
    max: number;
  };
  categories: CatalogCategory[];
}
