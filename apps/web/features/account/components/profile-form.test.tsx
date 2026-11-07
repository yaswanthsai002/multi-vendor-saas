import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ProfileForm } from './profile-form';

import type { CurrentUserData } from '@/lib/auth/current-user';

const { fetchAddressesMock, updateProfileMock } = vi.hoisted(() => ({
  fetchAddressesMock: vi.fn(),
  updateProfileMock: vi.fn(),
}));

vi.mock('../services/account.service', () => ({
  fetchCustomerAddresses: fetchAddressesMock,
  updateProfile: updateProfileMock,
  uploadProfileAvatar: vi.fn(),
  removeProfileAvatar: vi.fn(),
}));

const user = {
  userId: 'user-1',
  fullName: 'Aarav Sharma',
  email: 'aarav@example.com',
  roles: ['customer'],
} satisfies CurrentUserData;

describe('ProfileForm', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('updates name and keeps email read-only', async () => {
    const userEvents = userEvent.setup();
    fetchAddressesMock.mockResolvedValue({ items: [] });
    updateProfileMock.mockResolvedValue({ user: { ...user, fullName: 'Aarav Singh' } });
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ProfileForm user={user} />
      </QueryClientProvider>,
    );

    expect(screen.getByLabelText('Email')).toHaveProperty('disabled', true);
    expect(await screen.findByText('No default address')).toBeDefined();
    expect(await screen.findByText('0 addresses')).toBeDefined();
    const nameInput = screen.getByLabelText('Full name');
    await userEvents.clear(nameInput);
    await userEvents.type(nameInput, 'Aarav Singh');
    await userEvents.click(screen.getByRole('button', { name: 'Save profile' }));

    await waitFor(() => expect(updateProfileMock).toHaveBeenCalledWith('Aarav Singh'));
    expect(queryClient.getQueryData(['auth', 'me'])).toEqual({
      user: { ...user, fullName: 'Aarav Singh' },
    });
  });
});
