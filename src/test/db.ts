import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { type Database, dbOptions, setDb } from '@/server/db';
import { migrationsFolder } from '@/server/db/migrate';

let client: PGlite | undefined;
let db: Database | undefined;

/** Fresh, migrated in-memory Postgres for the current test file. */
export async function resetTestDb() {
  if (!db) {
    client = new PGlite();
    db = drizzle(client, dbOptions) as unknown as Database;
    await migrate(db as never, { migrationsFolder });
  } else {
    await db.execute(sql`
      truncate users, releases, barcode_lookups, search_cache, auto_scrobbles,
        scrobbles, sessions, app_meta restart identity cascade
    `);
  }
  setDb(db);
  return db;
}

export function testDb() {
  if (!db) throw new Error('resetTestDb() has not run');
  return db;
}

export async function closeTestDb() {
  setDb(undefined);
  await client?.close();
  client = undefined;
  db = undefined;
}
