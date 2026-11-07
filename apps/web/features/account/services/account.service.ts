import type { CustomerAddress, CustomerAddressInput } from '../types/account.types';
import type { CurrentUserData } from '@/lib/auth/current-user';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export async function fetchCustomerAddresses(signal?: AbortSignal) {
  return makeApiRequest<{ items: CustomerAddress[] }>({
    url: API_ENDPOINTS.customer.addresses,
    method: 'GET',
    signal,
  });
}

export interface PostalArea {
  area: string;
  city: string;
  state: string;
}

export async function lookupPostalCode(postalCode: string, signal?: AbortSignal) {
  return makeApiRequest<{ items: PostalArea[] }>({
    url: API_ENDPOINTS.locations.postalCode(postalCode),
    method: 'GET',
    signal,
  });
}

export async function createCustomerAddress(input: CustomerAddressInput) {
  return makeApiRequest<{ address: CustomerAddress }>({
    url: API_ENDPOINTS.customer.addresses,
    method: 'POST',
    data: input,
  });
}

export async function updateCustomerAddress(
  addressId: string,
  input: Partial<CustomerAddressInput>,
) {
  return makeApiRequest<{ address: CustomerAddress }>({
    url: API_ENDPOINTS.customer.address(addressId),
    method: 'PATCH',
    data: input,
  });
}

export async function deleteCustomerAddress(addressId: string) {
  return makeApiRequest<void>({
    url: API_ENDPOINTS.customer.address(addressId),
    method: 'DELETE',
  });
}

export async function updateProfile(fullName: string) {
  return makeApiRequest<{ user: CurrentUserData }>({
    url: API_ENDPOINTS.auth.updateMe,
    method: 'PATCH',
    data: { fullName },
  });
}

export async function uploadProfileAvatar(file: File) {
  const { uploadUrl, publicUrl } = await makeApiRequest<{
    uploadUrl: string;
    publicUrl: string;
  }>({
    url: API_ENDPOINTS.auth.avatarUploadUrl,
    method: 'POST',
    data: { fileName: file.name, mimeType: file.type, fileSizeBytes: file.size },
  });
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!response.ok) throw new Error('Could not upload profile photo.');
  return makeApiRequest<{ user: CurrentUserData }>({
    url: API_ENDPOINTS.auth.updateMe,
    method: 'PATCH',
    data: { avatarUrl: publicUrl },
  });
}

export async function removeProfileAvatar() {
  return makeApiRequest<{ user: CurrentUserData }>({
    url: API_ENDPOINTS.auth.updateMe,
    method: 'PATCH',
    data: { avatarUrl: null },
  });
}
