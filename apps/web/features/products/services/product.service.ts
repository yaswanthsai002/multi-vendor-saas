import type {
  BulkProductAction,
  BulkProductActionResponse,
  CreateProductInput,
  ProductDetail,
  ProductItem,
  ProductListFilters,
  ProductListResponse,
  UpdateProductInput,
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

export async function fetchVendorProductById(
  productId: string,
): Promise<{ product: ProductDetail }> {
  return makeApiRequest<{ product: ProductDetail }>({
    url: API_ENDPOINTS.vendor.productDetail(productId),
    method: 'GET',
  });
}

export async function createVendorProduct(
  data: CreateProductInput,
): Promise<{ message: string; product: ProductItem }> {
  return makeApiRequest<{ message: string; product: ProductItem }>({
    url: API_ENDPOINTS.vendor.products,
    method: 'POST',
    data,
  });
}

export async function updateVendorProduct(
  productId: string,
  data: UpdateProductInput,
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
