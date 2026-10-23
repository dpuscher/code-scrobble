// Shapes of the JSON API responses (see src/pages/api).

import type { SearchFormat } from './formats';

export type Session = {
  id: number;
  name: string;
  url: string | null;
  image: string | null;
  imageLarge: string | null;
  imageXLarge: string | null;
  searchFormat: SearchFormat | null;
};

export type Track = {
  title: string;
  trackNumber: number;
  duration: number;
  /** Only when it differs from the release artist, e.g. on compilations. */
  artist?: string;
};

export type Release = {
  id: number;
  artist: string;
  title: string;
  image: string | null;
  url: string | null;
  year: string | null;
  tracks: Track[];
  instantScrobble: boolean;
};

export type SearchResult = {
  /** Release to open: the release itself, or the most collected version of the album. */
  id: number;
  /** Set for albums, whose versions are listed before one is opened. */
  masterId: number | null;
  artist: string;
  title: string;
  thumb?: string;
  year?: string;
  country?: string;
  /** An album's formats (Vinyl, CD, ...), or a release's format details. */
  format: string[];
};

export type Version = {
  id: number;
  title: string;
  thumb?: string;
  formats: string[];
  format?: string;
  year?: string;
  country?: string;
  label?: string;
  catno?: string;
  collected: number;
};

export type MasterVersions = {
  versions: Version[];
  total: number;
};

/** What Last.fm did with a scrobbled release; empty when scrobbling is off. */
export type ScrobbleResult = {
  accepted: number;
  ignored: number;
  ignoredCode?: number;
};

export type HistoryItem = {
  id: number;
  time: string;
  artist: string;
  title: string;
  year: string | null;
  image: string | null;
  barcode: string | null;
  discogsId: number;
};

export type AutoScrobble = {
  id: number;
  artist: string;
  title: string;
  year: string | null;
  image: string | null;
};
