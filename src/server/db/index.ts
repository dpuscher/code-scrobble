import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export const dbOptions = { schema, casing: 'snake_case' } as const;

// Survives Next.js dev-server module reloads so we don't leak connection pools.
const globalForDb = globalThis as unknown as { db?: Database };

export function getDb(): Database {
  if (!globalForDb.db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    globalForDb.db = drizzle(postgres(url, { max: 10 }), dbOptions);
  }
  return globalForDb.db;
}

// Lets tests run against an in-process PGlite database.
export function setDb(db: Database | undefined) {
  globalForDb.db = db;
}
