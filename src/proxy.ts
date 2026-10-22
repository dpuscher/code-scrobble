import { type NextRequest, NextResponse } from 'next/server';

/**
 * Sets a per-request nonce-based Content-Security-Policy for pages. Next.js
 * reads the nonce from the request header and applies it to its own inline
 * bootstrap script, so no 'unsafe-inline' is needed for scripts.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV !== 'production';

  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // Stylesheets are files; only style attributes (cover art backgrounds,
    // Next.js' route announcer, nprogress) are inline. The dev server injects
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
