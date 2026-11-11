import useSWR from 'swr';
import type { SearchFormat } from './formats';
import type { MasterVersions, SearchResult } from './types';

export class ApiError extends Error {
  constructor(public status: number, public body?: unknown) {
    super(`Request failed with status ${status}`);
  }
}

export async function api<T>(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new ApiError(response.status, await response.json().catch(() => undefined));
  return (await response.json()) as T;
}

const fetcher = <T>(url: string) => api<T>(url);

// Search results barely change; don't refetch them whenever the tab regains focus.
const stable = { revalidateOnFocus: false, revalidateIfStale: false } as const;

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
