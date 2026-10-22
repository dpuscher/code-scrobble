import { config } from './config';
import type { SearchResult, Track } from './db/schema';

export type DiscogsTrack = { position: string; type_: string; title: string; duration: string };

type DiscogsRelease = {
  id: number;
  title: string;
  uri: string;
  year?: number;
  artists?: { name: string }[];
  images?: { uri: string }[];
  tracklist?: DiscogsTrack[];
  identifiers?: { type: string; value: string }[];
};

type DiscogsSearchResult = SearchResult & {
  year?: string;
  community?: { have?: number; want?: number };
};

async function request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${config.discogs.apiUrl}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'CodeScrobble/2.0 +https://www.codescrobble.com',
      Authorization: `Discogs key=${config.discogs.key}, secret=${config.discogs.secret}`,
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Discogs ${path} responded with ${response.status}`);
  return response.json() as Promise<T>;
}

// "1:02:03" -> 3723 seconds. Missing or malformed parts count as 0.
export function convertTimecode(timecode = '') {
  return timecode
    .split(':')
    .map((n) => parseInt(n, 10) || 0)
    .reverse()
    .reduce((total, n, i) => total + n * (60 ** i), 0);
}

export function normalizeTracklist(tracks: DiscogsTrack[] = []) {
  const vinylPositionRegex = /^[A-Z]-?[0-9]+$/;
  let tracklist = tracks
    .filter((track) => track.type_ === 'track')
    .filter((track) => !/video/i.test(track.position));

  // Remove bonus CDs from vinyl releases.
  if (tracklist.length && vinylPositionRegex.test(tracklist[0].position)) {
    tracklist = tracklist.filter((track) => vinylPositionRegex.test(track.position));
  }

  return tracklist;
}

export async function getRelease(id: number) {
  const data = await request<DiscogsRelease>(`/releases/${id}`);
  const tracks: Track[] = normalizeTracklist(data.tracklist).map((track, index) => ({
    title: track.title,
    trackNumber: index + 1,
    duration: convertTimecode(track.duration),
  }));
  return {
    id,
    artist: (data.artists ?? []).map((a) => a.name).join(', '),
    title: data.title,
    image: data.images?.[0]?.uri ?? null,
    url: data.uri,
    year: data.year ? String(data.year) : null,
    tracks,
    barcode: data.identifiers?.find((i) => i.type === 'Barcode')?.value ?? null,
  };
}

/** Returns the most collected release for a barcode, or null. */
export async function findReleaseIdByBarcode(barcode: string) {
  const { results = [] } = await request<{ results?: DiscogsSearchResult[] }>(
    '/database/search', { barcode, type: 'release' },
  );
  const [best] = results.toSorted((a, b) => (
    (b.community?.have ?? 0) - (a.community?.have ?? 0)
    || (b.community?.want ?? 0) - (a.community?.want ?? 0)
  ));
  return best?.id ?? null;
}

export async function searchReleases(query: string): Promise<SearchResult[]> {
  const { results = [] } = await request<{ results?: DiscogsSearchResult[] }>(
    '/database/search', { q: query, type: 'release' },
  );
  return results.map(({
    id, title, thumb, country, year, format, uri,
  }) => ({
    id, title, thumb, country, year, format, uri,
  }));
}
