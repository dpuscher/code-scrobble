import { testDb } from './db';
import { releases, users } from '@/server/db/schema';

let sequence = 0;

export async function createUser(overrides: Partial<typeof users.$inferInsert> = {}) {
  sequence += 1;
  const [user] = await testDb().insert(users).values({
    name: `user-${sequence}`,
    sessionKey: `sk-${sequence}`,
    ...overrides,
  }).returning();
  return user;
}

export async function createRelease(overrides: Partial<typeof releases.$inferInsert> = {}) {
  sequence += 1;
  const [release] = await testDb().insert(releases).values({
    id: 10_000 + sequence,
    artist: 'Artist',
    title: `Release ${sequence}`,
    tracks: [{ title: 'Track', trackNumber: 1, duration: 60 }],
    parts: [],
    ...overrides,
  }).returning();
  return release;
}
