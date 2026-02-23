import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/legal', '/privacy', '/api/auth/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, Next.js internals, and static assets
  if (
    pathname.startsWith('/api/')
    || pathname.startsWith('/_next/')
    || pathname.startsWith('/static/')
    || pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Skip public pages
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Redirect to login if session cookie is absent
  const sessionCookie = request.cookies.get('code-scrobble-session');
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
