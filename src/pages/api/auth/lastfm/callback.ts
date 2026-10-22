import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession, getUserInfo } from '@/server/lastfm';
import { createSession } from '@/server/session';
import { upsertUser } from '@/server/users';

// Served at /auth/lastfm/callback; Last.fm redirects here with ?token=...
export default async function callback(req: NextApiRequest, res: NextApiResponse) {
  const token = typeof req.query.token === 'string' ? req.query.token : '';
  if (!token) return res.redirect(302, '/login');
  try {
    const { name, key } = await getSession(token);
    const info = await getUserInfo(name);
    const user = await upsertUser({ name, sessionKey: key, ...info });
    await createSession(res, user.id);
    return res.redirect(302, '/');
  } catch (error) {
    console.error('Last.fm login failed', error);
    return res.redirect(302, '/login');
  }
}
