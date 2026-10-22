import { and, eq, gt } from 'drizzle-orm';
import { getDb } from './db';
import { barcodeLookups, releases, searchCache, type Release } from './db/schema';
import * as Discogs from './discogs';

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

// Refreshes cached release data once a week. A failing Discogs request falls
// back to the stale copy rather than failing the scan.
async function refreshIfStale(release: Release) {
  if (Date.now() - release.fetchedAt.getTime() < RELEASE_MAX_AGE) return release;
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

export async function search(rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];
  const db = getDb();

  const cached = await db.query.searchCache.findFirst({
    where: and(eq(searchCache.query, query), gt(searchCache.expiresAt, new Date())),
  });
  if (cached) return cached.results;

  const results = await Discogs.searchReleases(query);
  const value = { query, results, expiresAt: new Date(Date.now() + SEARCH_TTL) };
  await db.insert(searchCache).values(value)
    .onConflictDoUpdate({ target: searchCache.query, set: value });
  return results;
}

export const toReleaseJSON = (release: Release) => ({
  id: release.id,
  artist: release.artist,
  title: release.title,
  image: release.image,
  url: release.url,
  year: release.year,
  tracks: release.tracks,
});
