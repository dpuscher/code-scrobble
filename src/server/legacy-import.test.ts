import { testDb } from '@/test/db';
import {
  appMeta, autoScrobbles, releases, scrobbles, users,
} from './db/schema';
import {
  importLegacyData, type LegacyRelease, type LegacySource, type LegacyUser,
} from './legacy-import';

// Mongo ObjectIds are 24 hex chars that start with a timestamp.
const oid = (n: number) => ({ toString: () => n.toString(16).padStart(24, '0') });
const ref = (n: number) => oid(n).toString();

async function* iterate<T>(items: T[]) {
  for (const item of items) yield item;
}

const source = (legacyReleases: LegacyRelease[], legacyUsers: LegacyUser[]): LegacySource => ({
  releases: () => iterate(legacyReleases),
  users: () => iterate(legacyUsers),
});

const release = (n: number, overrides: Partial<LegacyRelease> = {}): LegacyRelease => ({
  _id: oid(n),
  id: 1000 + n,
  artist: `Artist ${n}`,
  title: `Title ${n}`,
  year: '1999',
  tracks: [{ title: 'Song', trackNumber: 1, duration: 120 }],
  createdAt: new Date('2019-01-01'),
  updatedAt: new Date('2020-01-01'),
  ...overrides,
});

const at = (iso: string) => new Date(iso);
const silent = () => {};

describe('importLegacyData', () => {
  it('imports releases and users with their auto-scrobbles and history', async () => {
    const stats = await importLegacyData(testDb(), source(
      [
        release(1, { barcode: '4 006381 333931', year: 2004 as unknown as string }),
        release(2, { image: '', tracks: [{ title: 'No number' }] }),
      ],
      [{
        _id: oid(100),
        name: 'jane',
        key: 'sk-jane',
        url: 'https://last.fm/user/jane',
        image: 'img',
        instantScrobbles: [ref(2)],
        history: [
          { id: ref(1), time: at('2020-05-01') },
          { id: ref(2), time: at('2020-06-01') },
        ],
      }],
    ), silent);

    expect(stats).toMatchObject({
      releases: 2, users: 1, autoScrobbles: 1, historyEntries: 2, danglingReferences: 0,
    });

    const imported = await testDb().select().from(releases).orderBy(releases.id);
    expect(imported[0]).toMatchObject({
      id: 1001, barcode: '4006381333931', year: '2004', fetchedAt: new Date('2020-01-01'),
    });
    expect(imported[1]).toMatchObject({
      id: 1002, image: null, tracks: [{ title: 'No number', trackNumber: 1, duration: 0 }],
    });

    const [jane] = await testDb().select().from(users);
    expect(jane).toMatchObject({ name: 'jane', sessionKey: 'sk-jane', image: 'img' });
    expect(await testDb().select().from(autoScrobbles)).toMatchObject([{ userId: jane.id, releaseId: 1002 }]);
    const history = await testDb().select().from(scrobbles).orderBy(scrobbles.scrobbledAt);
    expect(history.map((h) => [h.releaseId, h.scrobbledAt])).toEqual([
      [1001, at('2020-05-01')], [1002, at('2020-06-01')],
    ]);
  });

  it('merges duplicate user documents into one account', async () => {
    const stats = await importLegacyData(testDb(), source(
      [release(1), release(2), release(3)],
      [
        {
          _id: oid(100), name: 'jane', key: 'old-key', instantScrobbles: [ref(1)], history: [{ id: ref(1), time: at('2020-01-01') }],
        },
        {
          _id: oid(101), name: 'jane', key: 'new-key', instantScrobbles: [ref(1), ref(2)], history: [{ id: ref(3), time: at('2021-01-01') }],
        },
      ],
    ), silent);

    expect(stats).toMatchObject({ users: 1, mergedDuplicateUsers: 1 });
    const all = await testDb().select().from(users);
    expect(all).toHaveLength(1);
    // The document used most recently has the current Last.fm session key.
    expect(all[0].sessionKey).toBe('new-key');
    expect((await testDb().select().from(autoScrobbles)).map((a) => a.releaseId).sort()).toEqual([1001, 1002]);
    expect((await testDb().select().from(scrobbles)).map((s) => s.releaseId).sort()).toEqual([1001, 1003]);
  });

  it('skips dangling references, broken releases and users without credentials', async () => {
    const stats = await importLegacyData(testDb(), source(
      [release(1), release(2, { id: null })],
      [
        {
          _id: oid(100), name: 'jane', key: 'k', instantScrobbles: [ref(2), ref(99)], history: [{ id: ref(99), time: at('2020-01-01') }, { id: null }],
        },
        { _id: oid(101), name: 'nokey', key: '' },
        { _id: oid(102), name: null, key: 'k' },
      ],
    ), silent);

    expect(stats).toMatchObject({
      releases: 1, skippedReleases: 1, users: 1, skippedUsers: 2, autoScrobbles: 0, historyEntries: 0, danglingReferences: 4,
    });
  });

  it('keeps the 20 most recent history entries', async () => {
    const history = Array.from({ length: 25 }, (_, i) => ({
      id: ref(1), time: new Date(Date.UTC(2020, 0, i + 1)),
    }));
    await importLegacyData(testDb(), source([release(1)], [{
      _id: oid(100), name: 'jane', key: 'k', history,
    }]), silent);

    const rows = await testDb().select().from(scrobbles).orderBy(scrobbles.scrobbledAt);
    expect(rows).toHaveLength(20);
    expect(rows[0].scrobbledAt).toEqual(new Date(Date.UTC(2020, 0, 6)));
  });

  it('runs only once', async () => {
    const data = source([release(1)], [{ _id: oid(100), name: 'jane', key: 'k' }]);
    await importLegacyData(testDb(), data, silent);
    await expect(importLegacyData(testDb(), data, silent)).resolves.toBeNull();

    expect(await testDb().select().from(users)).toHaveLength(1);
    const [marker] = await testDb().select().from(appMeta);
    expect(marker.value).toMatchObject({ stats: { releases: 1, users: 1 } });
  });

  it('writes nothing when the import fails, so it can be retried', async () => {
    const failing: LegacySource = {
      releases: () => iterate([release(1)]),
      async* users() { throw new Error('connection lost'); },
    };
    await expect(importLegacyData(testDb(), failing, silent)).rejects.toThrow('connection lost');

    expect(await testDb().select().from(releases)).toHaveLength(0);
    expect(await testDb().select().from(appMeta)).toHaveLength(0);

    await expect(importLegacyData(testDb(), source([release(1)], []), silent)).resolves.toMatchObject({ releases: 1 });
  });

  it('handles more rows than one insert batch', async () => {
    const many = Array.from({ length: 2500 }, (_, i) => release(i + 1));
    const stats = await importLegacyData(testDb(), source(many, []), silent);
    expect(stats?.releases).toBe(2500);
  });
});
