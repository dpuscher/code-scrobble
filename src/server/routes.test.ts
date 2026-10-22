import { eq } from 'drizzle-orm';
import { autoScrobbles, scrobbles, users } from '@/server/db/schema';
import { loggedInUser } from '@/test/auth';
import { testDb } from '@/test/db';
import { createRelease } from '@/test/factories';
import { discogsRelease, mockFetch } from '@/test/fetch';
import { callApi, sessionCookie } from '@/test/http';
import barcode from '@/pages/api/barcode/[id]';
import callback from '@/pages/api/auth/lastfm/callback';
import login from '@/pages/api/auth/lastfm';
import logout from '@/pages/api/logout';
import scrobble from '@/pages/api/scrobble';
import search from '@/pages/api/search/[query]';
import session from '@/pages/api/session';
import autoscrobbles from '@/pages/api/user/autoscrobbles';
import history from '@/pages/api/user/history';

describe('authenticated API routes', () => {
  it.each([
    ['session', session], ['barcode', barcode], ['search', search], ['history', history], ['autoscrobbles', autoscrobbles],
  ])('%s rejects anonymous requests', async (_, handler) => {
    const res = await callApi(handler, { query: { id: '1', query: 'x' } });
    expect(res).toMatchObject({ status: 401, body: { error: 'Unauthorized' } });
  });

  it('rejects unsupported methods', async () => {
    const { cookies } = await loggedInUser();
    const res = await callApi(session, { method: 'DELETE', cookies });
    expect(res.status).toBe(405);
    expect(res.headers.allow).toBe('GET');
  });

  it('answers 500 without leaking details when a handler throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { cookies } = await loggedInUser();
    mockFetch({ '/database/search': () => { throw new Error('secret detail'); } });
    const res = await callApi(search, { query: { query: 'x' }, cookies });
    expect(res).toMatchObject({ status: 500, body: { error: 'Internal server error' } });
  });
});

describe('GET /api/session', () => {
  it('returns the public profile without the Last.fm session key', async () => {
    const { user, cookies } = await loggedInUser({ name: 'jane', image: 'img' });
    const res = await callApi(session, { cookies });
    expect(res.body).toEqual({
      id: user.id, name: 'jane', url: null, image: 'img', imageLarge: null, imageXLarge: null,
    });
  });
});

describe('GET /api/barcode/:id', () => {
  it('resolves barcodes and flags auto-scrobbles', async () => {
    const { user, cookies } = await loggedInUser();
    const release = await createRelease({ barcode: '4006381333931' });
    await testDb().insert(autoScrobbles).values({ userId: user.id, releaseId: release.id });

    const res = await callApi(barcode, { query: { id: '4006381333931' }, cookies });
    expect(res.body).toMatchObject({ instantScrobble: true, id: release.id, title: release.title });
    expect(res.body).not.toHaveProperty('barcode');
  });

  it('resolves Discogs ids passed as id:<n>', async () => {
    const { cookies } = await loggedInUser();
    mockFetch({ '/releases/42': () => discogsRelease(42) });
    const res = await callApi(barcode, { query: { id: 'id:42' }, cookies });
    expect(res.body).toMatchObject({ id: 42, instantScrobble: false });
  });

  it.each(['id:abc', 'id:-1', 'nodigits'])('answers {} for %s', async (id) => {
    const { cookies } = await loggedInUser();
    mockFetch({});
    const res = await callApi(barcode, { query: { id }, cookies });
    expect(res).toMatchObject({ status: 200, body: {} });
  });
});

describe('POST /api/scrobble', () => {
  it('scrobbles to Last.fm in production and records history and auto-scrobble', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { user, cookies } = await loggedInUser({ sessionKey: 'user-sk' });
    const release = await createRelease({
      tracks: [{ title: 'A', trackNumber: 1, duration: 10 }, { title: 'B', trackNumber: 2, duration: 10 }],
    });
    let body = new URLSearchParams();
    mockFetch({
      '/2.0/': (_url, init) => {
        body = new URLSearchParams(String(init?.body));
        return { scrobbles: { '@attr': { accepted: 2 } } };
      },
    });

    const res = await callApi(scrobble, { method: 'POST', body: { id: release.id, autoScrobble: true }, cookies });

    expect(res.status).toBe(200);
    expect(body.get('sk')).toBe('user-sk');
    expect(body.get('track[1]')).toBe('B');
    expect(await testDb().select().from(scrobbles).where(eq(scrobbles.userId, user.id))).toHaveLength(1);
    expect(await testDb().select().from(autoScrobbles)).toHaveLength(1);
  });

  it('does not call Last.fm outside production', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const fetch = mockFetch({});
    const { cookies } = await loggedInUser();
    const release = await createRelease();
    const res = await callApi(scrobble, { method: 'POST', body: { id: release.id }, cookies });
    expect(res).toMatchObject({ status: 200, body: {} });
    expect(fetch).not.toHaveBeenCalled();
    expect(await testDb().select().from(autoScrobbles)).toHaveLength(0);
  });

  it('rejects unknown releases', async () => {
    const { cookies } = await loggedInUser();
    const res = await callApi(scrobble, { method: 'POST', body: { id: 'nope' }, cookies });
    expect(res.status).toBe(400);
  });
});

describe('/api/user/autoscrobbles', () => {
  it('lists and deletes the current user\'s auto-scrobbles', async () => {
    const { user, cookies } = await loggedInUser();
    const release = await createRelease({ year: '1999' });
    await testDb().insert(autoScrobbles).values({ userId: user.id, releaseId: release.id });

    const list = await callApi(autoscrobbles, { cookies });
    expect(list.body).toEqual([{
      id: release.id, artist: 'Artist', title: release.title, year: '1999',
    }]);

    const del = await callApi(autoscrobbles, { method: 'DELETE', body: { id: release.id }, cookies });
    expect(del.status).toBe(204);
    expect(await testDb().select().from(autoScrobbles)).toHaveLength(0);
  });
});

describe('GET /api/user/history', () => {
  it('returns the history with links back to the release', async () => {
    const { user, cookies } = await loggedInUser();
    const release = await createRelease({ barcode: '123' });
    await testDb().insert(scrobbles).values({ userId: user.id, releaseId: release.id });

    const res = await callApi(history, { cookies });
    expect(res.body).toMatchObject([{ discogsId: release.id, barcode: '123', title: release.title }]);
  });
});

describe('Last.fm login', () => {
  it('redirects to Last.fm with the callback URL', async () => {
    vi.stubEnv('SERVER_URL', 'https://www.codescrobble.test/');
    const res = await callApi(login);
    const url = new URL(res.redirect!);
    expect(url.searchParams.get('cb')).toBe('https://www.codescrobble.test/auth/lastfm/callback');
  });

  it('creates the user and a session from the callback token', async () => {
    vi.stubEnv('SERVER_URL', 'https://www.codescrobble.test');
    mockFetch({
      '/2.0/': (url) => (url.searchParams.get('method') === 'auth.getSession'
        ? { session: { name: 'jane', key: 'sk' } }
        : { user: { url: 'https://last.fm/user/jane', image: [] } }),
    });

    const res = await callApi(callback, { query: { token: 't' } });

    expect(res).toMatchObject({ status: 302, redirect: '/' });
    expect(sessionCookie(res.headers)).toBeTruthy();
    expect(([] as string[]).concat(res.headers['set-cookie'] ?? [])[0]).toMatch(/Secure/);
    const [jane] = await testDb().select().from(users);
    expect(jane).toMatchObject({ name: 'jane', sessionKey: 'sk', url: 'https://last.fm/user/jane' });
  });

  it('sends the user back to /login when Last.fm rejects the token', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch({ '/2.0/': () => ({ error: 4, message: 'Invalid token' }) });
    const res = await callApi(callback, { query: { token: 'bad' } });
    expect(res).toMatchObject({ status: 302, redirect: '/login' });
    expect(sessionCookie(res.headers)).toBeUndefined();
  });

  it('ignores callbacks without a token', async () => {
    const res = await callApi(callback);
    expect(res.redirect).toBe('/login');
  });

  it('logs out', async () => {
    const { cookies } = await loggedInUser();
    const res = await callApi(logout, { cookies });
    expect(res.redirect).toBe('/');
    const after = await callApi(session, { cookies });
    expect(after.status).toBe(401);
  });
});
