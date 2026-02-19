import type { NextApiRequest, NextApiResponse } from 'next';
import { requireUser } from '../../lib/withAuth';
const Release = require('../../app/models/release');
const LastFM = require('../../app/lastfm');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireUser(req, res);
  if (!user) return;

  try {
    const { id: releaseId, autoScrobble } = req.body;

    const release = await Release.findOne({ _id: releaseId });
    if (!release) {
      return res.status(400).json({ error: 'Release not found' });
    }

    user.history = [{ id: releaseId }].concat(user.history.slice(0, 19));
    if (autoScrobble) user.instantScrobbles.addToSet(releaseId);
    await user.save();

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log([
        'Scrobble:',
        '-------------------------------',
        `User: ${user.name}`,
        `Release: ${JSON.stringify(release.toJSON(), ['id', 'artist', 'title'], 2)}`,
      ].join('\n'));
      return res.json({});
    }

    const response = await LastFM.scrobbleTracks(user.name, user.key, release);
    res.json(response);
  } catch (error) {
    res.status(400).json({ error });
  }
}
