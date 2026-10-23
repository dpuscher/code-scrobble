// Last.fm's ignoredMessage codes, see https://www.last.fm/api/show/track.scrobble
const REASONS: Record<number, string> = {
  1: 'Last.fm does not accept scrobbles of this artist.',
  2: 'Last.fm does not accept scrobbles of this track.',
  3: 'The scrobble time was too far in the past.',
  4: 'The scrobble time was too far in the future.',
  5: 'Your daily scrobble limit on Last.fm is reached.',
};

/** Explains why Last.fm ignored scrobbles, if it said why. */
export const ignoredReason = (code?: number) => (code ? REASONS[code] : undefined);
