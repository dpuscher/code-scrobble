/** Formats the release search can be narrowed to, as Discogs names them. */
export const SEARCH_FORMATS = ['Vinyl', 'CD', 'Cassette'] as const;

export type SearchFormat = typeof SEARCH_FORMATS[number];

export const isSearchFormat = (value: unknown): value is SearchFormat => (
  SEARCH_FORMATS.includes(value as SearchFormat)
);
