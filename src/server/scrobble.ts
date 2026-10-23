import {
  preferenceKey, scopeOf, selectedTracks, toSelection,
} from '../lib/parts';
import type { ScrobbleRequest, ScrobbleResponse } from '../lib/types';
import { config } from './config';
import { getDb } from './db';
import type { User } from './db/schema';
import {
  buildScrobbles, LastFmError, ScrobbleError, scrobbleTracks,
} from './lastfm';
import { logOut } from './session';
import { addAutoScrobble, addToHistory, setPartsPreference } from './users';

/**
 * Scrobbles the picked sides or discs of a release, by default all but the
 * bonus ones, and records it in the history once Last.fm accepted any.
 */
export async function scrobbleRelease(user: User, request: ScrobbleRequest): Promise<ScrobbleResponse> {
  const id = Number(request.id);
  const release = Number.isInteger(id)
    ? await getDb().query.releases.findFirst({ where: (r, { eq }) => eq(r.id, id) })
    : undefined;
  if (!release) return { status: 'invalid', error: 'Release not found' };

  const parts = release.parts ?? [];
  const selection = toSelection(parts, request.parts);
  const tracks = selectedTracks(release.tracks, parts, selection);
  if (!tracks.length) return { status: 'invalid', error: 'No tracks selected' };

  // Tracks an earlier attempt sent before it failed; a retry continues after them.
  const from = Math.min(Math.max(Math.trunc(Number(request.from) || 0), 0), tracks.length);
  const record = async () => {
    await addToHistory(user.id, release.id);
    if (request.autoScrobble) await addAutoScrobble(user.id, release.id, selection);
    // Picked on the release page: preselect the same next time.
    const scope = request.remember ? scopeOf(parts, selection) : undefined;
    if (scope) await setPartsPreference(user.id, preferenceKey(parts), scope);
  };

  if (!config.lastfm.scrobblingEnabled) {
    console.log(`Scrobbling disabled, skipped "${release.artist} - ${release.title}" for ${user.name}`);
    await record();
    return { status: 'scrobbled', accepted: 0, ignored: 0 };
  }

  try {
    const result = await scrobbleTracks(user.sessionKey, buildScrobbles({ ...release, tracks: tracks.slice(from) }));
    // Nothing reached the profile when Last.fm ignored every track.
    if (result.accepted > 0 || from > 0) await record();
    return { status: 'scrobbled', ...result };
  } catch (error) {
    if (!(error instanceof ScrobbleError)) throw error;
    console.error(`Scrobbling for ${user.name} failed`, error.cause);
    if (error.cause instanceof LastFmError && error.cause.code === 9) {
      // Invalid session key: the user revoked access on last.fm and has to
      // log in again.
      await logOut();
      return { status: 'login' };
    }
    return { status: 'failed', sent: from + error.sent };
  }
}
