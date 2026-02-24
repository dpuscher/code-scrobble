import type { NextApiRequest, NextApiResponse } from "next";
import { requireUser } from "../../lib/withAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res);
  if (!user) return;

  res.json(user.toJSON());
}
