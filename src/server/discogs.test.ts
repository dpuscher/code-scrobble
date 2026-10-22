import { discogsRelease, mockFetch } from '@/test/fetch';
import {
  convertTimecode, findReleaseIdByBarcode, getRelease, normalizeTracklist, searchReleases,
} from './discogs';

const track = (position: string, type_ = 'track') => ({
  position, type_, title: position, duration: '',
});

describe('convertTimecode', () => {
  it.each([
    ['3:30', 210],
    ['1:02:03', 3723],
    ['45', 45],
    ['', 0],
    ['x:10', 10],
    [undefined, 0],
  ])('converts %s to %i seconds', (input, expected) => {
    expect(convertTimecode(input)).toBe(expected);
  });
});

describe('normalizeTracklist', () => {
  it('drops headings, index tracks and video tracks', () => {
    const result = normalizeTracklist([
      track('1'), track('', 'heading'), track('2', 'index'), track('Video 1'), track('3'),
    ]);
    expect(result.map((t) => t.position)).toEqual(['1', '3']);
  });

  it('removes bonus CD tracks from vinyl releases', () => {
    const result = normalizeTracklist([track('A1'), track('B-2'), track('CD1'), track('1')]);
    expect(result.map((t) => t.position)).toEqual(['A1', 'B-2']);
  });

  it('keeps all tracks of non-vinyl releases', () => {
    expect(normalizeTracklist([track('1'), track('A1')])).toHaveLength(2);
  });
});

describe('getRelease', () => {
  it('maps a Discogs release and authenticates the request', async () => {
    const fetch = mockFetch({ '/releases/42': () => discogsRelease(42) });

    await expect(getRelease(42)).resolves.toEqual({
      id: 42,
      artist: 'Artist A, Artist B',
      title: 'Album 42',
      image: 'https://i.discogs.test/42.jpg',
      url: 'https://www.discogs.com/release/42',
      year: '2001',
      barcode: '4 006381 333931',
      tracks: [
        { title: 'One', trackNumber: 1, duration: 180 },
        { title: 'Two', trackNumber: 2, duration: 3723 },
      ],
    });
    const headers = fetch.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Discogs key=discogs-key, secret=discogs-secret');
    expect(headers['User-Agent']).toMatch(/CodeScrobble/);
  });

  it('handles releases without images, year or identifiers', async () => {
    mockFetch({
      '/releases/7': () => discogsRelease(7, { images: undefined, year: 0, identifiers: undefined }),
    });
    const release = await getRelease(7);
    expect(release).toMatchObject({ image: null, year: null, barcode: null });
  });

  it('throws on HTTP errors', async () => {
    mockFetch({ '/releases/1': () => new Response('{}', { status: 404 }) });
    await expect(getRelease(1)).rejects.toThrow('404');
  });
});

describe('findReleaseIdByBarcode', () => {
  it('picks the most collected, then most wanted release', async () => {
    const fetch = mockFetch({
      '/database/search': () => ({
        results: [
          { id: 1, community: { have: 5, want: 100 } },
          { id: 2, community: { have: 50, want: 1 } },
          { id: 3, community: { have: 50, want: 2 } },
        ],
      }),
    });
    await expect(findReleaseIdByBarcode('123')).resolves.toBe(3);
    const url = new URL(String(fetch.mock.calls[0][0]));
    expect(Object.fromEntries(url.searchParams)).toEqual({ barcode: '123', type: 'release' });
  });

  it('returns null without results', async () => {
    mockFetch({ '/database/search': () => ({ results: [] }) });
    await expect(findReleaseIdByBarcode('123')).resolves.toBeNull();
  });
});

describe('searchReleases', () => {
  it('returns only the fields the client needs', async () => {
    mockFetch({
      '/database/search': () => ({
        results: [{
          id: 1, title: 'T', thumb: 'th', country: 'DE', year: '1999', format: ['CD'], uri: '/r/1', community: {}, extra: 1,
        }],
      }),
    });
    await expect(searchReleases('x')).resolves.toEqual([{
      id: 1, title: 'T', thumb: 'th', country: 'DE', year: '1999', format: ['CD'], uri: '/r/1',
    }]);
  });
});
