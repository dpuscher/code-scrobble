import find from 'lodash/find';
import sortBy from 'lodash/sortBy';
import compact from 'lodash/compact';
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireUser } from '../../../lib/withAuth';
const Release = require('../../../app/models/release');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res);
  if (!user) return;

  try {
    const { history } = user;
    const releases = await Release.find({ _id: { $in: history.map((h: any) => h.id) } });

    const data = history.map((item: any) => {
      // eslint-disable-next-line no-underscore-dangle
      const release = find(releases, (r: any) => String(r._id) === item.id);
      if (!release) return undefined;
      return {
        // eslint-disable-next-line no-underscore-dangle
        id: item._id,
        time: item.time,
        artist: release.artist,
        title: release.title,
        year: release.year,
        barcode: release.barcode,
        discogsId: release.id,
      };
    });

    res.json(sortBy(compact(data), ['time']).reverse());
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
