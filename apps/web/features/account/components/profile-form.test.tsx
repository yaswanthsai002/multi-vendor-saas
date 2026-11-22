import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/lib/query-keys';

import { ProfileForm } from './profile-form';

import type { CurrentUserData } from '@/lib/auth/current-user';

const { fetchAddressesMock, updateProfileMock, uploadAvatarMock, removeAvatarMock } = vi.hoisted(
  () => ({
    fetchAddressesMock: vi.fn(),
    updateProfileMock: vi.fn(),
    uploadAvatarMock: vi.fn(),
    removeAvatarMock: vi.fn(),
  }),
);

vi.mock('../services/account.service', () => ({
  fetchCustomerAddresses: fetchAddressesMock,
  updateProfile: updateProfileMock,
  uploadProfileAvatar: uploadAvatarMock,
  removeProfileAvatar: removeAvatarMock,
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
    queryClient.setQueryData(queryKeys.catalog.reviews('lamp'), { pages: [1, 2] });
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
    expect(queryClient.getQueryState(queryKeys.catalog.reviews('lamp'))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryData(['auth', 'me'])).toEqual({
      user: { ...user, fullName: 'Aarav Singh' },
    });
  });
  it.each(['upload', 'remove'] as const)(
    'refreshes public reviews after avatar %s',
    async (action) => {
      const events = userEvent.setup();
      fetchAddressesMock.mockResolvedValue({ items: [] });
      const current = { ...user, avatarUrl: 'https://example.test/old.webp' };
      const result = {
        ...current,
        avatarUrl: action === 'remove' ? null : 'https://example.test/new.webp',
      };
      uploadAvatarMock.mockResolvedValue({ user: result });
      removeAvatarMock.mockResolvedValue({ user: result });
      const client = new QueryClient();
      client.setQueryData(queryKeys.catalog.reviews('lamp'), { pages: [1, 2] });
      render(
        <QueryClientProvider client={client}>
          <ProfileForm user={current} />
        </QueryClientProvider>,
      );
      if (action === 'upload')
        await events.upload(
          screen.getByLabelText('Choose profile photo'),
          new File(['image'], 'photo.webp', { type: 'image/webp' }),
        );
      else await events.click(screen.getByRole('button', { name: 'Remove photo' }));
      await waitFor(() =>
        expect(client.getQueryData(queryKeys.auth.me())).toEqual({ user: result }),
      );
      expect(client.getQueryState(queryKeys.catalog.reviews('lamp'))?.isInvalidated).toBe(true);
    },
  );
});
