import { QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearAuthSessionCache, getRemoteAuthSessionChange } from './session-cache';

describe('clearAuthSessionCache', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('clears cached session data and notifies other tabs', () => {
    const postMessage = vi.fn();
    const close = vi.fn();
    class MockBroadcastChannel {
      postMessage = postMessage;
      close = close;
    }
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
    const queryClient = new QueryClient();
    queryClient.setQueryData(['vendor', 'profile'], { name: 'Previous vendor' });

    clearAuthSessionCache(queryClient, 'signed-out');

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(postMessage).toHaveBeenCalledWith({
      type: 'signed-out',
      sourceId: expect.any(String),
    });
    expect(close).toHaveBeenCalledOnce();
  });

  it('ignores this tab message and accepts valid changes from another tab', () => {
    const postMessage = vi.fn();
    class MockBroadcastChannel {
      postMessage = postMessage;
      close = vi.fn();
    }
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
    clearAuthSessionCache(new QueryClient(), 'session-changed');

    expect(getRemoteAuthSessionChange(postMessage.mock.calls[0]?.[0])).toBeNull();
    expect(getRemoteAuthSessionChange({ type: 'signed-out', sourceId: 'another-tab' })).toBe(
      'signed-out',
    );
    expect(getRemoteAuthSessionChange({ type: 'unexpected', sourceId: 'another-tab' })).toBeNull();
    expect(getRemoteAuthSessionChange(null)).toBeNull();
  });
});
