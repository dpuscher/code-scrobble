import { testDb } from '@/test/db';
import { createUser } from '@/test/factories';
import { setCookies, startRequest } from '@/test/next';
import { sessions } from './db/schema';
import {
  createSession, currentUser, findSessionUser, logIn, logOut, requireUser,
} from './session';

const DAY = 24 * 60 * 60 * 1000;

describe('sessions', () => {
  it('sets an HttpOnly, SameSite cookie and stores only a token hash', async () => {
    const user = await createUser();
    await logIn(user.id);
    expect(setCookies).toEqual([expect.objectContaining({
      name: 'sid', httpOnly: true, sameSite: 'lax', path: '/', maxAge: 2592000, secure: false,
    })]);

    const [row] = await testDb().select().from(sessions);
    expect(row.id).toMatch(/^[0-9a-f]{64}$/);
    expect(setCookies[0].value).not.toContain(row.id);
  });

  it('sets Secure cookies when served over HTTPS', async () => {
    vi.stubEnv('SERVER_URL', 'https://www.codescrobble.test');
    await logIn((await createUser()).id);
    expect(setCookies[0]).toMatchObject({ secure: true });
  });

  it('resolves the user from the token', async () => {
    const user = await createUser();
    const token = await createSession(user.id);
    await expect(findSessionUser(token)).resolves.toMatchObject({ id: user.id });
    await expect(findSessionUser('forged')).resolves.toBeNull();
    await expect(findSessionUser(undefined)).resolves.toBeNull();
  });

  it('resolves the user of the current request from its cookie', async () => {
    const user = await createUser();
    startRequest({ sid: await createSession(user.id) });
    await expect(currentUser()).resolves.toMatchObject({ id: user.id });
    await expect(requireUser()).resolves.toMatchObject({ id: user.id });
  });

  it('sends anonymous visitors of pages to the login', async () => {
    startRequest();
    await expect(requireUser()).rejects.toThrow('NEXT_REDIRECT');
  });

  it('rejects expired sessions', async () => {
    const token = await createSession((await createUser()).id);
    await testDb().update(sessions).set({ expiresAt: new Date(Date.now() - 1000) });
    await expect(findSessionUser(token)).resolves.toBeNull();
  });

  it('extends sessions that are older than a day', async () => {
    const token = await createSession((await createUser()).id);
    await testDb().update(sessions).set({ expiresAt: new Date(Date.now() + 10 * DAY) });
    await findSessionUser(token);
    const [row] = await testDb().select().from(sessions);
    expect(row.expiresAt.getTime()).toBeGreaterThan(Date.now() + 29 * DAY);
  });

  it('does not touch fresh sessions', async () => {
    const token = await createSession((await createUser()).id);
    const [before] = await testDb().select().from(sessions);
    await findSessionUser(token);
    const [after] = await testDb().select().from(sessions);
    expect(after.expiresAt).toEqual(before.expiresAt);
  });

  it('logs out: deletes the session and clears the cookie', async () => {
    const token = await createSession((await createUser()).id);
    startRequest({ sid: token });
    await logOut();
    expect(setCookies).toEqual([expect.objectContaining({ name: 'sid', value: '', maxAge: 0 })]);
    await expect(findSessionUser(token)).resolves.toBeNull();
  });

  it('removes expired sessions on login', async () => {
    const user = await createUser();
    await createSession(user.id);
    await testDb().update(sessions).set({ expiresAt: new Date(Date.now() - 1000) });
    await createSession(user.id);
    expect(await testDb().select().from(sessions)).toHaveLength(1);
  });
});
