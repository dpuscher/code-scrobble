/**
 * Fills the local development database with a user, the records of
 * dev/catalog.ts, a scrobble history and auto-scrobbles. Applies the
 * migrations first, so it works on a fresh database.
 *
 *   node dev/seed.ts           seeds unless the dev user already exists
 *   node dev/seed.ts --reset   deletes all data first
 *
 * Refuses to touch anything but a database on this machine or the
 * `postgres` service of docker-compose.yml.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { eq, sql } from 'drizzle-orm';
import postgres from 'postgres';
import {
  autoScrobbles, releases, scrobbles, users,
} from '../src/server/db/schema.ts';
import { catalog, coverImage, DEV_USER } from './catalog.ts';

const url = process.env.DATABASE_URL ?? 'postgres://codescrobble:codescrobble@localhost:5432/codescrobble';
const { hostname } = new URL(url);
if (!['localhost', '127.0.0.1', '[::1]', 'postgres'].includes(hostname)) {
  console.error(`Refusing to seed ${hostname}: only local databases are seeded.`);
  process.exit(1);
}

const reset = process.argv.includes('--reset');
const client = postgres(url, { max: 1, onnotice: () => {} });
const db = drizzle(client, { casing: 'snake_case' });

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const ago = (ms: number) => new Date(Date.now() - ms);

try {
  await migrate(db, { migrationsFolder: 'drizzle' });

  if (reset) {
    await db.execute(sql`
      truncate users, releases, barcode_lookups, search_cache, auto_scrobbles, scrobbles, sessions
      restart identity cascade
    `);
  } else if ((await db.select().from(users).where(eq(users.name, DEV_USER.name))).length) {
    console.log('Dev data already seeded (make reset starts over).');
    process.exit(0);
  }

  await db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values({
      name: DEV_USER.name,
      sessionKey: DEV_USER.sessionKey,
      url: `https://www.last.fm/user/${DEV_USER.name}`,
      image: DEV_USER.avatar,
      imageLarge: DEV_USER.avatar,
      imageXLarge: DEV_USER.avatar,
    }).returning();

    await tx.insert(releases).values(catalog.map((r) => ({
      id: r.id,
      artist: r.artist,
      title: r.title,
      year: String(r.year),
      barcode: r.barcode,
      image: coverImage(r),
      url: `https://www.discogs.com/release/${r.id}`,
      tracks: r.tracks.map(([title, duration], i) => {
        const [minutes, seconds] = duration.split(':').map(Number);
        return { title, trackNumber: i + 1, duration: minutes * 60 + seconds };
      }),
    }))).onConflictDoNothing();

    // Newest first: from minutes to a year ago, with one record played twice.
    const history: [releaseId: number, when: number][] = [
      [2004, 5 * MINUTE], [2008, 50 * MINUTE], [2001, 3 * 60 * MINUTE], [2012, DAY], [2003, 2 * DAY],
      [2009, 5 * DAY], [2004, 9 * DAY], [2006, 20 * DAY], [2002, 45 * DAY], [2010, 90 * DAY],
      [2005, 200 * DAY], [2011, 400 * DAY],
    ];
    await tx.insert(scrobbles).values(history.map(([releaseId, when]) => ({
      userId: user.id, releaseId, scrobbledAt: ago(when),
    })));

    await tx.insert(autoScrobbles).values([2001, 2003, 2012].map((releaseId) => ({ userId: user.id, releaseId })));
  });

  console.log(`Seeded ${catalog.length} records for ${DEV_USER.name}. Barcodes to try:`);
  for (const r of catalog) console.log(`  ${r.barcode}  ${r.artist} - ${r.title}`);
} finally {
  await client.end();
}
