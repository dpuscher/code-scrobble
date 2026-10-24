import type { Ignored } from './scrobble';

/** The page confirming a scrobble: what was scrobbled, and what Last.fm ignored. */
export function scrobbledUrl(barcode: string, parts: string[] | null, ignored?: Ignored) {
  const query = new URLSearchParams();
  if (parts) query.set('parts', parts.join(','));
  if (ignored) {
    query.set('ignored', String(ignored.count));
    query.set('reason', String(ignored.code ?? ''));
  }
  const search = query.size ? `?${query}` : '';
  return `/scrobbled/${encodeURIComponent(barcode)}${search}`;
}
