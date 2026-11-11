import {
  and, asc, desc, eq, notInArray, sql,
} from 'drizzle-orm';
import type { SearchFormat } from '../lib/formats';
import {
  describeSelection, type PartScope, type PartsPreference, toSelection,
} from '../lib/parts';
import { getDb } from './db';
import {
  autoScrobbles, releases, scrobbles, users, type User,
} from './db/schema';

export const HISTORY_LENGTH = 20;

export async function upsertUser(data: {
  name: string;
  sessionKey: string;
  url: string | null;
  image: string | null;
  imageLarge: string | null;
  imageXLarge: string | null;
}) {
  const [user] = await getDb()
    .insert(users)
    .values(data)
    .onConflictDoUpdate({ target: users.name, set: { ...data, updatedAt: new Date() } })
    .returning();
  return user;
}

export const toSessionJSON = (user: User) => ({
  id: user.id,
  name: user.name,
  url: user.url,
  image: user.image,
  imageLarge: user.imageLarge,
  imageXLarge: user.imageXLarge,
  searchFormat: user.searchFormat,
  partsPreference: user.partsPreference,
});

/** Remembers the scope picked for records and tapes or for discs. */
export async function setPartsPreference(userId: number, key: keyof PartsPreference, scope: PartScope) {
  await getDb().update(users)
    .set({ partsPreference: sql`coalesce(${users.partsPreference}, '{}'::jsonb) || ${JSON.stringify({ [key]: scope })}::jsonb` })
    .where(eq(users.id, userId));
}

export async function setSearchFormat(userId: number, searchFormat: SearchFormat | null) {
  await getDb().update(users).set({ searchFormat }).where(eq(users.id, userId));
}

export function findAutoScrobble(userId: number, releaseId: number) {
  return getDb().query.autoScrobbles.findFirst({
    where: and(eq(autoScrobbles.userId, userId), eq(autoScrobbles.releaseId, releaseId)),
  });
}

/** `parts` are the ids of the parts to scrobble, null for the default ones. */
export async function addAutoScrobble(userId: number, releaseId: number, parts: string[] | null = null) {
  await getDb().insert(autoScrobbles).values({ userId, releaseId, parts })
    .onConflictDoUpdate({ target: [autoScrobbles.userId, autoScrobbles.releaseId], set: { parts } });
}

export async function removeAutoScrobble(userId: number, releaseId: number) {
  await getDb().delete(autoScrobbles)
    .where(and(eq(autoScrobbles.userId, userId), eq(autoScrobbles.releaseId, releaseId)));
}

export async function listAutoScrobbles(userId: number) {
  const rows = await getDb()
    .select({
      id: releases.id,
      artist: releases.artist,
      title: releases.title,
      year: releases.year,
      image: releases.image,
      releaseParts: releases.parts,
      parts: autoScrobbles.parts,
    })
    .from(autoScrobbles)
    .innerJoin(releases, eq(releases.id, autoScrobbles.releaseId))
    .where(eq(autoScrobbles.userId, userId))
    .orderBy(asc(releases.artist), asc(releases.title));
  return rows.map(({ releaseParts, parts, ...row }) => ({
    ...row,
    scope: describeSelection(releaseParts ?? [], toSelection(releaseParts ?? [], parts)),
  }));
}

/** Records a scrobble and keeps only the latest HISTORY_LENGTH entries. */
export async function addToHistory(userId: number, releaseId: number) {
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.insert(scrobbles).values({ userId, releaseId });
    const keep = tx.select({ id: scrobbles.id }).from(scrobbles)
      .where(eq(scrobbles.userId, userId))
      .orderBy(desc(scrobbles.scrobbledAt), desc(scrobbles.id))
      .limit(HISTORY_LENGTH);
    await tx.delete(scrobbles)
      .where(and(eq(scrobbles.userId, userId), notInArray(scrobbles.id, keep)));
  });
}

export function listHistory(userId: number) {
  return getDb()
    .select({
      id: scrobbles.id,
      time: scrobbles.scrobbledAt,
      artist: releases.artist,
      title: releases.title,
      year: releases.year,
      image: releases.image,
      barcode: releases.barcode,
      discogsId: releases.id,
    })
    .from(scrobbles)
    .innerJoin(releases, eq(releases.id, scrobbles.releaseId))
    .where(eq(scrobbles.userId, userId))
    .orderBy(desc(scrobbles.scrobbledAt), desc(scrobbles.id))
    .limit(HISTORY_LENGTH);
}

