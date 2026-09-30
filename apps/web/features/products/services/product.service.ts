import type {
  BulkProductAction,
  BulkProductActionResponse,
  ProductItem,
  ProductListFilters,
  ProductListResponse,
} from '../types/product.types';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export async function fetchVendorProducts(
  filters: ProductListFilters = {},
): Promise<ProductListResponse> {
  return makeApiRequest<ProductListResponse>({
    url: API_ENDPOINTS.vendor.products,
    method: 'GET',
    params: filters,
  });
}

export async function updateVendorProduct(
  productId: string,
  data: {
    name?: string;
    description?: string;
    price?: string;
    stock?: number;
    published?: boolean;
    productImageId?: string | null;
  },
): Promise<{ message: string; product: ProductItem }> {
  return makeApiRequest<{ message: string; product: ProductItem }>({
    url: API_ENDPOINTS.vendor.productDetail(productId),
    method: 'PATCH',
    data,
  });
}

export async function archiveVendorProduct(
  productId: string,
): Promise<{ message: string; product: ProductItem }> {
  return makeApiRequest<{ message: string; product: ProductItem }>({
    url: API_ENDPOINTS.vendor.productArchive(productId),
    method: 'PATCH',
  });
}

export async function restoreVendorProduct(
  productId: string,
): Promise<{ message: string; product: ProductItem }> {
  return makeApiRequest<{ message: string; product: ProductItem }>({
    url: API_ENDPOINTS.vendor.productRestore(productId),
    method: 'PATCH',
  });
}

export async function deleteVendorProduct(productId: string): Promise<{ message: string }> {
  return makeApiRequest<{ message: string }>({
    url: API_ENDPOINTS.vendor.productDetail(productId),
    method: 'DELETE',
  });
}

export async function bulkProductAction(
  action: BulkProductAction,
  productIds: string[],
): Promise<BulkProductActionResponse> {
  return makeApiRequest<BulkProductActionResponse>({
    url: API_ENDPOINTS.vendor.productsBulk,
    method: 'POST',
    data: { action, productIds },
  });
}
