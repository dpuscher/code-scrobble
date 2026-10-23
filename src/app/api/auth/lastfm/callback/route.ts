import type { NextRequest } from 'next/server';
import { config } from '@/server/config';
import { getSession, getUserInfo } from '@/server/lastfm';
import { logIn } from '@/server/session';
import { upsertUser } from '@/server/users';

const redirectTo = (path: string) => Response.redirect(`${config.serverUrl}${path}`, 302);

// Served at /auth/lastfm/callback; Last.fm redirects here with ?token=...
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return redirectTo('/login');
  try {
    const { name, key } = await getSession(token);
    const info = await getUserInfo(name);
    const user = await upsertUser({ name, sessionKey: key, ...info });
    await logIn(user.id);
    return redirectTo('/');
  } catch (error) {
    console.error('Last.fm login failed', error);
    return redirectTo('/login');
  }
}
