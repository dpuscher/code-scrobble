import { authenticatedApi } from '@/server/api';
import { getDb } from '@/server/db';
import {
  buildScrobbles, LastFmError, ScrobbleError, scrobbleTracks,
} from '@/server/lastfm';
import { destroySession } from '@/server/session';
import { config } from '@/server/config';
import { addAutoScrobble, addToHistory } from '@/server/users';

export default authenticatedApi({
  POST: async (req, res, user) => {
    const id = Number(req.body?.id);
    const release = Number.isInteger(id)
      ? await getDb().query.releases.findFirst({ where: (r, { eq }) => eq(r.id, id) })
      : undefined;
    if (!release) return res.status(400).json({ error: 'Release not found' });

    // Tracks an earlier attempt sent before it failed; a retry continues after them.
    const from = Math.min(Math.max(Math.trunc(Number(req.body.from) || 0), 0), release.tracks.length);
    const record = async () => {
      await addToHistory(user.id, release.id);
      if (req.body.autoScrobble) await addAutoScrobble(user.id, release.id);
    };

    if (!config.lastfm.scrobblingEnabled) {
      console.log(`Scrobbling disabled, skipped "${release.artist} - ${release.title}" for ${user.name}`);
      await record();
      return res.json({});
    }

    try {
      const result = await scrobbleTracks(
        user.sessionKey,
        buildScrobbles({ ...release, tracks: release.tracks.slice(from) }),
      );
      // Nothing reached the profile when Last.fm ignored every track.
      if (result.accepted > 0 || from > 0) await record();
      return res.json(result);
    } catch (error) {
      if (!(error instanceof ScrobbleError)) throw error;
      console.error(`Scrobbling for ${user.name} failed`, error.cause);
      if (error.cause instanceof LastFmError && error.cause.code === 9) {
        // Invalid session key: the user revoked access on last.fm and has
        // to log in again.
        await destroySession(req, res);
        return res.status(401).json({ error: 'Last.fm session expired' });
      }
      return res.status(502).json({ error: 'Last.fm request failed', sent: from + error.sent });
    }
  },
});
