import { withDb } from './support/db';

// Start every run from an empty database. The app has already applied its
// migrations at startup; on a brand-new database the tables may not exist yet.
export default async function globalSetup() {
  await withDb(async (sql) => {
    await sql`
      truncate users, releases, barcode_lookups, search_cache, auto_scrobbles,
        scrobbles, sessions restart identity cascade
    `.catch(() => {});
  });
}
