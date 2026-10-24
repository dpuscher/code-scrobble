import { config } from './config';
import {
  groupTracks, type DiscogsArtist, type DiscogsFormat, type DiscogsTrack,
} from './tracklist';
import type {
  MasterVersions, SearchResult, Track, Version,
} from './db/schema';

type DiscogsRelease = {
  id: number;
  title: string;
  uri: string;
  year?: number;
  // `join` connects an artist to the next one: ",", "&", "Feat.", "/", ...
  artists?: DiscogsArtist[];
  images?: { uri: string }[];
  tracklist?: DiscogsTrack[];
  formats?: DiscogsFormat[];
  identifiers?: { type: string; value: string }[];
};

type DiscogsSearchResult = {
  id: number;
  title: string;
  master_id?: number | null;
  thumb?: string;
  country?: string;
  year?: string;
  format?: string[];
  community?: { have?: number; want?: number };
};

type DiscogsVersion = {
  id: number;
  title: string;
  thumb?: string;
  major_formats?: string[];
  format?: string;
  label?: string;
  catno?: string;
  country?: string;
  released?: string;
  stats?: { community?: { in_collection?: number } };
};

// Most collected first, then most wanted.
const byPopularity = (a: DiscogsSearchResult, b: DiscogsSearchResult) => (
  (b.community?.have ?? 0) - (a.community?.have ?? 0)
  || (b.community?.want ?? 0) - (a.community?.want ?? 0)
);

const unique = (values: (string | undefined)[]) => [...new Set(values.filter((v): v is string => Boolean(v)))];

// Discogs years are "1993", or "0" when unknown; `released` may be a full date.
const toYear = (value?: string) => /^[1-9]\d{3}/.exec(value ?? '')?.[0];

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

/**
 * Drops the number Discogs adds to artists sharing a name ("Nirvana (2)"),
 * also inside joined names ("Simon (3) & Garfunkel (2)"). Last.fm knows them
 * without it.
 */
export const cleanArtistName = (name: string) => name.replace(/ \(\d+\)(?=,| [&/]|$)/g, '');

/**
 * Joins a release's artists the way Discogs shows them: "Eminem Feat. Nate
 * Dogg", "Simon & Garfunkel", "Linkin Park, Artsonic". Uses the artists'
 * canonical names, not the spelling on the cover, since that is what Last.fm knows.
 */
export function joinArtists(artists: DiscogsArtist[] = []) {
  return artists.map(({ name, join }, i) => {
    if (i === artists.length - 1) return cleanArtistName(name);
    const word = join?.trim() || ',';
    return `${cleanArtistName(name)}${word.startsWith(',') ? '' : ' '}${word} `;
  }).join('');
}

export async function getRelease(id: number) {
  const data = await request<DiscogsRelease>(`/releases/${id}`);
  const artist = joinArtists(data.artists);
  const { tracks: grouped, parts } = groupTracks(data.tracklist, data.formats);
  const tracks: Track[] = grouped.map((track, index) => {
    const trackArtist = track.artists?.length ? joinArtists(track.artists) : artist;
    return {
      title: track.title,
      trackNumber: index + 1,
      duration: track.duration,
      ...(trackArtist !== artist ? { artist: trackArtist } : {}),
      ...(track.part ? { part: track.part } : {}),
    };
  });
  return {
    id,
    artist,
    title: data.title,
    image: data.images?.[0]?.uri ?? null,
    url: data.uri,
    year: data.year ? String(data.year) : null,
    tracks,
    parts,
    barcode: data.identifiers?.find((i) => i.type === 'Barcode')?.value ?? null,
  };
}

/** Returns the most collected release for a barcode, or null. */
export async function findReleaseIdByBarcode(barcode: string) {
  const { results = [] } = await request<{ results?: DiscogsSearchResult[] }>(
    '/database/search', { barcode, type: 'release' },
  );
  const [best] = results.toSorted(byPopularity);
  return best?.id ?? null;
}

/** Splits a search hit's "Artist - Title". */
export function splitTitle(title: string) {
  const separator = title.indexOf(' - ');
  if (separator < 0) return { artist: '', title };
  return {
    artist: cleanArtistName(title.slice(0, separator)),
    title: title.slice(separator + 3),
  };
}

/** Searches releases and groups versions of the same album by their master. */
export async function searchReleases(query: string, format?: string): Promise<SearchResult[]> {
  const params: Record<string, string> = { q: query, type: 'release', per_page: '100' };
  if (format) params.format = format;
  const { results = [] } = await request<{ results?: DiscogsSearchResult[] }>('/database/search', params);

  // Maps keep insertion order, so albums stay in Discogs' relevance order.
  const groups = new Map<string, DiscogsSearchResult[]>();
  for (const result of results) {
    const key = result.master_id ? `master:${result.master_id}` : `release:${result.id}`;
    const group = groups.get(key);
    if (group) group.push(result);
    else groups.set(key, [result]);
  }

  return [...groups.values()].map((group) => {
    const sorted = group.toSorted(byPopularity);
    const [best] = sorted;
    const masterId = best.master_id || null;
    return {
      id: best.id,
      masterId,
      ...splitTitle(best.title),
      thumb: best.thumb || undefined,
      year: unique(group.map((r) => toYear(r.year))).sort()[0],
      country: masterId ? undefined : best.country || undefined,
      // A release with two LPs lists "Vinyl, LP" twice.
      format: masterId ? unique(sorted.map((r) => r.format?.[0])) : unique(best.format ?? []),
    };
  });
}

const toVersion = (version: DiscogsVersion): Version => ({
  id: version.id,
  title: version.title,
  thumb: version.thumb || undefined,
  formats: version.major_formats ?? [],
  format: version.format || undefined,
  year: toYear(version.released),
  country: version.country || undefined,
  label: version.label || undefined,
  // Discogs writes "none" for releases without a catalog number.
  catno: version.catno && !/^none$/i.test(version.catno) ? version.catno : undefined,
  collected: version.stats?.community?.in_collection ?? 0,
});

/** The first 100 versions of a master release, most collected first. */
export async function getMasterVersions(masterId: number, format?: string): Promise<MasterVersions> {
  const params: Record<string, string> = { per_page: '100' };
  if (format) params.format = format;
  const { versions = [], pagination } = await request<{
    versions?: DiscogsVersion[];
    pagination?: { items?: number };
  }>(`/masters/${masterId}/versions`, params);
  return {
    versions: versions.map(toVersion).toSorted((a, b) => b.collected - a.collected),
    total: pagination?.items ?? versions.length,
  };
}
