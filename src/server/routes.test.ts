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
import versions from '@/pages/api/masters/[id]/versions';
import autoscrobbles from '@/pages/api/user/autoscrobbles';
import history from '@/pages/api/user/history';
import settings from '@/pages/api/user/settings';

describe('authenticated API routes', () => {
  it.each([
    ['session', session], ['barcode', barcode], ['search', search], ['versions', versions],
    ['history', history], ['autoscrobbles', autoscrobbles], ['settings', settings],
  ])('%s rejects anonymous requests', async (_, handler) => {
    const res = await callApi(handler, { method: handler === settings ? 'POST' : 'GET', query: { id: '1', query: 'x' } });
    expect(res).toMatchObject({ status: 401, body: { error: 'Unauthorized' } });
  });

  it('rejects cross-site writes', async () => {
    const { cookies } = await loggedInUser();
    const release = await createRelease();
    const res = await callApi(scrobble, {
      method: 'POST', body: { id: release.id }, cookies, headers: { origin: 'https://evil.test', host: 'www.codescrobble.test' },
    });
    expect(res.status).toBe(403);
    expect(await testDb().select().from(scrobbles)).toHaveLength(0);

    const sameSite = await callApi(scrobble, {
      method: 'POST', body: { id: release.id }, cookies, headers: { origin: 'https://codescrobble.test', host: 'codescrobble.test' },
    });
    expect(sameSite.status).toBe(200);
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
      id: user.id, name: 'jane', url: null, image: 'img', imageLarge: null, imageXLarge: null, searchFormat: null,
    });
  });
});

describe('GET /api/search/:query', () => {
  it('passes a known format on and ignores others', async () => {
    const { cookies } = await loggedInUser();
    const fetch = mockFetch({ '/database/search': () => ({ results: [] }) });

    await callApi(search, { query: { query: 'abbey road', format: 'Vinyl' }, cookies });
    await callApi(search, { query: { query: 'abbey road', format: 'Shellac' }, cookies });
    const formats = fetch.mock.calls.map(([url]) => new URL(String(url)).searchParams.get('format'));
    expect(formats).toEqual(['Vinyl', null]);
  });
});

describe('GET /api/masters/:id/versions', () => {
  it('returns the versions of a master', async () => {
    const { cookies } = await loggedInUser();
    mockFetch({ '/masters/7/versions': () => ({ pagination: { items: 1 }, versions: [{ id: 3, title: 'A' }] }) });

    const res = await callApi(versions, { query: { id: '7', format: 'CD' }, cookies });
    expect(res.body).toMatchObject({ total: 1, versions: [{ id: 3, title: 'A', collected: 0 }] });
  });

  it('rejects invalid ids', async () => {
    const { cookies } = await loggedInUser();
    const res = await callApi(versions, { query: { id: 'abc' }, cookies });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/user/settings', () => {
  const post = (cookies: Record<string, string>, body: unknown) => callApi(settings, {
    method: 'POST', body, cookies, headers: { origin: 'https://codescrobble.test', host: 'codescrobble.test' },
  });
  const storedFormat = async (id: number) => (await testDb().query.users.findFirst({ where: eq(users.id, id) }))?.searchFormat;

  it('saves and clears the search format', async () => {
    const { user, cookies } = await loggedInUser();

    expect((await post(cookies, { searchFormat: 'Vinyl' })).status).toBe(204);
    expect(await storedFormat(user.id)).toBe('Vinyl');
    expect((await callApi(session, { cookies })).body).toMatchObject({ searchFormat: 'Vinyl' });

    await post(cookies, { searchFormat: null });
    expect(await storedFormat(user.id)).toBeNull();
  });

  it('rejects unknown formats', async () => {
    const { user, cookies } = await loggedInUser();
    expect((await post(cookies, { searchFormat: 'Shellac' })).status).toBe(400);
    expect(await storedFormat(user.id)).toBeNull();
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
    expect(await testDb().select().from(scrobbles)).toHaveLength(1);
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
      id: release.id, artist: 'Artist', title: release.title, year: '1999', image: release.image,
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

  it('logs out with a POST', async () => {
    const { cookies } = await loggedInUser();
    const res = await callApi(logout, { method: 'POST', cookies });
    expect(res).toMatchObject({ status: 303, redirect: '/' });
    const after = await callApi(session, { cookies });
    expect(after.status).toBe(401);
  });

  it('does not log out on GET or cross-site requests', async () => {
    const { cookies } = await loggedInUser();
    expect((await callApi(logout, { cookies })).status).toBe(405);
    expect((await callApi(logout, { method: 'POST', cookies, headers: { origin: 'https://evil.test', host: 'www.codescrobble.test' } })).status).toBe(405);
    expect((await callApi(session, { cookies })).status).toBe(200);
  });
});

describe('POST /api/scrobble failures', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('answers 502 when Last.fm fails, without recording the scrobble', async () => {
    const { cookies } = await loggedInUser();
    const release = await createRelease();
    mockFetch({ '/2.0/': () => ({ error: 16, message: 'Temporarily unavailable' }) });
    const res = await callApi(scrobble, { method: 'POST', body: { id: release.id, autoScrobble: true }, cookies });
    expect(res).toMatchObject({ status: 502, body: { error: 'Last.fm request failed', sent: 0 } });
    expect(await testDb().select().from(scrobbles)).toHaveLength(0);
    expect(await testDb().select().from(autoScrobbles)).toHaveLength(0);
  });

  it('answers 502 on network errors too', async () => {
    const { cookies } = await loggedInUser();
    const release = await createRelease();
    mockFetch({ '/2.0/': () => { throw new TypeError('fetch failed'); } });
    const res = await callApi(scrobble, { method: 'POST', body: { id: release.id }, cookies });
    expect(res.status).toBe(502);
  });

  it('continues after the tracks an earlier attempt sent', async () => {
    const { user, cookies } = await loggedInUser();
    const release = await createRelease({
      tracks: Array.from({ length: 60 }, (_, i) => ({ title: `T${i}`, trackNumber: i + 1, duration: 10 })),
    });
    let calls = 0;
    const bodies: URLSearchParams[] = [];
    mockFetch({
      '/2.0/': (_url, init) => {
        calls += 1;
        bodies.push(new URLSearchParams(String(init?.body)));
        return calls === 2 ? { error: 16, message: 'Unavailable' } : { scrobbles: { '@attr': { accepted: 50 } } };
      },
    });

    const failed = await callApi(scrobble, { method: 'POST', body: { id: release.id }, cookies });
    expect(failed).toMatchObject({ status: 502, body: { sent: 50 } });
    const retry = await callApi(scrobble, { method: 'POST', body: { id: release.id, from: 50 }, cookies });

    expect(retry.status).toBe(200);
    expect(bodies[2].get('track[0]')).toBe('T50');
    expect(bodies[2].get('trackNumber[0]')).toBe('51');
    expect(await testDb().select().from(scrobbles).where(eq(scrobbles.userId, user.id))).toHaveLength(1);
  });

  it('does not record a release Last.fm ignored completely', async () => {
    const { cookies } = await loggedInUser();
    const release = await createRelease();
    mockFetch({
      '/2.0/': () => ({ scrobbles: { '@attr': { accepted: 0, ignored: 1 }, scrobble: { ignoredMessage: { code: '5' } } } }),
    });
    const res = await callApi(scrobble, { method: 'POST', body: { id: release.id }, cookies });
    expect(res.body).toEqual({ accepted: 0, ignored: 1, ignoredCode: 5 });
    expect(await testDb().select().from(scrobbles)).toHaveLength(0);
  });

  it('logs the user out when Last.fm rejects the session key', async () => {
    const { cookies } = await loggedInUser();
    const release = await createRelease();
    mockFetch({ '/2.0/': () => ({ error: 9, message: 'Invalid session key' }) });
    const res = await callApi(scrobble, { method: 'POST', body: { id: release.id }, cookies });
    expect(res.status).toBe(401);
    expect((await callApi(session, { cookies })).status).toBe(401);
  });
});
