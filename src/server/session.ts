import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { and, eq, gt, lt } from 'drizzle-orm';
import { getDb } from './db';
import { sessions, users } from './db/schema';
import { SESSION_COOKIE, SESSION_MAX_AGE, sessionCookie } from './sessionCookie';

// Rolling sessions: push the expiry out at most once a day to avoid a write
// on every request. The cookie is renewed by src/proxy.ts.
const RENEW_AFTER = 24 * 60 * 60 * 1000;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** Starts a session and returns its token; only its hash is stored. */
export async function createSession(userId: number) {
  const db = getDb();
  const token = randomBytes(32).toString('base64url');
  await db.insert(sessions).values({
    id: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_MAX_AGE),
  });
  // Opportunistic cleanup; logins are rare enough for this to be cheap.
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  return token;
}

export async function findSessionUser(token?: string) {
  if (!token) return null;
  const db = getDb();
  const id = hashToken(token);
  const [row] = await db
    .select({ user: users, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())))
    .limit(1);
  if (!row) return null;

  if (row.expiresAt.getTime() - Date.now() < SESSION_MAX_AGE - RENEW_AFTER) {
    await db.update(sessions)
      .set({ expiresAt: new Date(Date.now() + SESSION_MAX_AGE) })
      .where(eq(sessions.id, id));
  }
  return row.user;
}

/** The logged-in user of the current request, looked up once per render. */
export const currentUser = cache(async () => (
  findSessionUser((await cookies()).get(SESSION_COOKIE)?.value)
));

/** For pages and actions that need a logged-in user. */
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect('/login');
  return user;
}

/** Logs a user in. Only in route handlers and server actions, which may set cookies. */
export async function logIn(userId: number) {
  (await cookies()).set(sessionCookie(await createSession(userId)));
}

/** Ends the current session. Only in route handlers and server actions. */
export async function logOut() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await getDb().delete(sessions).where(eq(sessions.id, hashToken(token)));
  store.set(sessionCookie('', 0));
}
