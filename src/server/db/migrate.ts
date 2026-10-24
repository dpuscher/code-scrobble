import path from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { dbOptions } from '.';

// Arbitrary constant shared by every app instance.
const STARTUP_LOCK_ID = 7_340_118;

export const migrationsFolder = path.join(process.cwd(), 'drizzle');

/**
 * Applies pending migrations. A dedicated connection holds a Postgres
 * advisory lock, so two containers starting at once (e.g. during a rolling
 * update) never run this concurrently.
 */
export async function runStartupTasks(url: string) {
  const client = postgres(url, { max: 1, onnotice: () => {} });
  try {
    await client`select pg_advisory_lock(${STARTUP_LOCK_ID})`;
    const db = drizzle(client, dbOptions);
    await migrate(db, { migrationsFolder });
  } finally {
    await client`select pg_advisory_unlock(${STARTUP_LOCK_ID})`.catch(() => {});
    await client.end();
  }
}
