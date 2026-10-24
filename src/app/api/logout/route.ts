import type { NextRequest } from 'next/server';
import { config } from '@/server/config';
import { isSameOrigin } from '@/server/origin';
import { logOut } from '@/server/session';

// Served at /logout. POST only, so other sites cannot log users out.
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request.headers)) return Response.json({ error: 'Forbidden' }, { status: 403 });
  await logOut();
  // 303: follow up with a GET of the start page.
  return Response.redirect(`${config.serverUrl}/`, 303);
}
