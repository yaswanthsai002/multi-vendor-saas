import { getDb } from '@repo/db';
import { sql } from 'drizzle-orm';

import { redis } from '../../shared/redis/redis.client.js';

const HEALTH_CHECK_TIMEOUT_MS = 2_000;

type CheckStatus = 'ok' | 'failed';

interface HealthCheck {
  status: CheckStatus;
  latencyMs: number;
}

export interface ReadinessStatus {
  status: 'ok' | 'unavailable';
  checks: {
    database: HealthCheck;
    redis: HealthCheck;
  };
  timestamp: string;
  uptime: number;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Health check timed out'));
      }, timeoutMs);

      timer.unref();
    }),
  ]);
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = performance.now();
  const db = getDb();

  try {
    await withTimeout(db.execute(sql`SELECT 1`), HEALTH_CHECK_TIMEOUT_MS);

    return {
      status: 'ok',
      latencyMs: Math.round(performance.now() - start),
    };
  } catch {
    return {
      status: 'failed',
      latencyMs: Math.round(performance.now() - start),
    };
  }
}

async function checkRedis(): Promise<HealthCheck> {
  const start = performance.now();

  try {
    await withTimeout(redis.ping(), HEALTH_CHECK_TIMEOUT_MS);

    return {
      status: 'ok',
      latencyMs: Math.round(performance.now() - start),
    };
  } catch {
    return {
      status: 'failed',
      latencyMs: Math.round(performance.now() - start),
    };
  }
}

export async function getReadinessStatus(): Promise<ReadinessStatus> {
  const [database, redis] = await Promise.all([checkDatabase(), checkRedis()]);

  const healthy = database.status === 'ok' && redis.status === 'ok';

  return {
    status: healthy ? 'ok' : 'unavailable',
    checks: {
      database,
      redis,
    },
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
  };
}
