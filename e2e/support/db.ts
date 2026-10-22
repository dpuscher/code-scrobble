import postgres from 'postgres';

export const E2E_DATABASE_URL = process.env.E2E_DATABASE_URL
  ?? 'postgres://codescrobble:codescrobble@localhost:5432/codescrobble_e2e';

/** Runs SQL against the app's database (outside the app). */
export async function withDb<T>(fn: (sql: postgres.Sql) => Promise<T>) {
  const sql = postgres(E2E_DATABASE_URL, { max: 1, onnotice: () => {} });
  try {
    return await fn(sql);
  } finally {
    await sql.end();
  }
}

/** Clears per-test user data but keeps the logged-in user and releases. */
export const resetUserData = () => withDb((sql) => sql`
  truncate scrobbles, auto_scrobbles restart identity
`);
