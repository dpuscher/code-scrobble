import { config } from '@/server/config';
import { getAuthUrl } from '@/server/lastfm';

// Served at /auth/lastfm (see rewrites in next.config.ts).
export function GET() {
  return Response.redirect(getAuthUrl(`${config.serverUrl}/auth/lastfm/callback`), 302);
}
