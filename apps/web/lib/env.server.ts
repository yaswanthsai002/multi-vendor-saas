import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Load monorepo root .env once on the server if not already present
if (typeof process !== 'undefined' && typeof process.loadEnvFile === 'function') {
  try {
    const rootEnv = resolve(process.cwd(), '../../.env');
    if (existsSync(rootEnv)) {
      process.loadEnvFile(rootEnv);
    }
  } catch {
    // Ignored
  }
}

export const serverEnv = {
  JWT_SECRET: process.env.JWT_SECRET,
};
