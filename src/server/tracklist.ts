/**
 * Turns a Discogs tracklist into the tracks to scrobble, following the
 * Discogs tracklisting guidelines (RSG §12):
 *
 * - Headings are text, not audio.
 * - Index tracks name a musical work; their sub-tracks are its parts. Parts
 *   that all belong to one track position (A2a, A2b or 3.1, 3.2) play as one
 *   track and are scrobbled once under the work's title; otherwise (1, 2, 3)
 *   the parts are scrobbled one by one as "Work: Part".
 * - Tracks titled "(silence)", "(no audio)" and the like are no audio.
 * - Positions tell the media apart: sides (A1, B2, AA1) for records and
 *   tapes, numbers (1, 1-1) for discs, prefixes for the rest of a set
 *   (CD1-1, DVD1, Video 1, MPG1).
 * - Only one kind of medium is scrobbled by default: a vinyl release with a
 *   bonus CD of the same songs would otherwise be scrobbled twice. The other
 *   media stay available as bonus parts. Video content (DVDs, Blu-rays,
 *   enhanced CD videos) and download files are left out whenever there is
 *   audio on a disc, record or tape.
 * - The sides and discs become parts that can be scrobbled on their own.
 */

export type DiscogsArtist = { name: string; join?: string };

export type DiscogsTrack = {
  position: string;
  type_: string;
  title: string;
  duration: string;
  // Set on compilations and splits, where tracks have their own artists.
  artists?: DiscogsArtist[];
  sub_tracks?: DiscogsTrack[];
};

export type DiscogsFormat = { name: string; qty?: string };

export type PlayableTrack = {
  title: string;
  /** Seconds, 0 when unknown. */
  duration: number;
  artists?: DiscogsArtist[];
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

export type GroupedTrack = PlayableTrack & { part?: string };

type Kind = 'sides' | 'disc' | 'video' | 'file' | 'unknown';

/**
 * What a track is on: the kind of medium, the prefix that names its item in a
 * set, and the rest of the position after the prefix ("2-A1" of "LP2-A1").
 */
type Medium = { kind: Kind; prefix: string; rest: string };

type Entry = PlayableTrack & { medium: Medium };

type Spot = Omit<Part, 'name' | 'bonus'> & { prefix: string; side?: string; number: number };

// "1:02:03" -> 3723 seconds. Discogs also allows a period in place of the
// colon ("3.45"). Missing or malformed parts count as 0.
export function convertTimecode(timecode = '') {
  return timecode
    .split(/[:.]/)
    .map((n) => parseInt(n, 10) || 0)
    .reverse()
    .reduce((total, n, i) => total + n * (60 ** i), 0);
}

// "A2 " and "4." happen; the guidelines forbid the punctuation (§12.2.8).
const cleanPosition = (position = '') => position.trim().replace(/\.$/, '');

// The track a part belongs to: A2a, A2.b, 3.1, A.a, Aa and 1A are parts of
// A2, A2, 3, A, A and 1. Undefined for whole tracks.
const partOf = (position: string) => (
  /^(.+?)(?:\.[^.]+|(?<=\d)\p{L}|(?<=^\p{Lu})\p{Ll})$/u.exec(position)?.[1]
);

const VIDEO_FORMATS = /^(dvd|dvdr|hd dvd|blu-ray|blu-ray-r|vhs|betamax|video ?8|laserdisc|vcd|svcd|umd|ced)$/i;
// Names of set items in positions (CD1-1, DVD-3, CS-A1, 7"-B, Video 2), not followed
// by more letters. Checked in this order: CD-ROM is video, not a CD. Short
// abbreviations only count in capitals: Bd is part d of side B, not a Blu-ray.
const PREFIXES: [Kind, RegExp][] = [
  ['disc', /^(dvd-?audio|audio)(?!\p{L})/iu],
  ['video', /^(video|mpe?g|mp4|dvdr?|blu-?ray|vhs|s?vcd|cd-?rom|enhanced|multimedia)(?!\p{L})/iu],
  ['video', /^(UHD-?BD|BD|BR|CDV|DATA)(?!\p{L})/u],
  ['file', /^(file|download|digital|mp3|flac|wav|aiff?|usb)(?!\p{L})/iu],
  ['file', /^(DL)(?!\p{L})/u],
  ['disc', /^(sacd|hdcd|shm-?cd|disc|disk)(?!\p{L})/iu],
  ['disc', /^(CDR?|CDr|MD)(?!\p{L})/u],
  // Side, Face, Lado, Seite, Kant: "side" in English, French, Spanish, German, Dutch.
  ['sides', /^(cass|cassette|tape|vinyl|side|face|lado|seite|kant)(?!\p{L})/iu],
  ['sides', /^(LP|EP|MC|CS|\d{1,2}")(?!\p{L})/u],
];
// Names of formats and prefixes for what a part is on.
const NOUNS: [RegExp, string][] = [
  [/^(cd|cdr|hdcd|shm-?cd)$/i, 'CD'],
  [/^sacd$/i, 'SACD'],
  [/^dvd-?audio$/i, 'DVD-Audio'],
  [/^(minidisc|md)$/i, 'MiniDisc'],
  [/^(vinyl|acetate|lathe cut|flexi-disc|shellac|lp|ep|\d{1,2}")$/i, 'record'],
  [/^(cassette|microcassette|reel-to-reel|cass|tape|mc|cs)$/i, 'tape'],
];
const nounOf = (name = '') => NOUNS.find(([pattern]) => pattern.test(name))?.[1];
const VIDEO_HEADING = /\b(dvd|blu-?ray|video|vhs)\b/i;
// Bracketed, so that songs called "Silence" or "Empty" stay.
const NO_AUDIO = /^([([]\s*(no audio|silence|silent|blank|empty|data( track)?)\s*[)\]]|no audio|data track|blank track|silent track)$/i;

/** The discs, records and tapes of a set in order, e.g. CD, CD, DVD. */
function mediaOf(formats: DiscogsFormat[]) {
  return formats
    .filter(({ name }) => !/^(box set|all media)$/i.test(name))
    .flatMap(({ name, qty }) => Array<string>(Math.min(Number(qty) || 1, 100)).fill(name));
}

// Names for the same kind of item: CD1-1 and CDr-1 are both CDs, Side A is
// just side A.
const samePrefix = (prefix: string) => prefix.toUpperCase().replace(/-/g, '')
  .replace(/^(CDR|DISC|DISK)$/, 'CD')
  .replace(/^(SIDE|FACE|LADO|SEITE|KANT)$/, '');

/**
 * `media` maps the item numbers of positions like 2-5 to formats; it is
 * empty when the numbers do not match the items of the set.
 */
function mediumOf(position: string, media: string[], videoSection: boolean): Medium {
  for (const [kind, pattern] of PREFIXES) {
    const prefix = pattern.exec(position)?.[1];
    if (prefix) {
      return { kind, prefix: samePrefix(prefix), rest: position.slice(prefix.length).replace(/^[-.:\s]+/, '') };
    }
  }
  const medium = (kind: Kind): Medium => ({ kind, prefix: '', rest: position });
  if (videoSection) return medium('video');
  if (/^\d/.test(position)) {
    // 2-5 is the fifth track of the second item, which may be a DVD.
    const item = /^(\d+)-\d/.exec(position);
    if (item && VIDEO_FORMATS.test(media[Number(item[1]) - 1] ?? '')) return medium('video');
    return medium('disc');
  }
  // A1, B12, A.1, A-1, a1, AA (double A side), AB1 (second groove of side A),
  // AIII (third track of side A).
  if (/^(\p{L}|\p{Lu}{2})([\d.\- ]|$)|^\p{Lu}[IVX]+$/u.test(position)) return medium('sides');
  return medium('unknown');
}

/**
 * The side or disc a track is on. Sides are A1 or, with the number of the
 * record, 2-A1 and LP2-A1; sides A and B are on the first record, C and D on
 * the second. Discs are 1 or 2-5, prefixed in sets of several media (CD2-5).
 * `nouns` names the items that positions do not name.
 */
function spotOf({ kind, prefix, rest }: Medium, nouns: { sides: string; discs: string; items: string[] }): Spot | undefined {
  if (kind !== 'sides' && kind !== 'disc') return undefined;
  // 2-A1 and 2A1 are sides of the second record, 2A is part A of track 2.
  const side = kind === 'sides' || (!prefix && /^\d+(?:[-. ]+\p{L}(?=\d|$)|\p{L}(?=\d))/u.test(rest))
    ? /^(?:(\d+)[-. ]*)?((?![IVX])\p{L}(?=[IVX]+$)|\p{L}{1,2}(?!\p{L}))/u.exec(rest) ?? (kind === 'sides' && !prefix ? /^()(\d+)/.exec(rest) : null)
    : null;
  if (side) {
    const [, record, name] = side;
    const letter = name.toUpperCase();
    // A and B are sides 1 and 2; "Seite 1" and "Seite 2" too.
    const index = /^\d+$/.test(letter) ? Number(letter) - 1 : Math.max(letter.charCodeAt(0) - 65, 0) * Number(letter.length === 1);
    const number = record ? Number(record) : Math.floor(index / 2) + 1;
    return {
      id: [prefix, record, letter].filter(Boolean).join('-'),
      prefix,
      kind: 'side',
      item: `${prefix}${record ? '' : '~'}${number}`,
      medium: nounOf(prefix) ?? nouns.sides,
      side: letter,
      number,
    };
  }
  const number = Number(/^(\d+)[-.]\d/.exec(rest)?.[1] ?? 1);
  const id = `${prefix || 'D'}${number}`;
  return {
    id,
    prefix,
    kind: 'disc',
    item: id,
    medium: (prefix ? nounOf(prefix) ?? 'disc' : nounOf(nouns.items[number - 1]) ?? nouns.discs),
    number,
  };
}

const capitalize = (word: string) => word[0].toUpperCase() + word.slice(1);

/**
 * Names the parts: sides by their letter, discs by their medium, numbered
 * when there are several. When letters repeat, sides get the number of their
 * record (1A, 2A) or their prefix (7" A).
 */
function namePart(spot: Spot, spots: Spot[]): string {
  if (spot.kind === 'side') {
    const sides = spots.filter(({ kind }) => kind === 'side');
    const repeats = (group: Spot[]) => new Set(group.map(({ side }) => side)).size < group.length;
    if (!repeats(sides)) return spot.side!;
    return repeats(sides.filter(({ prefix }) => prefix === spot.prefix)) || !spot.prefix
      ? `${spot.number}${spot.side}`
      : `${spot.prefix} ${spot.side}`;
  }
  const discs = spots.filter(({ kind, medium }) => kind === 'disc' && medium === spot.medium);
  if (discs.length < 2) return capitalize(spot.medium);
  // Count them when their numbers say nothing (a CD-1 and a 1).
  const numbers = new Set(discs.map(({ number }) => number));
  return `${capitalize(spot.medium)} ${numbers.size === discs.length ? spot.number : discs.indexOf(spot) + 1}`;
}

// Movements numbered I, II, III, IV (or ll, lV): parts of a work, not sides.
const roman = (position: string) => position.toUpperCase().replace(/L/g, 'I');
const ROMAN = /^[IVX]+$/;
const isRomanList = (positions: string[]) => positions.some((position) => /^(II|III|IV|VI|VII|VIII|IX)$/.test(roman(position)));

/** Index tracks become one track or one per part, see above. */
function flatten(tracklist: DiscogsTrack[]) {
  const tracks: (PlayableTrack & { position: string; heading: string })[] = [];
  let heading = '';
  for (const track of tracklist) {
    if (track.type_ === 'heading') {
      heading = track.title === '-' ? '' : track.title;
    } else if (track.type_ === 'index') {
      const parts = (track.sub_tracks ?? []).filter((sub) => sub.type_ === 'track');
      const positions = parts.map((part) => cleanPosition(part.position));
      // Parts of one track only if they all belong to the same one: 1.1 and
      // 2.1 are more likely tracks of two discs.
      const bases = new Set(positions.map((position) => (position ? partOf(position) : '')));
      if (!bases.has(undefined) && bases.size <= 1 + Number(bases.has(''))) {
        tracks.push({
          position: [...bases].find(Boolean) ?? '',
          heading,
          title: track.title,
          duration: convertTimecode(track.duration)
            || parts.reduce((total, part) => total + convertTimecode(part.duration), 0),
          artists: track.artists ?? parts[0]?.artists,
        });
      } else {
        parts.forEach((part, i) => tracks.push({
          position: positions[i],
          heading,
          title: `${track.title}: ${part.title}`,
          duration: convertTimecode(part.duration),
          artists: part.artists ?? track.artists,
        }));
      }
    } else if (track.type_ === 'track') {
      tracks.push({
        position: cleanPosition(track.position),
        heading,
        title: track.title,
        duration: convertTimecode(track.duration),
        artists: track.artists,
      });
    }
  }
  return tracks;
}

const toTrack = ({ title, duration, artists }: PlayableTrack): PlayableTrack => (
  { title, duration, ...(artists ? { artists } : {}) }
);

/**
 * The tracks to scrobble, with the parts (sides, discs) they are on. Parts
 * are only set when there are at least two.
 */
export function groupTracks(tracklist: DiscogsTrack[] = [], formats: DiscogsFormat[] = []): { tracks: GroupedTrack[]; parts: Part[] } {
  const tracks = flatten(tracklist).filter((track) => !NO_AUDIO.test(track.title.trim()));
  const media = mediaOf(formats);
  const isVideo = (name: string) => VIDEO_FORMATS.test(name);
  // A video-only release (a concert DVD) is all video: nothing to tell apart.
  if (media.length && media.every(isVideo)) return { tracks: tracks.map(toTrack), parts: [] };

  // Item numbers only say which format they are when the tracklist numbers
  // every item; a VHS left out of the tracklist would shift them.
  const items = new Set(tracks.map(({ position }) => /^(\d+)-\d/.exec(position)?.[1]).filter(Boolean));
  const numbered = items.size === media.length ? media : [];
  const hasVideo = media.some(isVideo);
  // Unless the set has records or tapes, whose sides may be numbered so.
  const romans = !media.some((name) => /^(record|tape)$/.test(nounOf(name) ?? ''))
    && isRomanList(tracks.map(({ position }) => position));
  const entries: Entry[] = tracks.map(({ heading, position, ...track }) => ({
    ...track,
    medium: romans && ROMAN.test(roman(position))
      ? { kind: 'unknown', prefix: '', rest: position }
      // Headings may only mark video sections when the set has a video item.
      : mediumOf(position, numbered, hasVideo && VIDEO_HEADING.test(heading)),
  }));

  const audio = entries.filter(({ medium }) => medium.kind !== 'video' && medium.kind !== 'file');
  // Nothing but video or files, e.g. a concert DVD: keep it all.
  if (!audio.length) return { tracks: entries.map(toTrack), parts: [] };

  // One kind of item of the set is the main one, whichever comes first: the
  // records, the tapes or the discs. The others are bonus parts.
  const first = audio.find(({ medium }) => medium.kind !== 'unknown')?.medium;
  const isBonus = (medium: Medium) => Boolean(first) && medium.kind !== 'unknown'
    && (medium.kind !== first!.kind || medium.prefix !== first!.prefix);

  // Positions like A1 and 1 name no medium; the formats of the set do.
  const audioNouns = media.filter((name) => !isVideo(name)).map(nounOf);
  const isSides = (noun?: string) => noun === 'record' || noun === 'tape';
  const nouns = {
    sides: audioNouns.find(isSides) ?? 'record',
    // A vinyl release numbered 1-1, 2-1 has records; a vinyl and CD set, a CD.
    discs: audioNouns.find((noun) => noun && !isSides(noun))
      ?? (audioNouns.length && audioNouns.every(isSides) ? audioNouns[0]! : 'disc'),
    items: numbered,
  };
  const spots = new Map<string, Spot & { bonus: boolean }>();
  const placed = audio.map((entry) => {
    const spot = spotOf(entry.medium, nouns);
    if (spot && !spots.has(spot.id)) spots.set(spot.id, { ...spot, bonus: isBonus(entry.medium) });
    return { track: toTrack(entry), part: spot?.id };
  });
  // Tracks whose position names no medium go with the track before them, or
  // the first one after them.
  placed.forEach((entry, i) => {
    if (entry.part) return;
    entry.part = placed.slice(0, i).findLast((other) => other.part)?.part
      ?? placed.slice(i + 1).find((other) => other.part)?.part;
  });

  if (spots.size < 2) return { tracks: placed.filter(({ part }) => !part || !spots.get(part)?.bonus).map(({ track }) => track), parts: [] };
  const all = [...spots.values()];
  const parts = all.map((spot): Part => ({
    id: spot.id,
    name: namePart(spot, all),
    kind: spot.kind,
    item: spot.item,
    medium: spot.medium,
    ...(spot.bonus ? { bonus: true } : {}),
  }));
  return { tracks: placed.map(({ track, part }) => ({ ...track, part })), parts };
}

/** The tracks scrobbled by default: all but the bonus parts. */
export function selectTracks(tracklist: DiscogsTrack[] = [], formats: DiscogsFormat[] = []): PlayableTrack[] {
  const { tracks, parts } = groupTracks(tracklist, formats);
  const bonus = new Set(parts.filter((part) => part.bonus).map(({ id }) => id));
  return tracks.filter(({ part }) => !part || !bonus.has(part)).map(toTrack);
}
