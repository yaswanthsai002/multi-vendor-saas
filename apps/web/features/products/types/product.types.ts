import type { MediaItem } from '@/features/media/types/media.types';

export interface ProductCategoryRef {
  categoryId: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

export interface ProductItem {
  productId: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  price: string;
  stock: number;
  published: boolean;
  isSoftDeleted: boolean;
  rating: number | null;
  productImageId?: string | null;
  primaryImage: MediaItem | null;
  categories: ProductCategoryRef[];
  createdAt: string;
  updatedAt: string;
  softDeletedAt?: string | null;
}

export interface ProductListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResponse {
  products: ProductItem[];
  pagination: ProductListPagination;
}

export interface ProductListFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  stock?: 'all' | 'in_stock' | 'out_of_stock';
  published?: 'all' | 'true' | 'false';
  archived?: 'true' | 'false';
  sortBy?: 'createdAt' | 'price' | 'name' | 'stock';
  sortOrder?: 'asc' | 'desc';
}

export type ProductTab = 'all' | 'published' | 'unpublished' | 'archived';

export type BulkProductAction = 'publish' | 'unpublish' | 'archive' | 'restore' | 'delete';

export interface BulkProductActionResponse {
  action: BulkProductAction;
  total: number;
  processed: number;
  failedCount: number;
  failed: Array<{ productId: string; reason: string }>;
  message: string;
}

export interface GalleryMediaItem extends MediaItem {
  sortOrder: number;
}

export interface ProductDetail extends ProductItem {
  gallery?: GalleryMediaItem[];
}

export interface CreateProductInput {
  name: string;
  shortDescription?: string | null;
  description?: string;
  price: string;
  stock: number;
  productImageId?: string | null;
  galleryMediaIds?: string[];
  categoryIds?: string[];
  published?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  shortDescription?: string | null;
  description?: string;
  price?: string;
  stock?: number;
  productImageId?: string | null;
  galleryMediaIds?: string[];
  categoryIds?: string[];
  published?: boolean;
}
