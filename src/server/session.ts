import { createHash, randomBytes } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { and, eq, gt, lt } from 'drizzle-orm';
import { config } from './config';
import { getDb } from './db';
import { sessions, users } from './db/schema';

const COOKIE_NAME = 'sid';
const MAX_AGE = 30 * 24 * 60 * 60 * 1000;
// Rolling sessions: push the expiry out at most once a day to avoid a write
// on every request.
const RENEW_AFTER = 24 * 60 * 60 * 1000;

type Request = IncomingMessage & { cookies?: Partial<Record<string, string>> };

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

function setCookie(res: ServerResponse, value: string, maxAgeMs: number) {
  const parts = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];
  if (config.secureCookies) parts.push('Secure');
  res.appendHeader('Set-Cookie', parts.join('; '));
}

function readToken(req: Request) {
  if (req.cookies) return req.cookies[COOKIE_NAME];
  const match = req.headers.cookie?.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return match?.[1];
}

export async function createSession(res: ServerResponse, userId: number) {
  const db = getDb();
  const token = randomBytes(32).toString('base64url');
  await db.insert(sessions).values({
    id: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + MAX_AGE),
  });
  // Opportunistic cleanup; logins are rare enough for this to be cheap.
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  setCookie(res, token, MAX_AGE);
}

export async function getSessionUser(req: Request, res?: ServerResponse) {
  const token = readToken(req);
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

  if (res && row.expiresAt.getTime() - Date.now() < MAX_AGE - RENEW_AFTER) {
    await db.update(sessions)
      .set({ expiresAt: new Date(Date.now() + MAX_AGE) })
      .where(eq(sessions.id, id));
    setCookie(res, token, MAX_AGE);
  }
  return row.user;
}

export async function destroySession(req: Request, res: ServerResponse) {
  const token = readToken(req);
  if (token) await getDb().delete(sessions).where(eq(sessions.id, hashToken(token)));
  setCookie(res, '', 0);
}
