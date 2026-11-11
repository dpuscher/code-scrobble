import { and, eq, gt } from 'drizzle-orm';
import { getDb } from './db';
import type { SearchFormat } from '../lib/formats';
import { toSelection } from '../lib/parts';
import type { Release as ReleaseJSON } from '../lib/types';
import {
  barcodeLookups, releases, searchCache, versionsCache, type Release,
} from './db/schema';
import * as Discogs from './discogs';
import { findAutoScrobble } from './users';

const DAY = 24 * 60 * 60 * 1000;
const RELEASE_MAX_AGE = 7 * DAY;
const BARCODE_MISS_TTL = DAY;
const SEARCH_TTL = DAY;

export const normalizeBarcode = (barcode: string) => barcode.replace(/\D/g, '');

async function fetchAndStore(id: number, scannedBarcode?: string) {
  const data = await Discogs.getRelease(id);
  const row = {
    ...data,
    barcode: (data.barcode && normalizeBarcode(data.barcode)) || scannedBarcode || null,
    fetchedAt: new Date(),
  };
  const [release] = await getDb()
    .insert(releases)
    .values(row)
    .onConflictDoUpdate({ target: releases.id, set: row })
    .returning();
  return release;
}

// Refreshes cached release data once a week, and releases fetched before
// they had parts. A failing Discogs request falls back to the stale copy
// rather than failing the scan.
async function refreshIfStale(release: Release) {
  if (release.parts && Date.now() - release.fetchedAt.getTime() < RELEASE_MAX_AGE) return release;
  try {
    return await fetchAndStore(release.id);
  } catch (error) {
    console.warn(`Could not refresh release ${release.id}`, error);
    return release;
  }
}

export async function findByDiscogsId(id: number) {
  const existing = await getDb().query.releases.findFirst({ where: eq(releases.id, id) });
  if (existing) return refreshIfStale(existing);
  try {
    return await fetchAndStore(id);
  } catch {
    return null;
  }
}

export async function findByBarcode(rawBarcode: string) {
  const barcode = normalizeBarcode(rawBarcode);
  if (!barcode) return null;
  const db = getDb();

  const lookup = await db.query.barcodeLookups.findFirst({ where: eq(barcodeLookups.barcode, barcode) });
  if (lookup?.releaseId) return findByDiscogsId(lookup.releaseId);
  if (lookup && Date.now() - lookup.checkedAt.getTime() < BARCODE_MISS_TTL) return null;

  const known = await db.query.releases.findFirst({ where: eq(releases.barcode, barcode) });
  if (known) return refreshIfStale(known);

  const id = await Discogs.findReleaseIdByBarcode(barcode);
  const release = id ? await fetchAndStore(id, barcode) : null;

  const value = { barcode, releaseId: release?.id ?? null, checkedAt: new Date() };
  await db.insert(barcodeLookups).values(value)
    .onConflictDoUpdate({ target: barcodeLookups.barcode, set: value });

  return release;
}

/** A release by scanned barcode or `id:<discogs release id>`, null if there is none. */
export async function findRelease(code: string) {
  if (!code.startsWith('id:')) return findByBarcode(code);
  const id = Number(code.slice(3));
  return Number.isInteger(id) && id > 0 ? findByDiscogsId(id) : null;
}

export async function search(rawQuery: string, format: SearchFormat | null = null) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];
  const db = getDb();
  const key = `${format ?? ''}|${query}`;

  const cached = await db.query.searchCache.findFirst({
    where: and(eq(searchCache.query, key), gt(searchCache.expiresAt, new Date())),
  });
  if (cached) return cached.results;

  const results = await Discogs.searchReleases(query, format ?? undefined);
  const value = { query: key, results, expiresAt: new Date(Date.now() + SEARCH_TTL) };
  await db.insert(searchCache).values(value)
    .onConflictDoUpdate({ target: searchCache.query, set: value });
  return results;
}

/** Versions of a Discogs master release, cached like searches. */
export async function findVersions(masterId: number, format: SearchFormat | null = null) {
  const db = getDb();
  const key = { masterId, format: format ?? '' };

  const cached = await db.query.versionsCache.findFirst({
    where: and(
      eq(versionsCache.masterId, masterId),
      eq(versionsCache.format, key.format),
      gt(versionsCache.expiresAt, new Date()),
    ),
  });
  if (cached) return cached.data;

  const data = await Discogs.getMasterVersions(masterId, format ?? undefined);
  const value = { ...key, data, expiresAt: new Date(Date.now() + SEARCH_TTL) };
  await db.insert(versionsCache).values(value)
    .onConflictDoUpdate({ target: [versionsCache.masterId, versionsCache.format], set: value });
  return data;
}

export const toReleaseJSON = (release: Release) => ({
  id: release.id,
  artist: release.artist,
  title: release.title,
  image: release.image,
  url: release.url,
  year: release.year,
  tracks: release.tracks,
  parts: release.parts ?? [],
});

/**
 * The release for a scanned barcode (or `id:<discogs id>`) as the release
 * page shows it, with the parts the user saved for auto-scrobbling. Null when
 * there is none, also when Discogs fails.
 */
export async function findReleaseFor(code: string, userId: number): Promise<ReleaseJSON | null> {
  let release;
  try {
    release = await findRelease(code);
  } catch (error) {
    console.error(`Looking up ${code} failed`, error);
    return null;
  }
  if (!release) return null;
  const json = toReleaseJSON(release);
  const autoScrobble = await findAutoScrobble(userId, release.id);
  // Saved parts the release no longer has are dropped; none left means the default.
  const instantParts = toSelection(json.parts, autoScrobble?.parts);
  return {
    ...json,
    instantScrobble: Boolean(autoScrobble),
    instantParts: instantParts?.length ? instantParts : null,
  };
}
