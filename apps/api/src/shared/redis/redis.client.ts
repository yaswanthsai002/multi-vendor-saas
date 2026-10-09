import '../config/env.js';
import { Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';

/**
 * Shared Redis client instance.
 * Connects to live Redis if REDIS_URL is configured in environment.
 * Otherwise, falls back to in-memory ioredis-mock for single-instance POC, local development, and tests.
 */
const shouldUseMock =
  process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST) || !process.env.REDIS_URL;

export const redis: Redis = shouldUseMock
  ? (new RedisMock() as unknown as Redis)
  : new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    });
