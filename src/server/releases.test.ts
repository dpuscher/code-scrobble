import { eq } from 'drizzle-orm';
import { testDb } from '@/test/db';
import { createRelease } from '@/test/factories';
import { discogsRelease, mockFetch } from '@/test/fetch';
import { barcodeLookups, releases } from './db/schema';
import {
  findByBarcode, findByDiscogsId, findVersions, normalizeBarcode, search,
} from './releases';

const DAY = 24 * 60 * 60 * 1000;

describe('normalizeBarcode', () => {
  it('keeps digits only', () => {
    expect(normalizeBarcode(' 4 006381-333931 ')).toBe('4006381333931');
  });
});

describe('findByBarcode', () => {
  it('looks up Discogs once, stores the release and remembers the barcode', async () => {
    const fetch = mockFetch({
      '/database/search': () => ({ results: [{ id: 42, community: { have: 1 } }] }),
      '/releases/42': () => discogsRelease(42),
    });

    const release = await findByBarcode('4006381333931');
    expect(release).toMatchObject({ id: 42, barcode: '4006381333931', artist: 'Artist A, Artist B' });

    // Second scan is served from the database.
    await expect(findByBarcode('4006381333931')).resolves.toMatchObject({ id: 42 });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('finds releases imported with a formatted barcode', async () => {
    const fetch = mockFetch({});
    await createRelease({ id: 7, barcode: '5012345678900' });
    await expect(findByBarcode('5 012345 678900')).resolves.toMatchObject({ id: 7 });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('caches misses for a day', async () => {
    const fetch = mockFetch({ '/database/search': () => ({ results: [] }) });

    await expect(findByBarcode('111')).resolves.toBeNull();
    await expect(findByBarcode('111')).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);

    await testDb().update(barcodeLookups).set({ checkedAt: new Date(Date.now() - 2 * DAY) });
    await findByBarcode('111');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('falls back to the scanned barcode when Discogs has none', async () => {
    mockFetch({
      '/database/search': () => ({ results: [{ id: 5 }] }),
      '/releases/5': () => discogsRelease(5, { identifiers: [] }),
    });
    await expect(findByBarcode('999')).resolves.toMatchObject({ id: 5, barcode: '999' });
  });

  it('ignores input without digits', async () => {
    await expect(findByBarcode('abc')).resolves.toBeNull();
  });
});

describe('findByDiscogsId', () => {
  it('refreshes releases older than a week', async () => {
    await createRelease({ id: 42, title: 'Old title', fetchedAt: new Date(Date.now() - 8 * DAY) });
    mockFetch({ '/releases/42': () => discogsRelease(42, { title: 'New title' }) });

    await expect(findByDiscogsId(42)).resolves.toMatchObject({ title: 'New title' });
    const [row] = await testDb().select().from(releases).where(eq(releases.id, 42));
    expect(row.title).toBe('New title');
  });

  it('keeps serving stale data when Discogs fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await createRelease({ id: 42, title: 'Old title', fetchedAt: new Date(Date.now() - 8 * DAY) });
    mockFetch({ '/releases/42': () => new Response('', { status: 500 }) });

    await expect(findByDiscogsId(42)).resolves.toMatchObject({ title: 'Old title' });
  });

  it('does not refetch fresh releases', async () => {
    const fetch = mockFetch({});
    await createRelease({ id: 42 });
    await findByDiscogsId(42);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns null for unknown releases', async () => {
    mockFetch({ '/releases/1': () => new Response('', { status: 404 }) });
    await expect(findByDiscogsId(1)).resolves.toBeNull();
  });
});

describe('search', () => {
  it('caches results per normalized query', async () => {
    const fetch = mockFetch({ '/database/search': () => ({ results: [{ id: 1, title: 'A' }] }) });

    await expect(search('  Abbey Road ')).resolves.toMatchObject([{ id: 1, title: 'A' }]);
    await search('abbey road');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(new URL(String(fetch.mock.calls[0][0])).searchParams.get('q')).toBe('abbey road');
  });

  it('caches each format separately', async () => {
    const fetch = mockFetch({ '/database/search': (url) => ({ results: [{ id: 1, title: url.searchParams.get('format') ?? 'all' }] }) });

    await expect(search('abbey road', 'Vinyl')).resolves.toMatchObject([{ title: 'Vinyl' }]);
    await expect(search('abbey road')).resolves.toMatchObject([{ title: 'all' }]);
    await expect(search('abbey road', 'Vinyl')).resolves.toMatchObject([{ title: 'Vinyl' }]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('returns nothing for blank queries', async () => {
    await expect(search('   ')).resolves.toEqual([]);
  });
});

describe('findVersions', () => {
  it('caches versions per master and format', async () => {
    const fetch = mockFetch({
      '/masters/7/versions': (url) => ({
        pagination: { items: 1 },
        versions: [{ id: url.searchParams.has('format') ? 2 : 1, title: 'A' }],
      }),
    });

    await expect(findVersions(7)).resolves.toMatchObject({ total: 1, versions: [{ id: 1 }] });
    await expect(findVersions(7, 'CD')).resolves.toMatchObject({ versions: [{ id: 2 }] });
    await findVersions(7);
    await findVersions(7, 'CD');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
