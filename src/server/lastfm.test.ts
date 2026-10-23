import { mockFetch } from '@/test/fetch';
import {
  buildScrobbles, getAuthUrl, getSession, getUserInfo, LastFmError, scrobbleTracks, signParams,
} from './lastfm';

describe('signParams', () => {
  it('signs sorted params, ignoring format and callback', () => {
    // md5("api_keyAmethodBtokenC" + "secret")
    expect(signParams({
      token: 'C', method: 'B', api_key: 'A', format: 'json', callback: 'x',
    }, 'secret')).toBe('8d1dd22f8bae8ea5317d27346a4c4962');
  });
});

describe('getAuthUrl', () => {
  it('points to the Last.fm auth page with api key and callback', () => {
    const url = new URL(getAuthUrl('https://app.test/auth/lastfm/callback'));
    expect(url.origin + url.pathname).toBe('https://www.last.fm/api/auth/');
    expect(url.searchParams.get('api_key')).toBe('test-key');
    expect(url.searchParams.get('cb')).toBe('https://app.test/auth/lastfm/callback');
  });
});

describe('getSession', () => {
  it('exchanges a token with a signed request', async () => {
    const fetch = mockFetch({ '/2.0/': () => ({ session: { name: 'jane', key: 'sk' } }) });
    await expect(getSession('tok')).resolves.toEqual({ name: 'jane', key: 'sk' });

    const params = new URL(String(fetch.mock.calls[0][0])).searchParams;
    expect(params.get('method')).toBe('auth.getSession');
    expect(params.get('format')).toBe('json');
    expect(params.get('api_sig')).toBe(signParams({
      token: 'tok', method: 'auth.getSession', api_key: 'test-key',
    }, 'test-secret'));
  });

  it('throws Last.fm API errors', async () => {
    mockFetch({ '/2.0/': () => ({ error: 4, message: 'Invalid authentication token' }) });
    const error = await getSession('bad').catch((e) => e);
    expect(error).toBeInstanceOf(LastFmError);
    expect(error.code).toBe(4);
  });
});

describe('getUserInfo', () => {
  it('extracts profile url and avatar sizes', async () => {
    mockFetch({
      '/2.0/': () => ({
        user: {
          url: 'https://last.fm/user/jane',
          image: [
            { size: 'small', '#text': 's' }, { size: 'medium', '#text': 'm' },
            { size: 'large', '#text': 'l' }, { size: 'extralarge', '#text': '' },
          ],
        },
      }),
    });
    await expect(getUserInfo('jane')).resolves.toEqual({
      url: 'https://last.fm/user/jane', image: 'm', imageLarge: 'l', imageXLarge: null,
    });
  });
});

describe('buildScrobbles', () => {
  it('scrobbles compilation tracks by their own artist', () => {
    const [own, shared] = buildScrobbles({
      artist: 'Various',
      title: 'Hits',
      tracks: [
        {
          title: 'One', trackNumber: 1, duration: 100, artist: 'Eminem',
        },
        { title: 'Two', trackNumber: 2, duration: 100 },
      ],
    });
    expect(own).toMatchObject({ artist: 'Eminem', albumArtist: 'Various Artists', album: 'Hits' });
    expect(shared).toMatchObject({ artist: 'Various', albumArtist: undefined });
  });

  it('scrobbles artists without the Discogs number', () => {
    const [scrobble] = buildScrobbles({
      artist: 'Nirvana (2), Simon (3) & Garfunkel (2)',
      title: 'Album',
      tracks: [{ title: 'One', trackNumber: 1, duration: 100 }],
    });
    expect(scrobble.artist).toBe('Nirvana, Simon & Garfunkel');
  });

  it('starts now and spaces the tracks by their durations', () => {
    const scrobbles = buildScrobbles({
      artist: 'A',
      title: 'Album',
      tracks: [
        { title: 'One', trackNumber: 1, duration: 100 },
        { title: 'Two', trackNumber: 2, duration: 50 },
        { title: 'Three', trackNumber: 3, duration: 0 },
      ],
    }, 1_000_000_000);
    expect(scrobbles.map((s) => [s.track, s.timestamp])).toEqual([
      ['One', 1_000_000], ['Two', 1_000_100], ['Three', 1_000_150],
    ]);
    expect(scrobbles[0]).toEqual({
      artist: 'A', album: 'Album', track: 'One', trackNumber: 1, timestamp: 1_000_000,
    });
  });
});

describe('scrobbleTracks', () => {
  it('posts signed batches of at most 50 tracks', async () => {
    const bodies: URLSearchParams[] = [];
    mockFetch({
      '/2.0/': (_url, init) => {
        bodies.push(new URLSearchParams(String(init?.body)));
        return { scrobbles: {} };
      },
    });
    const scrobbles = Array.from({ length: 51 }, (_, i) => ({
      artist: 'A', albumArtist: undefined, album: 'B', track: `T${i}`, trackNumber: i + 1, timestamp: i,
    }));

    await scrobbleTracks('sk', scrobbles);

    expect(bodies).toHaveLength(2);
    expect(bodies[0].get('track[49]')).toBe('T49');
    expect(bodies[0].has('track[50]')).toBe(false);
    expect(bodies[0].has('albumArtist[0]')).toBe(false);
    expect(bodies[1].get('track[0]')).toBe('T50');
    expect(bodies[1].get('sk')).toBe('sk');
    expect(bodies[1].get('method')).toBe('track.scrobble');
    expect(bodies[1].get('api_sig')).toMatch(/^[0-9a-f]{32}$/);
  });
});
