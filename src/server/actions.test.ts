import { eq } from 'drizzle-orm';
import { removeAutoScrobble, saveSearchFormat, scrobble } from '@/app/actions';
import { loggedInUser } from '@/test/auth';
import { testDb } from '@/test/db';
import { createRelease } from '@/test/factories';
import { mockFetch } from '@/test/fetch';
import { sessionCookie } from '@/test/http';
import { startRequest } from '@/test/next';
import { autoScrobbles, scrobbles, users } from './db/schema';
import { findSessionUser } from './session';
import { listAutoScrobbles } from './users';

/** Records the tracks sent to Last.fm, answering each batch with `answer`. */
function lastfm(answer: (batch: URLSearchParams) => unknown = () => ({ scrobbles: { '@attr': { accepted: 1 } } })) {
  const batches: URLSearchParams[] = [];
  mockFetch({
    '/2.0/': (_url, init) => {
      const body = new URLSearchParams(String(init?.body));
      batches.push(body);
      return answer(body);
    },
  });
  const tracks = () => batches.flatMap((body) => {
    const sent: string[] = [];
    for (let i = 0; body.has(`track[${i}]`); i += 1) sent.push(body.get(`track[${i}]`)!);
    return sent;
  });
  return { batches, tracks };
}

const history = () => testDb().select().from(scrobbles);

describe('scrobble', () => {
  it('scrobbles to Last.fm in production and records history and auto-scrobble', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { user } = await loggedInUser({ sessionKey: 'user-sk' });
    const release = await createRelease({
      tracks: [{ title: 'A', trackNumber: 1, duration: 10 }, { title: 'B', trackNumber: 2, duration: 10 }],
    });
    const { batches } = lastfm(() => ({ scrobbles: { '@attr': { accepted: 2 } } }));

    await expect(scrobble({ id: release.id, autoScrobble: true }))
      .resolves.toEqual({ status: 'scrobbled', accepted: 2, ignored: 0 });

    expect(batches[0].get('sk')).toBe('user-sk');
    expect(batches[0].get('track[1]')).toBe('B');
    expect(await testDb().select().from(scrobbles).where(eq(scrobbles.userId, user.id))).toHaveLength(1);
    expect(await testDb().select().from(autoScrobbles)).toHaveLength(1);
  });

  it('does not call Last.fm outside production', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const fetch = mockFetch({});
    await loggedInUser();
    const release = await createRelease();
    await expect(scrobble({ id: release.id })).resolves.toEqual({ status: 'scrobbled', accepted: 0, ignored: 0 });
    expect(fetch).not.toHaveBeenCalled();
    expect(await history()).toHaveLength(1);
    expect(await testDb().select().from(autoScrobbles)).toHaveLength(0);
  });

  it('asks anonymous visitors to log in', async () => {
    const release = await createRelease();
    startRequest();
    await expect(scrobble({ id: release.id })).resolves.toEqual({ status: 'login' });
    expect(await history()).toHaveLength(0);
  });

  it('rejects unknown releases', async () => {
    await loggedInUser();
    await expect(scrobble({ id: Number.NaN })).resolves.toMatchObject({ status: 'invalid' });
  });

  describe('with sides', () => {
    const parts = ['A', 'B', 'CD'].map((id) => ({
      id, name: id, kind: id === 'CD' ? 'disc' as const : 'side' as const, item: id === 'CD' ? 'CD' : '~1', medium: 'record', ...(id === 'CD' ? { bonus: true } : {}),
    }));
    const tracks = ['A', 'B', 'CD'].map((part, i) => ({
      title: `${part} track`, trackNumber: i + 1, duration: 10, part,
    }));

    it('scrobbles all but the bonus parts by default', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      await loggedInUser();
      const release = await createRelease({ tracks, parts });
      const sent = lastfm();
      await scrobble({ id: release.id });
      expect(sent.tracks()).toEqual(['A track', 'B track']);
    });

    it('scrobbles the picked parts and remembers them for auto-scrobbling', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const { user } = await loggedInUser();
      const release = await createRelease({ tracks, parts });
      const sent = lastfm();

      await expect(scrobble({ id: release.id, parts: ['CD', 'B'], autoScrobble: true }))
        .resolves.toMatchObject({ status: 'scrobbled' });

      expect(sent.tracks()).toEqual(['B track', 'CD track']);
      expect((await testDb().select().from(autoScrobbles))[0].parts).toEqual(['B', 'CD']);
      expect(await listAutoScrobbles(user.id)).toMatchObject([{ id: release.id, scope: 'Side B + CD' }]);
      expect(await history()).toHaveLength(1);
    });

    it('remembers how much was picked on the release page', async () => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
      const { user } = await loggedInUser();
      const release = await createRelease({ tracks, parts });
      const preference = async () => (await testDb().select().from(users).where(eq(users.id, user.id)))[0].partsPreference;

      await scrobble({ id: release.id, parts: ['A'] });
      expect(await preference()).toBeNull();
      await scrobble({ id: release.id, parts: ['A'], remember: true });
      expect(await preference()).toEqual({ sides: 'first-part' });
      // Side B alone says nothing about how much someone scrobbles.
      await scrobble({ id: release.id, parts: ['B'], remember: true });
      expect(await preference()).toEqual({ sides: 'first-part' });
      await scrobble({ id: release.id, remember: true });
      expect(await preference()).toEqual({ sides: 'all' });
    });

    it('rejects a selection without tracks', async () => {
      await loggedInUser();
      const release = await createRelease({ tracks, parts });
      await expect(scrobble({ id: release.id, parts: ['X'] }))
        .resolves.toEqual({ status: 'invalid', error: 'No tracks selected' });
      expect(await history()).toHaveLength(0);
    });
  });

  describe('failures', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('fails when Last.fm does, without recording the scrobble', async () => {
      await loggedInUser();
      const release = await createRelease();
      mockFetch({ '/2.0/': () => ({ error: 16, message: 'Temporarily unavailable' }) });
      await expect(scrobble({ id: release.id, autoScrobble: true })).resolves.toEqual({ status: 'failed', sent: 0 });
      expect(await history()).toHaveLength(0);
      expect(await testDb().select().from(autoScrobbles)).toHaveLength(0);
    });

    it('fails on network errors too', async () => {
      await loggedInUser();
      const release = await createRelease();
      mockFetch({ '/2.0/': () => { throw new TypeError('fetch failed'); } });
      await expect(scrobble({ id: release.id })).resolves.toMatchObject({ status: 'failed' });
    });

    it('continues after the tracks an earlier attempt sent', async () => {
      const { user } = await loggedInUser();
      const release = await createRelease({
        tracks: Array.from({ length: 60 }, (_, i) => ({ title: `T${i}`, trackNumber: i + 1, duration: 10 })),
      });
      let calls = 0;
      const { batches } = lastfm(() => {
        calls += 1;
        return calls === 2 ? { error: 16, message: 'Unavailable' } : { scrobbles: { '@attr': { accepted: 50 } } };
      });

      await expect(scrobble({ id: release.id })).resolves.toEqual({ status: 'failed', sent: 50 });
      await expect(scrobble({ id: release.id, from: 50 })).resolves.toMatchObject({ status: 'scrobbled' });

      expect(batches[2].get('track[0]')).toBe('T50');
      expect(batches[2].get('trackNumber[0]')).toBe('51');
      expect(await testDb().select().from(scrobbles).where(eq(scrobbles.userId, user.id))).toHaveLength(1);
    });

    it('does not record a release Last.fm ignored completely', async () => {
      await loggedInUser();
      const release = await createRelease();
      mockFetch({
        '/2.0/': () => ({ scrobbles: { '@attr': { accepted: 0, ignored: 1 }, scrobble: { ignoredMessage: { code: '5' } } } }),
      });
      await expect(scrobble({ id: release.id }))
        .resolves.toEqual({ status: 'scrobbled', accepted: 0, ignored: 1, ignoredCode: 5 });
      expect(await history()).toHaveLength(0);
    });

    it('logs the user out when Last.fm rejects the session key', async () => {
      const { cookies } = await loggedInUser();
      const release = await createRelease();
      mockFetch({ '/2.0/': () => ({ error: 9, message: 'Invalid session key' }) });
      await expect(scrobble({ id: release.id })).resolves.toEqual({ status: 'login' });
      expect(sessionCookie()).toMatchObject({ maxAge: 0 });
      await expect(findSessionUser(cookies.sid)).resolves.toBeNull();
    });
  });
});

describe('saveSearchFormat', () => {
  const storedFormat = async (id: number) => (await testDb().query.users.findFirst({ where: eq(users.id, id) }))?.searchFormat;

  it('saves and clears the search format', async () => {
    const { user } = await loggedInUser();
    await saveSearchFormat('Vinyl');
    expect(await storedFormat(user.id)).toBe('Vinyl');
    await saveSearchFormat(null);
    expect(await storedFormat(user.id)).toBeNull();
  });

  it('ignores unknown formats', async () => {
    const { user } = await loggedInUser();
    await saveSearchFormat('Shellac' as never);
    expect(await storedFormat(user.id)).toBeNull();
  });
});

describe('removeAutoScrobble', () => {
  it('removes only the current user\'s auto-scrobble', async () => {
    const release = await createRelease();
    const { user: other } = await loggedInUser();
    await testDb().insert(autoScrobbles).values({ userId: other.id, releaseId: release.id });
    const { user } = await loggedInUser();
    await testDb().insert(autoScrobbles).values({ userId: user.id, releaseId: release.id });

    await removeAutoScrobble(release.id);
    expect(await testDb().select().from(autoScrobbles)).toEqual([expect.objectContaining({ userId: other.id })]);
  });
});
