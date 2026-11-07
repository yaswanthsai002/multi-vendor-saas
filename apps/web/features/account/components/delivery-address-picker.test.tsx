import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DeliveryAddressPicker } from './delivery-address-picker';

const {
  fetchAddressesMock,
  updateAddressMock,
  lookupPostalCodeMock,
  currentUserMock,
  routerPushMock,
} = vi.hoisted(() => ({
  fetchAddressesMock: vi.fn(),
  updateAddressMock: vi.fn(),
  lookupPostalCodeMock: vi.fn(),
  currentUserMock: vi.fn(),
  routerPushMock: vi.fn(),
}));

vi.mock('../services/account.service', () => ({
  fetchCustomerAddresses: fetchAddressesMock,
  updateCustomerAddress: updateAddressMock,
  lookupPostalCode: lookupPostalCodeMock,
}));

vi.mock('@/shared/hooks/use-current-user', () => ({ useCurrentUser: currentUserMock }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: routerPushMock }) }));

const addresses = [
  {
    addressId: 'address-1',
    recipientName: 'Aarav Sharma',
    phone: '+91 9876543210',
    addressLine1: '12 Market Road',
    addressLine2: null,
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500001',
    country: 'IN' as const,
    isDefault: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    addressId: 'address-2',
    recipientName: 'Aarav Sharma',
    phone: '+91 9876543210',
    addressLine1: '22 Lake View',
    addressLine2: null,
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500002',
    country: 'IN' as const,
    isDefault: false,
    createdAt: '',
    updatedAt: '',
  },
];

describe('DeliveryAddressPicker', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  beforeEach(() => {
    lookupPostalCodeMock.mockResolvedValue({
      items: [{ area: 'KPHB Colony', city: 'Hyderabad', state: 'Telangana' }],
    });
  });

  it('shows the selected address and makes another saved address the default', async () => {
    const user = userEvent.setup();
    let savedAddresses = addresses;
    currentUserMock.mockReturnValue({ data: { user: { userId: 'user-1' } } });
    fetchAddressesMock.mockImplementation(async () => ({ items: savedAddresses }));
    updateAddressMock.mockImplementation(async (addressId: string) => {
      savedAddresses = savedAddresses.map((address) => ({
        ...address,
        isDefault: address.addressId === addressId,
      }));
      return { address: savedAddresses.find((address) => address.addressId === addressId) };
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <DeliveryAddressPicker />
      </QueryClientProvider>,
    );

    const trigger = await screen.findByRole('button', { name: /500001/i });
    await user.click(trigger);
    await user.click(await screen.findByRole('button', { name: /22 Lake View/i }));

    await waitFor(() =>
      expect(updateAddressMock).toHaveBeenCalledWith('address-2', { isDefault: true }),
    );
    expect(await screen.findByRole('button', { name: /500002/i })).toBeDefined();
  });

  it('offers location update when account has no saved address', async () => {
    const user = userEvent.setup();
    currentUserMock.mockReturnValue({ data: { user: { userId: 'user-1' } } });
    fetchAddressesMock.mockResolvedValue({ items: [] });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <DeliveryAddressPicker />
      </QueryClientProvider>,
    );

    await user.click(await screen.findByRole('button', { name: /choose delivery location/i }));
    expect(await screen.findByText('No saved addresses yet.')).toBeDefined();
    expect(screen.getByRole('button', { name: /add address/i })).toBeDefined();
  });

  it('lets guests set a PIN without signing in', async () => {
    const user = userEvent.setup();
    currentUserMock.mockReturnValue({ data: { user: null }, isLoading: false });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <DeliveryAddressPicker />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole('button', { name: /choose delivery location/i }));
    expect(screen.getByRole('button', { name: /sign in to see your addresses/i })).toBeDefined();
    const pinField = screen.getByLabelText('Indian PIN code');
    await user.type(pinField, '123');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(await screen.findByText('Enter a valid six-digit Indian PIN code.')).toBeDefined();
    expect(window.localStorage.getItem('perigee.delivery-pin')).toBeNull();

    await user.clear(pinField);
    await user.type(pinField, '500072');
    await screen.findByText('Delivery area: Hyderabad, Telangana');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(await screen.findByRole('button', { name: /500072/i })).toBeDefined();
    expect(window.localStorage.getItem('perigee.delivery-pin')).toBe('500072');
    expect(window.localStorage.getItem('perigee.delivery-location')).toContain('Hyderabad');
  });
});
