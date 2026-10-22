import type { NextApiRequest, NextApiResponse } from 'next';
import { config } from '@/server/config';
import { getAuthUrl } from '@/server/lastfm';

// Served at /auth/lastfm (see rewrites in next.config.ts).
export default function login(_req: NextApiRequest, res: NextApiResponse) {
  res.redirect(302, getAuthUrl(`${config.serverUrl}/auth/lastfm/callback`));
}
