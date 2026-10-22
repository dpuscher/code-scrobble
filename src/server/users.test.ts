import { testDb } from '@/test/db';
import { createRelease, createUser } from '@/test/factories';
import { scrobbles } from './db/schema';
import {
  addAutoScrobble, addToHistory, HISTORY_LENGTH, isAutoScrobble, listAutoScrobbles,
  listHistory, removeAutoScrobble, upsertUser,
} from './users';

const profile = {
  url: 'u', image: 'i', imageLarge: 'l', imageXLarge: 'x',
};

describe('upsertUser', () => {
  it('creates a user once and updates the session key on later logins', async () => {
    const first = await upsertUser({ name: 'jane', sessionKey: 'a', ...profile });
    const second = await upsertUser({
      name: 'jane', sessionKey: 'b', ...profile, image: 'new',
    });
    expect(second.id).toBe(first.id);
    expect(second).toMatchObject({ sessionKey: 'b', image: 'new' });
  });
});

describe('auto scrobbles', () => {
  it('adds, lists sorted by artist and title, and removes', async () => {
    const user = await createUser();
    const b = await createRelease({ artist: 'B', title: 'x', year: '2000' });
    const a2 = await createRelease({ artist: 'A', title: 'z' });
    const a1 = await createRelease({ artist: 'A', title: 'y' });

    await Promise.all([b, a2, a1].map((r) => addAutoScrobble(user.id, r.id)));
    await addAutoScrobble(user.id, b.id); // idempotent

    expect((await listAutoScrobbles(user.id)).map((r) => r.id)).toEqual([a1.id, a2.id, b.id]);
    expect(await isAutoScrobble(user.id, b.id)).toBe(true);

    await removeAutoScrobble(user.id, b.id);
    expect(await isAutoScrobble(user.id, b.id)).toBe(false);
  });

  it('is scoped per user', async () => {
    const [jane, joe] = [await createUser(), await createUser()];
    const release = await createRelease();
    await addAutoScrobble(jane.id, release.id);
    expect(await listAutoScrobbles(joe.id)).toEqual([]);
  });
});

describe('history', () => {
  it('lists the newest scrobbles first with release details', async () => {
    const user = await createUser();
    const older = await createRelease({ barcode: '123' });
    const newer = await createRelease();
    await addToHistory(user.id, older.id);
    await addToHistory(user.id, newer.id);

    const history = await listHistory(user.id);
    expect(history.map((h) => h.discogsId)).toEqual([newer.id, older.id]);
    expect(history[1]).toMatchObject({ barcode: '123', title: older.title, artist: 'Artist' });
  });

  it(`keeps only the latest ${HISTORY_LENGTH} entries per user`, async () => {
    const [user, other] = [await createUser(), await createUser()];
    const release = await createRelease();
    await addToHistory(other.id, release.id);
    for (let i = 0; i < HISTORY_LENGTH + 5; i += 1) {
      await addToHistory(user.id, release.id);
    }

    const rows = await testDb().select().from(scrobbles);
    expect(rows.filter((r) => r.userId === user.id)).toHaveLength(HISTORY_LENGTH);
    expect(rows.filter((r) => r.userId === other.id)).toHaveLength(1);
  });
});
