import { Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';

/**
 * Shared Redis client instance.
 * Connects to live Redis if REDIS_URL is configured in environment.
 * Otherwise, falls back to in-memory ioredis-mock for single-instance POC, local development, and tests.
 */
export const redis: Redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    })
  : (new RedisMock() as unknown as Redis);
