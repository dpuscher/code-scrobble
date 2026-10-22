import type { NextApiRequest, NextApiResponse } from 'next';
import { destroySession } from '@/server/session';

// Served at /logout.
export default async function logout(req: NextApiRequest, res: NextApiResponse) {
  await destroySession(req, res);
  res.redirect(302, '/');
}
