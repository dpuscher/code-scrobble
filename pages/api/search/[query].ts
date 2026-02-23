import type { NextApiRequest, NextApiResponse } from 'next';
import { requireUser } from '../../../lib/withAuth';
import * as Discogs from '../../../app/discogs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res);
  if (!user) return;

  try {
    const results = await Discogs.search(req.query.query as string);
    res.json(results);
  } catch (error) {
    res.status(400).json({ error });
  }
}
