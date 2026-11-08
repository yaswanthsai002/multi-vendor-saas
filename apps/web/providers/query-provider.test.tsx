import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { QueryProvider } from './query-provider';

const messages: unknown[] = [];

class MockBroadcastChannel {
  constructor(readonly name: string) {}
  postMessage = (message: unknown) => messages.push(message);
  close = vi.fn();
}

describe('QueryProvider OAuth session callback', () => {
  afterEach(() => {
    cleanup();
    messages.length = 0;
    vi.unstubAllGlobals();
    window.history.replaceState(window.history.state, '', '/');
  });

  it('broadcasts successful OAuth session change and removes marker from URL', async () => {
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
    window.history.replaceState(
      window.history.state,
      '',
      '/account?tab=profile&auth_session_changed=1#details',
    );

    render(
      <QueryProvider>
        <div />
      </QueryProvider>,
    );

    await waitFor(() => expect(window.location.search).toBe('?tab=profile'));
    expect(window.location.hash).toBe('#details');
    expect(messages).toContainEqual(
      expect.objectContaining({ type: 'session-changed', sourceId: expect.any(String) }),
    );
  });

  it('does not broadcast when landing without an OAuth session marker', () => {
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);

    render(
      <QueryProvider>
        <div />
      </QueryProvider>,
    );

    expect(messages).not.toContainEqual(expect.objectContaining({ type: 'session-changed' }));
  });
});
