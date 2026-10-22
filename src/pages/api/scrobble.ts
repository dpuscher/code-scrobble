import { authenticatedApi } from '@/server/api';
import { getDb } from '@/server/db';
import { buildScrobbles, scrobbleTracks } from '@/server/lastfm';
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

    const response = await scrobbleTracks(user.sessionKey, buildScrobbles(release));
    return res.json(response);
  },
});
