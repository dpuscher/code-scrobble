import {
  index, integer, jsonb, pgTable, primaryKey, text, timestamp,
} from 'drizzle-orm/pg-core';

export type Track = {
  title: string;
  trackNumber: number;
  duration: number;
};

const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  // Canonical Last.fm username as returned by auth.getSession.
  name: text().notNull().unique(),
  // Last.fm web service session key. These never expire unless the user
  // revokes access on last.fm, so it is stored for scrobbling.
  sessionKey: text().notNull(),
  url: text(),
  image: text(),
  imageLarge: text(),
  imageXLarge: text(),
  createdAt: createdAt(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// Local copy of Discogs releases, keyed by the Discogs release id.
export const releases = pgTable('releases', {
  id: integer().primaryKey(),
  artist: text().notNull(),
  title: text().notNull(),
  image: text(),
  url: text(),
  year: text(),
  // Digits only, see normalizeBarcode().
  barcode: text(),
  tracks: jsonb().$type<Track[]>().notNull(),
  fetchedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  createdAt: createdAt(),
}, (t) => [
  index('releases_barcode_idx').on(t.barcode),
]);

// Remembers which release a scanned barcode resolved to on Discogs, including
// misses (releaseId = null), so repeated scans don't hit the Discogs API.
export const barcodeLookups = pgTable('barcode_lookups', {
  barcode: text().primaryKey(),
  releaseId: integer().references(() => releases.id, { onDelete: 'cascade' }),
  checkedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type SearchResult = {
  id: number;
  title: string;
  thumb?: string;
  country?: string;
  year?: string;
  format?: string[];
  uri?: string;
};

export const searchCache = pgTable('search_cache', {
  query: text().primaryKey(),
  results: jsonb().$type<SearchResult[]>().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
});

export const autoScrobbles = pgTable('auto_scrobbles', {
  userId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
  releaseId: integer().notNull().references(() => releases.id, { onDelete: 'cascade' }),
  createdAt: createdAt(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.releaseId] }),
]);

export const scrobbles = pgTable('scrobbles', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
  releaseId: integer().notNull().references(() => releases.id, { onDelete: 'cascade' }),
  scrobbledAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('scrobbles_user_scrobbled_at_idx').on(t.userId, t.scrobbledAt.desc()),
]);

export const sessions = pgTable('sessions', {
  // SHA-256 of the cookie token; the raw token is never stored.
  id: text().primaryKey(),
  userId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: createdAt(),
}, (t) => [
  index('sessions_expires_at_idx').on(t.expiresAt),
]);

export const appMeta = pgTable('app_meta', {
  key: text().primaryKey(),
  value: jsonb().notNull(),
  createdAt: createdAt(),
});

export type User = typeof users.$inferSelect;
export type Release = typeof releases.$inferSelect;
