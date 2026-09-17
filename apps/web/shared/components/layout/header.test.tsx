import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Header } from './header';
import { HeaderDeliveryAddress } from './header-delivery-address';
import { getDiceBearAvatarUrl, getPrimaryRoleBadge } from './use-user-menu';

import * as currentUserHook from '@/shared/hooks/use-current-user';

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/api-client', () => ({
  makeApiRequest: vi.fn().mockResolvedValue({ message: 'Success' }),
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Header & User Menu Unit & Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Role Hierarchy & DiceBear Helper Functions', () => {
    it('resolves primary role badge correctly according to hierarchy', () => {
      expect(getPrimaryRoleBadge(['admin', 'vendor', 'customer'])).toBe('Admin');
      expect(getPrimaryRoleBadge(['admin', 'customer'])).toBe('Admin');
      expect(getPrimaryRoleBadge(['vendor', 'customer'])).toBe('Vendor');
      expect(getPrimaryRoleBadge(['customer'])).toBeNull();
      expect(getPrimaryRoleBadge([])).toBeNull();
      expect(getPrimaryRoleBadge(undefined)).toBeNull();
    });

    it('generates proper DiceBear SVG avatar URL', () => {
      const url = getDiceBearAvatarUrl('Yaswanth');
      expect(url).toContain('https://api.dicebear.com/9.x/lorelei/svg?seed=Yaswanth');
    });
  });

  describe('Header Rendering (Unauthenticated)', () => {
    beforeEach(() => {
      vi.spyOn(currentUserHook, 'useCurrentUser').mockReturnValue({
        data: null,
        isLoading: false,
      } as unknown as ReturnType<typeof currentUserHook.useCurrentUser>);
    });

    it('renders logo, search bar, delivery address, wishlist, and Signin link', () => {
      renderWithClient(<Header initialCartCount={0} />);

      expect(screen.getAllByLabelText(/perigee home/i).length).toBeGreaterThanOrEqual(1);
      expect(
        screen.getAllByPlaceholderText(/search products, brands/i).length,
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByRole('link', { name: /signin/i }).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByRole('link', { name: /wishlist/i }).length).toBeGreaterThanOrEqual(1);
    });

    it('does not render cart badge when count is 0', () => {
      renderWithClient(<Header initialCartCount={0} />);

      const cartLinks = screen.getAllByLabelText(/shopping cart \(0 items\)/i);
      expect(cartLinks.length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('0')).toBeNull();
    });

    it('renders cart badge when count is greater than 0', () => {
      renderWithClient(<Header initialCartCount={3} />);

      expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByLabelText(/shopping cart \(3 items\)/i).length).toBeGreaterThanOrEqual(
        1,
      );
    });
  });

  describe('Delivery Address Dropdown', () => {
    it('toggles dropdown and selects an address', async () => {
      const user = userEvent.setup();
      renderWithClient(
        <HeaderDeliveryAddress
          addresses={[
            { id: '1', label: 'Home', detail: 'Hyderabad 500001' },
            { id: '2', label: 'Office', detail: 'Bangalore 560001' },
          ]}
        />,
      );

      const triggerBtn = screen.getByRole('button', { name: /deliver to/i });
      expect(triggerBtn).toBeDefined();

      // Open dropdown
      await user.click(triggerBtn);
      expect(screen.getByText('Choose your location')).toBeDefined();
      expect(screen.getByText('Home')).toBeDefined();
      expect(screen.getByText('Office')).toBeDefined();

      // Select Office address
      await user.click(screen.getByText('Office'));
      expect(screen.queryByText('Choose your location')).toBeNull();
    });

    it('displays placeholder add address button when addresses list is empty', async () => {
      const user = userEvent.setup();
      renderWithClient(<HeaderDeliveryAddress addresses={[]} defaultAddress="Add Location" />);

      const triggerBtn = screen.getByRole('button', { name: /deliver to/i });
      await user.click(triggerBtn);

      expect(screen.getByText('No saved addresses')).toBeDefined();
      expect(screen.getByRole('button', { name: /add address/i })).toBeDefined();
    });
  });

  describe('Header User Menu (Authenticated)', () => {
    it('renders avatar and dropdown with admin hierarchy badge for admin user', async () => {
      const user = userEvent.setup();
      vi.spyOn(currentUserHook, 'useCurrentUser').mockReturnValue({
        data: {
          user: {
            userId: 'usr_1',
            fullName: 'Jane Doe',
            email: 'jane@perigee.com',
            roles: ['admin', 'vendor', 'customer'],
          },
        },
        isLoading: false,
      } as unknown as ReturnType<typeof currentUserHook.useCurrentUser>);

      renderWithClient(<Header />);

      const avatarButtons = screen.getAllByRole('button', { name: /user menu for Jane Doe/i });
      expect(avatarButtons.length).toBeGreaterThanOrEqual(1);

      // Click the first visible avatar to open pinned menu
      await user.click(avatarButtons[0]);

      expect(screen.getAllByText('Jane Doe').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('jane@perigee.com').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Admin').length).toBeGreaterThanOrEqual(1); // Admin priority badge
      expect(
        screen.getAllByRole('menuitem', { name: /admin dashboard/i }).length,
      ).toBeGreaterThanOrEqual(1);
      expect(
        screen.getAllByRole('menuitem', { name: /vendor dashboard/i }).length,
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByRole('menuitem', { name: /settings/i }).length).toBeGreaterThanOrEqual(
        1,
      );
    });

    it('renders vendor badge and vendor dashboard for vendor customer', async () => {
      const user = userEvent.setup();
      vi.spyOn(currentUserHook, 'useCurrentUser').mockReturnValue({
        data: {
          user: {
            userId: 'usr_2',
            fullName: 'John Smith',
            email: 'john@vendor.com',
            roles: ['vendor', 'customer'],
          },
        },
        isLoading: false,
      } as unknown as ReturnType<typeof currentUserHook.useCurrentUser>);

      renderWithClient(<Header />);

      const avatarButtons = screen.getAllByRole('button', { name: /user menu for John Smith/i });
      await user.click(avatarButtons[0]);

      expect(screen.getAllByText('John Smith').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Vendor').length).toBeGreaterThanOrEqual(1); // Vendor badge
      expect(screen.queryByText('Admin')).toBeNull();
      expect(
        screen.getAllByRole('menuitem', { name: /vendor dashboard/i }).length,
      ).toBeGreaterThanOrEqual(1);
      expect(screen.queryByRole('menuitem', { name: /admin dashboard/i })).toBeNull();
    });

    it('renders no role badge and no dashboard links for pure customer', async () => {
      const user = userEvent.setup();
      vi.spyOn(currentUserHook, 'useCurrentUser').mockReturnValue({
        data: {
          user: {
            userId: 'usr_3',
            fullName: 'Customer One',
            email: 'customer@perigee.com',
            roles: ['customer'],
          },
        },
        isLoading: false,
      } as unknown as ReturnType<typeof currentUserHook.useCurrentUser>);

      renderWithClient(<Header />);

      const avatarButtons = screen.getAllByRole('button', { name: /user menu for Customer One/i });
      await user.click(avatarButtons[0]);

      expect(screen.getAllByText('Customer One').length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('Admin')).toBeNull();
      expect(screen.queryByText('Vendor')).toBeNull();
      expect(screen.queryByRole('menuitem', { name: /admin dashboard/i })).toBeNull();
      expect(screen.queryByRole('menuitem', { name: /vendor dashboard/i })).toBeNull();
    });

    it('triggers signout and redirects to /signin', async () => {
      const user = userEvent.setup();
      vi.spyOn(currentUserHook, 'useCurrentUser').mockReturnValue({
        data: {
          user: {
            userId: 'usr_1',
            fullName: 'Jane Doe',
            email: 'jane@perigee.com',
            roles: ['customer'],
          },
        },
        isLoading: false,
      } as unknown as ReturnType<typeof currentUserHook.useCurrentUser>);

      renderWithClient(<Header />);

      const avatarButtons = screen.getAllByRole('button', { name: /user menu for Jane Doe/i });
      await user.click(avatarButtons[0]);

      const signoutBtns = screen.getAllByRole('menuitem', { name: /sign out/i });
      await user.click(signoutBtns[0]);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/signin');
      });
    });
  });
});
