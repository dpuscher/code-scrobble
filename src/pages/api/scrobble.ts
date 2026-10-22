import { authenticatedApi } from '@/server/api';
import { getDb } from '@/server/db';
import { buildScrobbles, LastFmError, scrobbleTracks } from '@/server/lastfm';
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

    await addToHistory(user.id, release.id);
    if (req.body.autoScrobble) await addAutoScrobble(user.id, release.id);

    if (!config.lastfm.scrobblingEnabled) {
      console.log(`Scrobbling disabled, skipped "${release.artist} - ${release.title}" for ${user.name}`);
      return res.json({});
    }

    try {
      return res.json(await scrobbleTracks(user.sessionKey, buildScrobbles(release)));
    } catch (error) {
      if (!(error instanceof LastFmError)) throw error;
      console.error(`Scrobbling for ${user.name} failed`, error);
      if (error.code === 9) {
        // Invalid session key: the user revoked access on last.fm and has
        // to log in again.
        await destroySession(req, res);
        return res.status(401).json({ error: 'Last.fm session expired' });
      }
      return res.status(502).json({ error: 'Last.fm request failed' });
    }
  },
});
