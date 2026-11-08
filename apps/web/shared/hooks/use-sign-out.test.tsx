import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { makeApiRequest, toastError } = vi.hoisted(() => ({
  makeApiRequest: vi.fn(),
  toastError: vi.fn(),
}));
const replace = vi.fn();

vi.mock('@/lib/api-client', () => ({ makeApiRequest }));
vi.mock('sonner', () => ({ toast: { error: toastError } }));

import { useSignOut } from './use-sign-out';

describe('useSignOut', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    makeApiRequest.mockResolvedValue({ message: 'Signed out' });
    vi.stubGlobal('location', {
      href: 'http://localhost/',
      origin: 'http://localhost',
      replace,
    });
    vi.stubGlobal('BroadcastChannel', undefined);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('uses shared sign-out endpoint, clears cached data, and leaves app for sign-in', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['vendor', 'profile'], { name: 'Previous vendor' });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useSignOut(), { wrapper });

    await act(async () => result.current.mutateAsync());

    expect(makeApiRequest).toHaveBeenCalledWith({
      url: '/api/auth/signout',
      method: 'POST',
    });
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(replace).toHaveBeenCalledWith('/signin');
  });

  it('keeps session data and offers retry when server sign-out fails', async () => {
    makeApiRequest.mockRejectedValue(new Error('Network unavailable'));
    const queryClient = new QueryClient();
    queryClient.setQueryData(['auth', 'me'], { user: { userId: 'user-1' } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useSignOut(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toThrow('Network unavailable');
    });

    expect(queryClient.getQueryData(['auth', 'me'])).toEqual({ user: { userId: 'user-1' } });
    expect(replace).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith('Could not sign out. Please try again.');
  });
});
