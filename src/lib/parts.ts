// Picking the sides and discs of a release to scrobble. Shared by the API
// and the pages; a selection is a list of part ids, null for the default.

import type { Part } from './types';

type PartTrack = { part?: string };

/** Parts scrobbled when none are picked: all but the bonus ones. */
export const defaultSelection = (parts: Part[]) => parts.filter((part) => !part.bonus).map(({ id }) => id);

const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every((id, i) => id === b[i]);

/**
 * Turns picked ids into a selection: the known ones in release order, null
 * when that is the default (or the release has no parts). May be empty.
 */
export function toSelection(parts: Part[], ids: unknown): string[] | null {
  if (!parts.length || !Array.isArray(ids)) return null;
  const picked = parts.filter(({ id }) => ids.includes(id)).map(({ id }) => id);
  return sameIds(picked, defaultSelection(parts)) ? null : picked;
}

export function selectedTracks<T extends PartTrack>(tracks: T[], parts: Part[], selection: string[] | null) {
  if (!parts.length) return tracks;
  const picked = new Set(selection ?? defaultSelection(parts));
  return tracks.filter(({ part }) => part !== undefined && picked.has(part));
}

const list = (names: string[]) => (
  names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
);

/** "Side A", "Sides C and D", "CD 2", "Sides A and B + CD"; null for the default selection. */
export function describeSelection(parts: Part[], selection: string[] | null) {
  if (!selection) return null;
  const picked = parts.filter(({ id }) => selection.includes(id));
  const sides = picked.filter(({ kind }) => kind === 'side').map(({ name }) => name);
  return [
    ...(sides.length ? [`${sides.length > 1 ? 'Sides' : 'Side'} ${list(sides)}`] : []),
    ...picked.filter(({ kind }) => kind === 'disc').map(({ name }) => name),
  ].join(' + ') || null;
}

/** For use inside a sentence: "side A", but "CD 2". */
export const inSentence = (description: string) => description.replace(/^(Sides?|Record|Tape|Disc)\b/, (word) => word.toLowerCase());

export type NextParts = {
  /** What comes next: "side", "record", "tape", "CD", ... */
  unit: string;
  selection: string[];
  description: string;
  /** "Next side (B)", "Next record (C/D)", "Next CD (3)". */
  label: string;
};

/**
 * What to scrobble after `selection`: the next side after a side, the next
 * record after both sides of one, the next CD after a CD. Nothing once the
 * last one was scrobbled. Bonus parts follow bonus parts only.
 */
export function nextParts(parts: Part[], selection: string[] | null): NextParts | undefined {
  const picked = selection ?? defaultSelection(parts);
  const last = parts.findLast(({ id }) => picked.includes(id));
  if (!last) return undefined;
  const pool = parts.filter((part) => Boolean(part.bonus) === Boolean(last.bonus));
  const next = pool[pool.indexOf(last) + 1];
  if (!next) return undefined;

  const partsOf = (item: string) => pool.filter((part) => part.item === item);
  // Whole records or tapes: both sides of each picked one.
  const items = new Set(pool.filter(({ id }) => picked.includes(id)).map(({ item }) => item));
  const whole = partsOf(last.item).length > 1
    && [...items].every((item) => partsOf(item).every(({ id }) => picked.includes(id)));
  const upcoming = whole ? partsOf(next.item) : [next];
  const unit = whole || next.kind === 'disc' ? next.medium : 'side';
  // "CD 3" is 3 after "Next CD".
  const names = upcoming.map(({ name }) => name.replace(new RegExp(`^${unit} `, 'i'), ''));
  return {
    unit,
    selection: upcoming.map(({ id }) => id),
    description: describeSelection(parts, upcoming.map(({ id }) => id))!,
    label: `Next ${unit} (${names.join('/')})`,
  };
}

/** How much of a record someone scrobbles at once: the first side or disc, the first record, or all. */
export type PartScope = 'first-part' | 'first-item' | 'all';

/** The scope someone last picked, for records and tapes (sides) and for discs. */
export type PartsPreference = { sides?: PartScope; discs?: PartScope };

const mainParts = (parts: Part[]) => parts.filter((part) => !part.bonus);
/** Whether a release is about sides or discs, by its main parts. */
export const preferenceKey = (parts: Part[]): keyof PartsPreference => (
  mainParts(parts)[0]?.kind === 'side' ? 'sides' : 'discs'
);

// The first side or disc, and every part of the first record.
function firsts(parts: Part[]) {
  const [first] = mainParts(parts);
  return {
    part: [first.id],
    item: mainParts(parts).filter(({ item }) => item === first.item).map(({ id }) => id),
  };
}

/** The scope a selection shows, if it is one: undefined for e.g. side B alone. */
export function scopeOf(parts: Part[], selection: string[] | null): PartScope | undefined {
  if (mainParts(parts).length < 2) return undefined;
  if (!selection) return 'all';
  const { part, item } = firsts(parts);
  if (sameIds(selection, item)) return 'first-item';
  if (sameIds(selection, part)) return 'first-part';
  return undefined;
}

/** What to preselect for someone who scrobbles in `preference` scopes. */
export function preferredSelection(parts: Part[], preference: PartsPreference | null | undefined) {
  if (mainParts(parts).length < 2) return null;
  const scope = preference?.[preferenceKey(parts)];
  if (!scope || scope === 'all') return null;
  const { part, item } = firsts(parts);
  return toSelection(parts, scope === 'first-part' ? part : item);
}
