import type { NextApiRequest, NextApiResponse } from 'next';
import { isSameOrigin } from '@/server/origin';
import { destroySession } from '@/server/session';

// Served at /logout. POST only, so other sites cannot log users out.
export default async function logout(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' || !isSameOrigin(req)) {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  await destroySession(req, res);
  // 303: follow up with a GET of the start page.
  return res.redirect(303, '/');
}
