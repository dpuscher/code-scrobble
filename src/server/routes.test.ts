import { testDb } from '@/test/db';
import { loggedInUser } from '@/test/auth';
import { mockFetch } from '@/test/fetch';
import { callRoute, sessionCookie } from '@/test/http';
import { users } from '@/server/db/schema';
import * as callback from '@/app/api/auth/lastfm/callback/route';
import * as login from '@/app/api/auth/lastfm/route';
import * as logout from '@/app/api/logout/route';
import * as session from '@/app/api/session/route';
import * as search from '@/app/api/search/[query]/route';
import * as versions from '@/app/api/masters/[id]/versions/route';

describe('authenticated route handlers', () => {
  it.each([
    ['session', session.GET], ['search', search.GET], ['versions', versions.GET],
  ])('%s rejects anonymous requests', async (_, handler) => {
    const res = await callRoute(handler, { params: { id: '1', query: 'x' } });
    expect(res).toMatchObject({ status: 401, body: { error: 'Unauthorized' } });
  });

  it('answers 500 without leaking details when a handler throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { cookies } = await loggedInUser();
    mockFetch({ '/database/search': () => { throw new Error('secret detail'); } });
    const res = await callRoute(search.GET, { params: { query: 'x' }, cookies });
    expect(res).toMatchObject({ status: 500, body: { error: 'Internal server error' } });
  });
});

describe('GET /api/session', () => {
  it('returns the public profile without the Last.fm session key', async () => {
    const { user, cookies } = await loggedInUser({ name: 'jane', image: 'img' });
    const res = await callRoute(session.GET, { cookies });
    expect(res.body).toEqual({
      id: user.id, name: 'jane', url: null, image: 'img', imageLarge: null, imageXLarge: null, searchFormat: null, partsPreference: null,
    });
  });
});

describe('GET /api/search/:query', () => {
  it('passes a known format on and ignores others', async () => {
    const { cookies } = await loggedInUser();
    const fetch = mockFetch({ '/database/search': () => ({ results: [] }) });

    await callRoute(search.GET, { url: '/api/search/abbey?format=Vinyl', params: { query: 'abbey road' }, cookies });
    await callRoute(search.GET, { url: '/api/search/abbey?format=Shellac', params: { query: 'abbey road' }, cookies });
    const sent = fetch.mock.calls.map(([url]) => new URL(String(url)).searchParams);
    expect(sent.map((params) => params.get('format'))).toEqual(['Vinyl', null]);
    expect(sent[0].get('q')).toBe('abbey road');
  });
});

describe('GET /api/masters/:id/versions', () => {
  it('returns the versions of a master', async () => {
    const { cookies } = await loggedInUser();
    mockFetch({ '/masters/7/versions': () => ({ pagination: { items: 1 }, versions: [{ id: 3, title: 'A' }] }) });

    const res = await callRoute(versions.GET, { url: '/api/masters/7/versions?format=CD', params: { id: '7' }, cookies });
    expect(res.body).toMatchObject({ total: 1, versions: [{ id: 3, title: 'A', collected: 0 }] });
  });

  it('rejects invalid ids', async () => {
    const { cookies } = await loggedInUser();
    const res = await callRoute(versions.GET, { params: { id: 'abc' }, cookies });
    expect(res.status).toBe(400);
  });
});

describe('Last.fm login', () => {
  it('redirects to Last.fm with the callback URL', async () => {
    vi.stubEnv('SERVER_URL', 'https://www.codescrobble.test/');
    const res = await callRoute(login.GET);
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

    const res = await callRoute(callback.GET, { url: '/auth/lastfm/callback?token=t' });

    expect(res).toMatchObject({ status: 302, redirect: 'https://www.codescrobble.test/' });
    expect(sessionCookie()).toMatchObject({ secure: true, httpOnly: true });
    const [jane] = await testDb().select().from(users);
    expect(jane).toMatchObject({ name: 'jane', sessionKey: 'sk', url: 'https://last.fm/user/jane' });
  });

  it('sends the user back to /login when Last.fm rejects the token', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch({ '/2.0/': () => ({ error: 4, message: 'Invalid token' }) });
    const res = await callRoute(callback.GET, { url: '/auth/lastfm/callback?token=bad' });
    expect(res).toMatchObject({ status: 302, redirect: 'http://localhost:3000/login' });
    expect(sessionCookie()).toBeUndefined();
  });

  it('ignores callbacks without a token', async () => {
    const res = await callRoute(callback.GET, { url: '/auth/lastfm/callback' });
    expect(res.redirect).toBe('http://localhost:3000/login');
  });

  it('logs out with a POST', async () => {
    const { cookies } = await loggedInUser();
    const res = await callRoute(logout.POST, { method: 'POST', cookies });
    expect(res).toMatchObject({ status: 303, redirect: 'http://localhost:3000/' });
    expect(sessionCookie()).toMatchObject({ value: '', maxAge: 0 });
    expect((await callRoute(session.GET, { cookies })).status).toBe(401);
  });

  it('does not log out on GET or cross-site requests', async () => {
    const { cookies } = await loggedInUser();
    expect(logout).not.toHaveProperty('GET');
    const res = await callRoute(logout.POST, {
      method: 'POST', cookies, headers: { origin: 'https://evil.test', host: 'www.codescrobble.test' },
    });
    expect(res.status).toBe(403);
    expect((await callRoute(session.GET, { cookies })).status).toBe(200);
  });
});
