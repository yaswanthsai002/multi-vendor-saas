import type { QueryClient } from '@tanstack/react-query';

export type AuthSessionChange = 'signed-out' | 'session-changed';

let sourceId: string | undefined;

function getSourceId() {
  return (sourceId ??= crypto.randomUUID());
}

export function getRemoteAuthSessionChange(data: unknown): AuthSessionChange | null {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('type' in data) ||
    !('sourceId' in data) ||
    typeof data.type !== 'string' ||
    typeof data.sourceId !== 'string' ||
    data.sourceId === getSourceId()
  ) {
    return null;
  }

  return data.type === 'signed-out' || data.type === 'session-changed' ? data.type : null;
}

export function clearAuthSessionCache(queryClient: QueryClient, change: AuthSessionChange) {
  queryClient.clear();

  if (typeof BroadcastChannel === 'undefined') return;

  const channel = new BroadcastChannel('perigee-auth-session');
  channel.postMessage({ type: change, sourceId: getSourceId() });
  channel.close();
}
