import sortBy from 'lodash/sortBy';
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireUser } from '../../../lib/withAuth';
const Release = require('../../../app/models/release');
const User = require('../../../app/models/user');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    try {
      const releases = await Release.find({ _id: { $in: user.instantScrobbles } });

      const data = releases.map((release: any) => ({
        // eslint-disable-next-line no-underscore-dangle
        id: release._id,
        artist: release.artist,
        title: release.title,
        year: release.year,
      }));

      return res.json(sortBy(data, ['artist', 'title']));
    } catch (err) {
      return res.status(400).json({ err });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      // eslint-disable-next-line no-underscore-dangle
      await User.updateOne({ _id: user._id }, { $pullAll: { instantScrobbles: [id] } });
      return res.json({});
    } catch (error) {
      return res.status(400).json({ error });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
