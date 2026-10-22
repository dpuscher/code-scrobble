/**
 * One-time import of the MongoDB data of CodeScrobble 1.x into Postgres.
 *
 * Runs at startup while MONGODB_URI is set and the `legacy_mongo_import`
 * marker is missing. Everything happens in a single transaction together with
 * writing that marker, so a failed import leaves Postgres untouched and is
 * simply retried on the next start. MongoDB itself is only ever read.
 */
import { eq } from 'drizzle-orm';
import type { Database } from './db';
import {
  appMeta, autoScrobbles, releases, scrobbles, users, type Track,
} from './db/schema';
import { normalizeBarcode } from './releases';
import { HISTORY_LENGTH } from './users';

export const IMPORT_MARKER = 'legacy_mongo_import';

type Id = { toString(): string };

export type LegacyRelease = {
  _id: Id;
  id?: number | null;
  artist?: string | null;
  title?: string | null;
  image?: string | null;
  url?: string | null;
  year?: string | number | null;
  barcode?: string | null;
  tracks?: Partial<Track>[] | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type LegacyUser = {
  _id: Id;
  name?: string | null;
  key?: string | null;
  url?: string | null;
  image?: string | null;
  imageLarge?: string | null;
  imageXLarge?: string | null;
  instantScrobbles?: (string | Id)[] | null;
  history?: { id?: string | Id | null; time?: Date | null }[] | null;
};

export type LegacySource = {
  releases(): AsyncIterable<LegacyRelease>;
  users(): AsyncIterable<LegacyUser>;
};

export type ImportStats = {
  releases: number;
  skippedReleases: number;
  users: number;
  mergedDuplicateUsers: number;
  skippedUsers: number;
  autoScrobbles: number;
  historyEntries: number;
  danglingReferences: number;
};

const CHUNK = 1000;

function chunks<T>(items: T[], size = CHUNK) {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

// ObjectId hex strings start with the creation time, so they sort by age.
const lastActivity = (user: LegacyUser) => Math.max(
  0,
  ...(user.history ?? []).map((h) => h.time?.getTime() ?? 0),
);

export async function importLegacyData(
  db: Database,
  source: LegacySource,
  log: (message: string) => void = console.log,
): Promise<ImportStats | null> {
  return db.transaction(async (tx) => {
    const done = await tx.query.appMeta.findFirst({ where: eq(appMeta.key, IMPORT_MARKER) });
    if (done) return null;

    const stats: ImportStats = {
      releases: 0,
      skippedReleases: 0,
      users: 0,
      mergedDuplicateUsers: 0,
      skippedUsers: 0,
      autoScrobbles: 0,
      historyEntries: 0,
      danglingReferences: 0,
    };

    // Releases: Mongo _id -> Discogs id, which is the new primary key.
    const releaseIds = new Map<string, number>();
    let batch: (typeof releases.$inferInsert)[] = [];
    const flush = async () => {
      if (!batch.length) return;
      const inserted = await tx.insert(releases).values(batch).onConflictDoNothing()
        .returning({ id: releases.id });
      stats.releases += inserted.length;
      stats.skippedReleases += batch.length - inserted.length;
      batch = [];
    };

    for await (const doc of source.releases()) {
      const id = Number(doc.id);
      if (!Number.isInteger(id) || id <= 0) {
        stats.skippedReleases += 1;
        continue;
      }
      releaseIds.set(doc._id.toString(), id);
      batch.push({
        id,
        artist: doc.artist ?? '',
        title: doc.title ?? '',
        image: doc.image || null,
        url: doc.url || null,
        year: doc.year != null && doc.year !== '' ? String(doc.year) : null,
        barcode: (doc.barcode && normalizeBarcode(doc.barcode)) || null,
        tracks: (doc.tracks ?? []).map((track, index) => ({
          title: track.title ?? '',
          trackNumber: track.trackNumber ?? index + 1,
          duration: track.duration ?? 0,
        })),
        // Old fetch time keeps the weekly Discogs refresh schedule intact.
        fetchedAt: doc.updatedAt ?? doc.createdAt ?? new Date(),
        createdAt: doc.createdAt ?? new Date(),
      });
      if (batch.length >= CHUNK) await flush();
    }
    await flush();

    // Users: the old login had a race that created duplicate documents for
    // one Last.fm name. Merge them so nobody loses history or auto-scrobbles.
    const byName = new Map<string, LegacyUser[]>();
    for await (const doc of source.users()) {
      if (!doc.name || !doc.key) {
        stats.skippedUsers += 1;
        continue;
      }
      byName.set(doc.name, [...(byName.get(doc.name) ?? []), doc]);
    }

    const resolveRelease = (ref: string | Id | null | undefined) => {
      const id = ref ? releaseIds.get(ref.toString()) : undefined;
      if (!id) stats.danglingReferences += 1;
      return id;
    };

    const merged = [...byName.values()].map((docs) => {
      stats.mergedDuplicateUsers += docs.length - 1;
      const [primary] = docs.toSorted((a, b) => (
        lastActivity(b) - lastActivity(a) || b._id.toString().localeCompare(a._id.toString())
      ));
      const auto = new Set<number>();
      const history = new Map<string, { releaseId: number; time: Date }>();
      docs.forEach((doc) => {
        (doc.instantScrobbles ?? []).forEach((ref) => {
          const id = resolveRelease(ref);
          if (id) auto.add(id);
        });
        (doc.history ?? []).forEach((entry) => {
          const id = resolveRelease(entry.id);
          if (!id) return;
          const time = entry.time ?? new Date(0);
          history.set(`${id}:${time.getTime()}`, { releaseId: id, time });
        });
      });
      return {
        user: {
          name: primary.name!,
          sessionKey: primary.key!,
          url: primary.url || null,
          image: primary.image || null,
          imageLarge: primary.imageLarge || null,
          imageXLarge: primary.imageXLarge || null,
        },
        auto: [...auto],
        history: [...history.values()]
          .sort((a, b) => b.time.getTime() - a.time.getTime())
          .slice(0, HISTORY_LENGTH),
      };
    });

    const userIds = new Map<string, number>();
    for (const chunk of chunks(merged)) {
      const inserted = await tx.insert(users).values(chunk.map((m) => m.user))
        .onConflictDoNothing().returning({ id: users.id, name: users.name });
      inserted.forEach((u) => userIds.set(u.name, u.id));
      stats.users += inserted.length;
      stats.skippedUsers += chunk.length - inserted.length;
    }

    const autoRows = merged.flatMap((m) => {
      const userId = userIds.get(m.user.name);
      return userId ? m.auto.map((releaseId) => ({ userId, releaseId })) : [];
    });
    for (const chunk of chunks(autoRows)) {
      await tx.insert(autoScrobbles).values(chunk).onConflictDoNothing();
    }
    stats.autoScrobbles = autoRows.length;

    const historyRows = merged.flatMap((m) => {
      const userId = userIds.get(m.user.name);
      return userId
        ? m.history.map((h) => ({ userId, releaseId: h.releaseId, scrobbledAt: h.time }))
        : [];
    });
    for (const chunk of chunks(historyRows)) {
      await tx.insert(scrobbles).values(chunk);
    }
    stats.historyEntries = historyRows.length;

    await tx.insert(appMeta).values({
      key: IMPORT_MARKER,
      value: { importedAt: new Date().toISOString(), stats },
    });
    log(`Legacy MongoDB import finished: ${JSON.stringify(stats)}`);
    return stats;
  });
}

/** Reads the legacy data straight from MongoDB (read-only). */
export async function importFromMongo(db: Database, mongoUri: string) {
  const { MongoClient } = await import('mongodb');
  const client = new MongoClient(mongoUri, { readPreference: 'secondaryPreferred' });
  await client.connect();
  try {
    const mongo = client.db();
    return await importLegacyData(db, {
      releases: () => mongo.collection<LegacyRelease>('releases').find({}, { batchSize: CHUNK }),
      users: () => mongo.collection<LegacyUser>('users').find({}, { batchSize: CHUNK }),
    });
  } finally {
    await client.close();
  }
}
