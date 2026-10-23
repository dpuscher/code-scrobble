import { createHash } from 'node:crypto';
import { config } from './config';
import type { Release } from './db/schema';
import { cleanArtistName } from './discogs';

type Params = Record<string, string | number>;

export class LastFmError extends Error {
  constructor(public code: number, message: string) {
    super(`Last.fm error ${code}: ${message}`);
  }
}

// https://www.last.fm/api/authspec#_8-signing-calls
export function signParams(params: Params, secret: string) {
  const payload = Object.keys(params)
    .filter((key) => key !== 'format' && key !== 'callback')
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join('');
  return createHash('md5').update(payload + secret, 'utf8').digest('hex');
}

async function call<T>(method: string, params: Params, { signed = false, post = false } = {}) {
  const all: Params = { ...params, method, api_key: config.lastfm.key };
  if (signed) all.api_sig = signParams(all, config.lastfm.secret);
  all.format = 'json';

  const body = new URLSearchParams(Object.entries(all).map(([k, v]) => [k, String(v)]));
  const url = post ? config.lastfm.apiUrl : `${config.lastfm.apiUrl}?${body}`;
  const response = await fetch(url, {
    method: post ? 'POST' : 'GET',
    body: post ? body : undefined,
    headers: { 'User-Agent': 'CodeScrobble (+https://www.codescrobble.com)' },
    signal: AbortSignal.timeout(15_000),
  });

  const data = await response.json().catch(() => null) as (T & { error?: number; message?: string }) | null;
  if (!data) throw new LastFmError(response.status, response.statusText);
  if (data.error) throw new LastFmError(data.error, data.message ?? 'Unknown error');
  return data as T;
}

export function getAuthUrl(callbackUrl: string) {
  const url = new URL(config.lastfm.authUrl);
  url.searchParams.set('api_key', config.lastfm.key);
  url.searchParams.set('cb', callbackUrl);
  return url.toString();
}

export async function getSession(token: string) {
  const { session } = await call<{ session: { name: string; key: string } }>(
    'auth.getSession', { token }, { signed: true },
  );
  return session;
}

type LastFmImage = { size: string; '#text': string };

export async function getUserInfo(user: string) {
  const { user: info } = await call<{ user: { url: string; image?: LastFmImage[] } }>(
    'user.getInfo', { user },
  );
  const image = (index: number) => info.image?.[index]?.['#text'] || null;
  return {
    url: info.url,
    image: image(1),
    imageLarge: image(2),
    imageXLarge: image(3),
  };
}

export type Scrobble = {
  artist: string;
  /** Only when the track's artist differs from the release's, e.g. on compilations. */
  albumArtist?: string;
  album: string;
  track: string;
  trackNumber: number;
  timestamp: number;
};

// Last.fm's name for compilations; Discogs calls them "Various".
const toAlbumArtist = (artist: string) => (artist === 'Various' ? 'Various Artists' : cleanArtistName(artist));

/** One scrobble per track, starting now and spaced by the track durations. */
export function buildScrobbles(release: Pick<Release, 'artist' | 'title' | 'tracks'>, now = Date.now()): Scrobble[] {
  let timestamp = Math.floor(now / 1000);
  return release.tracks.map((track) => {
    const scrobble = {
      // Releases cached before names were cleaned may still carry the number.
      artist: track.artist ?? cleanArtistName(release.artist),
      albumArtist: track.artist ? toAlbumArtist(release.artist) : undefined,
      album: release.title,
      track: track.title,
      trackNumber: track.trackNumber,
      timestamp,
    };
    timestamp += track.duration;
    return scrobble;
  });
}

/** What Last.fm did with the scrobbles of one request or a whole release. */
export type ScrobbleResult = {
  accepted: number;
  ignored: number;
  /** Why the first ignored track was ignored (Last.fm's ignoredMessage code). */
  ignoredCode?: number;
};

type ScrobbleResponse = {
  scrobbles?: {
    '@attr'?: { accepted?: number | string; ignored?: number | string };
    // A single scrobble comes back as an object rather than an array.
    scrobble?: ScrobbleEcho | ScrobbleEcho[];
  };
};
type ScrobbleEcho = { ignoredMessage?: { code?: number | string } };

export function readScrobbleResponse(response: ScrobbleResponse): ScrobbleResult {
  const attr = response.scrobbles?.['@attr'];
  const echoes = ([] as ScrobbleEcho[]).concat(response.scrobbles?.scrobble ?? []);
  const ignoredCode = echoes.map((echo) => Number(echo.ignoredMessage?.code)).find((code) => code > 0);
  return {
    accepted: Number(attr?.accepted ?? 0),
    ignored: Number(attr?.ignored ?? 0),
    ...(ignoredCode ? { ignoredCode } : {}),
  };
}

/** Thrown when a batch fails; `sent` tracks were scrobbled before it. */
export class ScrobbleError extends Error {
  constructor(public sent: number, public cause: unknown) {
    super(`Scrobbling failed after ${sent} tracks`);
  }
}

// track.scrobble accepts at most 50 tracks per request.
const BATCH_SIZE = 50;

export async function scrobbleTracks(sessionKey: string, scrobbles: Scrobble[]): Promise<ScrobbleResult> {
  const result: ScrobbleResult = { accepted: 0, ignored: 0 };
  for (let offset = 0; offset < scrobbles.length; offset += BATCH_SIZE) {
    const params: Params = { sk: sessionKey };
    scrobbles.slice(offset, offset + BATCH_SIZE).forEach((scrobble, i) => {
      Object.entries(scrobble).forEach(([key, value]) => {
        if (value !== undefined) params[`${key}[${i}]`] = value;
      });
    });
    let batch: ScrobbleResult;
    try {
      batch = readScrobbleResponse(await call<ScrobbleResponse>('track.scrobble', params, { signed: true, post: true }));
    } catch (error) {
      throw new ScrobbleError(offset, error);
    }
    result.accepted += batch.accepted;
    result.ignored += batch.ignored;
    result.ignoredCode ??= batch.ignoredCode;
  }
  return result;
}
