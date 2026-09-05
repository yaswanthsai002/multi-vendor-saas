import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema/index.js';

type Database = ReturnType<typeof createDb>;

let db: Database | undefined;

function createDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const client = postgres(connectionString);

  return drizzle({
    client,
    schema,
  });
}

export function getDb(): Database {
  if (!db) {
    db = createDb();
  }

  return db;
}
