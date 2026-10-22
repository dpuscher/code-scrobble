import { vi } from 'vitest';

type Route = (url: URL, init?: RequestInit) => unknown;

/**
 * Stubs global fetch. Each route matches on `url.pathname` and returns a JSON
 * body, or a Response for anything else. Unmatched requests throw.
 */
export function mockFetch(routes: Record<string, Route>) {
  const fn = vi.fn(async (input: string | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const route = routes[url.pathname];
    if (!route) throw new Error(`Unexpected fetch ${url}`);
    const result = await route(url, init);
    return result instanceof Response ? result : Response.json(result);
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

export const discogsRelease = (id: number, overrides: Record<string, unknown> = {}) => ({
  id,
  title: `Album ${id}`,
  uri: `https://www.discogs.com/release/${id}`,
  year: 2001,
  artists: [{ name: 'Artist A' }, { name: 'Artist B' }],
  images: [{ uri: `https://i.discogs.test/${id}.jpg` }],
  identifiers: [{ type: 'Matrix', value: 'X' }, { type: 'Barcode', value: '4 006381 333931' }],
  tracklist: [
    { position: '1', type_: 'track', title: 'One', duration: '3:00' },
    { position: '2', type_: 'track', title: 'Two', duration: '1:02:03' },
  ],
  ...overrides,
});
