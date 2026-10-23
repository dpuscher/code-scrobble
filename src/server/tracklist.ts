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
 * - Only one kind of medium is scrobbled: a vinyl release with a bonus CD of
 *   the same songs would otherwise be scrobbled twice. Video content (DVDs,
 *   Blu-rays, enhanced CD videos) and download files are left out whenever
 *   there is audio on a disc, record or tape.
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

type Kind = 'sides' | 'disc' | 'video' | 'file' | 'unknown';

/** What a track is on: the kind of medium, and the prefix that names its item in a set. */
type Medium = { kind: Kind; prefix: string };

type Entry = PlayableTrack & { medium: Medium };

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
    if (prefix) return { kind, prefix: samePrefix(prefix) };
  }
  if (videoSection) return { kind: 'video', prefix: '' };
  if (/^\d/.test(position)) {
    // 2-5 is the fifth track of the second item, which may be a DVD.
    const item = /^(\d+)-\d/.exec(position);
    if (item && VIDEO_FORMATS.test(media[Number(item[1]) - 1] ?? '')) return { kind: 'video', prefix: '' };
    return { kind: 'disc', prefix: '' };
  }
  // A1, B12, A.1, A-1, a1, AA (double A side), AB1 (second groove of side A).
  if (/^(\p{L}|\p{Lu}{2})([\d.\- ]|$)/u.test(position)) return { kind: 'sides', prefix: '' };
  return { kind: 'unknown', prefix: '' };
}

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

export function selectTracks(tracklist: DiscogsTrack[] = [], formats: DiscogsFormat[] = []): PlayableTrack[] {
  const tracks = flatten(tracklist).filter((track) => !NO_AUDIO.test(track.title.trim()));
  const media = mediaOf(formats);
  const isVideo = (name: string) => VIDEO_FORMATS.test(name);
  // A video-only release (a concert DVD) is all video: nothing to tell apart.
  if (media.length && media.every(isVideo)) return tracks.map(toTrack);

  // Item numbers only say which format they are when the tracklist numbers
  // every item; a VHS left out of the tracklist would shift them.
  const items = new Set(tracks.map(({ position }) => /^(\d+)-\d/.exec(position)?.[1]).filter(Boolean));
  const numbered = items.size === media.length ? media : [];
  const hasVideo = media.some(isVideo);
  const entries: Entry[] = tracks.map(({ heading, position, ...track }) => ({
    ...track,
    // Headings may only mark video sections when the set has a video item.
    medium: mediumOf(position, numbered, hasVideo && VIDEO_HEADING.test(heading)),
  }));

  const audio = entries.filter(({ medium }) => medium.kind !== 'video' && medium.kind !== 'file');
  // Nothing but video or files, e.g. a concert DVD: keep it all.
  if (!audio.length) return entries.map(toTrack);

  // One kind of item of the set, whichever comes first: the records, the
  // tapes or the discs. Tracks whose position names no medium stay.
  const first = audio.find(({ medium }) => medium.kind !== 'unknown')?.medium;
  return audio
    .filter(({ medium }) => !first || medium.kind === 'unknown'
      || (medium.kind === first.kind && medium.prefix === first.prefix))
    .map(toTrack);
}
