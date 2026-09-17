import { jwtVerify, type JWTPayload } from 'jose';

import { serverEnv } from '@/lib/env.server';

// Used ONLY for routing decisions — never treat this as
// authorization. The API re-verifies on every request; this just avoids
// sending obviously-invalid/expired tokens on a round trip for role checks,
// and lets us redirect unauthenticated users without hitting the network.
export async function verifyAuthToken(token: string): Promise<JWTPayload | null> {
  const secret = serverEnv.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not configured in apps/web');
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS512'],
      issuer: 'perigee-api',
      audience: 'perigee-web-app',
    });
    return payload;
  } catch {
    return null; // expired, tampered, malformed — all treated as unauthenticated
  }
}
