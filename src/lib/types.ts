// Shapes shared by the server and the client: stored as JSON in the
// database (schema.ts) and passed to pages and the API.

import type { SearchFormat } from './formats';
import type { PartsPreference } from './parts';

export type Session = {
  id: number;
  name: string;
  url: string | null;
  image: string | null;
  imageLarge: string | null;
  imageXLarge: string | null;
  searchFormat: SearchFormat | null;
  partsPreference: PartsPreference | null;
};

export type Track = {
  title: string;
  trackNumber: number;
  duration: number;
  /** Only when it differs from the release artist, e.g. on compilations. */
  artist?: string;
  /** The side or disc it is on, see `Release.parts`. */
  part?: string;
};

/** A side or disc of a release, to scrobble on its own. */
export type Part = {
  /** Stable key, also used in URLs: "A", "2-A", "CD-B", "D2", "CD1". */
  id: string;
  /** Short name: "A", "2A" (side A of the second record), "CD", "CD 2", "Record 3". */
  name: string;
  kind: 'side' | 'disc';
  /** The record, tape or disc it is on; sides A and B of a record share it. */
  item: string;
  /** What the item is: "record", "tape", "CD", "SACD", "MiniDisc" or "disc". */
  medium: string;
  /** On another medium than the main one, e.g. the CD of a vinyl release. Not scrobbled unless picked. */
  bonus?: boolean;
};

export type Release = {
  id: number;
  artist: string;
  title: string;
  image: string | null;
  url: string | null;
  year: string | null;
  tracks: Track[];
  /** Sides and discs, when there are several. */
  parts: Part[];
  instantScrobble: boolean;
  /** The parts an auto-scrobble scrobbles; null for the default ones. */
  instantParts: string[] | null;
};

/**
 * A release search hit. Versions of the same album are grouped under their
 * Discogs master release.
 */
export type SearchResult = {
  /** Release to open: the release itself, or the most collected version of the album. */
  id: number;
  /** Set for albums, whose versions are listed before one is opened. */
  masterId: number | null;
  artist: string;
  title: string;
  thumb?: string;
  /** Earliest year among the matching versions. */
  year?: string;
  /** Only for releases without a master. */
  country?: string;
  /** An album's formats (Vinyl, CD, ...), or a release's format details. */
  format: string[];
};

export type Version = {
  id: number;
  title: string;
  thumb?: string;
  /** Major formats, e.g. ["Vinyl"]. */
  formats: string[];
  /** Format details, e.g. `2xLP, Album, Reissue`. */
  format?: string;
  year?: string;
  country?: string;
  label?: string;
  catno?: string;
  /** How many Discogs users have it in their collection. */
  collected: number;
};

/** Versions of a master release, most collected first. */
export type MasterVersions = {
  versions: Version[];
  /** All versions on Discogs; `versions` holds at most the first page. */
  total: number;
};

export type ScrobbleRequest = {
  /** Discogs release id. */
  id: number;
  /** The sides or discs to scrobble, null for the default ones. */
  parts?: string[] | null;
  /** Scrobble it right away when it is scanned again. */
  autoScrobble?: boolean;
  /** Save which sides were picked, to pick the same ones next time. */
  remember?: boolean;
  /** Tracks an earlier attempt already sent. */
  from?: number;
};

export type ScrobbleResponse =
  /** What Last.fm did with the tracks; both 0 when scrobbling is off. */
  | { status: 'scrobbled'; accepted: number; ignored: number; ignoredCode?: number }
  /** Last.fm access was revoked: log in again. */
  | { status: 'login' }
  /** Last.fm failed after `sent` tracks; a retry starts after them. */
  | { status: 'failed'; sent: number }
  | { status: 'invalid'; error: string };

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
  /** What is scrobbled, e.g. "Side A"; null for the whole record. */
  scope: string | null;
};
