import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import type { SearchFormat } from './formats';
import type {
  AutoScrobble, HistoryItem, MasterVersions, Release, ScrobbleResult, SearchResult,
} from './types';

export class ApiError extends Error {
  constructor(public status: number, public body?: unknown) {
    super(`Request failed with status ${status}`);
  }
}

export async function api<T>(url: string, { method = 'GET', body }: { method?: string; body?: unknown } = {}) {
  const response = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new ApiError(response.status, await response.json().catch(() => undefined));
  return (response.status === 204 ? undefined : await response.json()) as T;
}

const fetcher = <T>(url: string) => api<T>(url);

// Release data barely changes; don't refetch it whenever the tab regains focus.
const stable = { revalidateOnFocus: false, revalidateIfStale: false } as const;

type ReleaseResponse = Release | Record<string, never>;

const releaseKey = (code: string) => `/api/barcode/${encodeURIComponent(code)}`;
const asRelease = (data?: ReleaseResponse) => (data && 'id' in data ? data as Release : null);

/** Cached release lookup; `code` is a barcode or `id:<discogs id>`. */
export function useRelease(code: string) {
  const { data } = useSWR<ReleaseResponse>(releaseKey(code), fetcher, stable);
  return { release: asRelease(data) };
}

/**
 * Always looks the release up again: a cached copy may carry an outdated
 * auto-scrobble flag. The result also refreshes the cache for useRelease.
 */
export function useFreshRelease(code: string) {
  const key = releaseKey(code);
  const { mutate } = useSWRConfig();
  const [result, setResult] = useState<{ key: string; data: ReleaseResponse | null }>();

  useEffect(() => {
    let current = true;
    api<ReleaseResponse>(key).then(
      (data) => {
        if (!current) return;
        setResult({ key, data });
        mutate(key, data, { revalidate: false });
      },
      () => { if (current) setResult({ key, data: null }); },
    );
    return () => { current = false; };
  }, [key, mutate]);

  const isLoading = result?.key !== key;
  const release = isLoading ? null : asRelease(result.data ?? undefined);
  return { release, isLoading, failed: !isLoading && !release };
}

export const useHistory = () => useSWR<HistoryItem[]>('/api/user/history', fetcher);

export function useAutoScrobbles() {
  const swr = useSWR<AutoScrobble[]>('/api/user/autoscrobbles', fetcher);
  const remove = (id: number) => swr.mutate(
    async (current) => {
      await api('/api/user/autoscrobbles', { method: 'DELETE', body: { id } });
      return current?.filter((item) => item.id !== id);
    },
    { optimisticData: (current) => current?.filter((item) => item.id !== id) ?? [], rollbackOnError: true },
  );
  return { ...swr, remove };
}

const withFormat = (path: string, format: SearchFormat | null) => (
  format ? `${path}?format=${encodeURIComponent(format)}` : path
);

/** Release search; `query` null until one is submitted. */
export const useSearch = (query: string | null, format: SearchFormat | null) => useSWR<SearchResult[]>(
  query ? withFormat(`/api/search/${encodeURIComponent(query)}`, format) : null,
  fetcher,
  // Keeps showing the last results while a changed filter loads.
  { ...stable, keepPreviousData: true },
);

export const useVersions = (masterId: number, format: SearchFormat | null) => useSWR<MasterVersions>(
  withFormat(`/api/masters/${masterId}/versions`, format),
  fetcher,
  { ...stable, keepPreviousData: true },
);

export const saveSearchFormat = (searchFormat: SearchFormat | null) => (
  api('/api/user/settings', { method: 'POST', body: { searchFormat } })
);

/** `from` skips tracks an earlier, failed attempt already sent. */
export const scrobbleRelease = (id: number, autoScrobble: boolean, from = 0) => (
  api<Partial<ScrobbleResult>>('/api/scrobble', { method: 'POST', body: { id, autoScrobble, from } })
);
