import type { IncomingMessage, ServerResponse } from 'node:http';
import { testDb } from '@/test/db';
import { createUser } from '@/test/factories';
import { sessions } from './db/schema';
import { createSession, destroySession, getSessionUser } from './session';

const DAY = 24 * 60 * 60 * 1000;

function fakeResponse() {
  const cookies: string[] = [];
  const res = { appendHeader: (_: string, value: string) => { cookies.push(value); } };
  return { res: res as unknown as ServerResponse, cookies };
}

const requestWith = (cookie?: string) => ({
  headers: cookie ? { cookie: `other=1; ${cookie}` } : {},
}) as IncomingMessage;

async function login() {
  const user = await createUser();
  const { res, cookies } = fakeResponse();
  await createSession(res, user.id);
  const cookie = cookies[0].split(';')[0];
  return { user, cookie, header: cookies[0] };
}

describe('sessions', () => {
  it('sets an HttpOnly, SameSite cookie and stores only a token hash', async () => {
    const { cookie, header } = await login();
    expect(header).toMatch(/HttpOnly; SameSite=Lax; Max-Age=2592000/);
    expect(header).not.toMatch(/Secure/);

    const [row] = await testDb().select().from(sessions);
    expect(row.id).toMatch(/^[0-9a-f]{64}$/);
    expect(cookie).not.toContain(row.id);
  });

  it('resolves the user from the cookie', async () => {
    const { user, cookie } = await login();
    await expect(getSessionUser(requestWith(cookie))).resolves.toMatchObject({ id: user.id });
    await expect(getSessionUser(requestWith('sid=forged'))).resolves.toBeNull();
    await expect(getSessionUser(requestWith())).resolves.toBeNull();
  });

  it('prefers parsed cookies when Next.js provides them', async () => {
    const { user, cookie } = await login();
    const req = { headers: {}, cookies: { sid: cookie.slice(4) } } as unknown as IncomingMessage;
    await expect(getSessionUser(req)).resolves.toMatchObject({ id: user.id });
  });

  it('rejects expired sessions', async () => {
    const { cookie } = await login();
    await testDb().update(sessions).set({ expiresAt: new Date(Date.now() - 1000) });
    await expect(getSessionUser(requestWith(cookie))).resolves.toBeNull();
  });

  it('extends sessions that are older than a day', async () => {
    const { cookie } = await login();
    await testDb().update(sessions).set({ expiresAt: new Date(Date.now() + 10 * DAY) });

    const { res, cookies } = fakeResponse();
    await getSessionUser(requestWith(cookie), res);

    const [row] = await testDb().select().from(sessions);
    expect(row.expiresAt.getTime()).toBeGreaterThan(Date.now() + 29 * DAY);
    expect(cookies).toHaveLength(1);
  });

  it('does not touch fresh sessions', async () => {
    const { cookie } = await login();
    const { res, cookies } = fakeResponse();
    await getSessionUser(requestWith(cookie), res);
    expect(cookies).toHaveLength(0);
  });

  it('destroys the session and clears the cookie', async () => {
    const { cookie } = await login();
    const { res, cookies } = fakeResponse();
    await destroySession(requestWith(cookie), res);
    expect(cookies[0]).toMatch(/^sid=; .*Max-Age=0/);
    await expect(getSessionUser(requestWith(cookie))).resolves.toBeNull();
  });

  it('removes expired sessions on login', async () => {
    await login();
    await testDb().update(sessions).set({ expiresAt: new Date(Date.now() - 1000) });
    await login();
    expect(await testDb().select().from(sessions)).toHaveLength(1);
  });
});
