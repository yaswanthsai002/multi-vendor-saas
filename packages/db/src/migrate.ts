import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const client = postgres(connectionString);

try {
  await migrate(drizzle({ client }), {
    migrationsFolder: resolve(dirname(fileURLToPath(import.meta.url)), '../drizzle'),
  });
} finally {
  await client.end();
}
