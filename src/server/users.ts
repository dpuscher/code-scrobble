import {
  and, asc, desc, eq, notInArray,
} from 'drizzle-orm';
import type { SearchFormat } from '../lib/formats';
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
});

export async function setSearchFormat(userId: number, searchFormat: SearchFormat | null) {
  await getDb().update(users).set({ searchFormat }).where(eq(users.id, userId));
}

export async function isAutoScrobble(userId: number, releaseId: number) {
  const row = await getDb().query.autoScrobbles.findFirst({
    where: and(eq(autoScrobbles.userId, userId), eq(autoScrobbles.releaseId, releaseId)),
  });
  return Boolean(row);
}

export async function addAutoScrobble(userId: number, releaseId: number) {
  await getDb().insert(autoScrobbles).values({ userId, releaseId }).onConflictDoNothing();
}

export async function removeAutoScrobble(userId: number, releaseId: number) {
  await getDb().delete(autoScrobbles)
    .where(and(eq(autoScrobbles.userId, userId), eq(autoScrobbles.releaseId, releaseId)));
}

export function listAutoScrobbles(userId: number) {
  return getDb()
    .select({
      id: releases.id, artist: releases.artist, title: releases.title, year: releases.year, image: releases.image,
    })
    .from(autoScrobbles)
    .innerJoin(releases, eq(releases.id, autoScrobbles.releaseId))
    .where(eq(autoScrobbles.userId, userId))
    .orderBy(asc(releases.artist), asc(releases.title));
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

