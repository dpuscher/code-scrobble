import type { NextApiRequest, NextApiResponse } from "next";
import { requireUser } from "../../../lib/withAuth";
import Release from "../../../app/models/release";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res);
  if (!user) return;

  try {
    const raw = req.query.id as string;
    const [barcode, id] = raw.split("id:");
    const query = id ? { id } : { barcode };

    const release = await Release.firstOrCreate(query);
    if (!release) return res.json({});

    // eslint-disable-next-line no-underscore-dangle
    const instantScrobble = user.isInstantScrobble(release._id);
    res.json({ instantScrobble, ...release.toJSON() });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
}
