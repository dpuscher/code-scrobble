import { type NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookie } from './server/sessionCookie';

/**
 * For pages:
 * - Sets a per-request nonce-based Content-Security-Policy. Next.js reads the
 *   nonce from the request header and applies it to its own scripts, so no
 *   'unsafe-inline' is needed for scripts.
 * - Renews the session cookie, so it expires 30 days after the last visit.
 *   Pages cannot set cookies themselves; the database side of the session is
 *   renewed in src/server/session.ts.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV !== 'production';

  const policy = [
    "default-src 'self'",
    // 'wasm-unsafe-eval' lets the ZXing barcode reader compile its WebAssembly
    // (it does not allow eval of JavaScript).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ''}`,
    // Stylesheets are files; only style attributes (cover art backgrounds,
    // Next.js' route announcer) are inline. The dev server injects
    // CSS through <style> tags without a nonce.
    isDev ? "style-src 'self' 'unsafe-inline'" : `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    // Cover art and avatars come from the Discogs and Last.fm CDNs.
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob:",
    `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', policy);
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (session) response.cookies.set(sessionCookie(session));
  return response;
}

export const config = {
  matcher: [{
    source: '/((?!api|health|_next/static|_next/image|static|favicon.ico|service-worker.js).*)',
    missing: [
      { type: 'header', key: 'next-router-prefetch' },
      { type: 'header', key: 'purpose', value: 'prefetch' },
    ],
  }],
};
