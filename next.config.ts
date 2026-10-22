import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self'${isDev ? " 'unsafe-eval' 'unsafe-inline'" : ''}`,
  // styled-components injects <style> tags at runtime.
  "style-src 'self' 'unsafe-inline'",
  // Cover art and avatars come from the Discogs and Last.fm CDNs.
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const nextConfig: NextConfig = {
  output: 'standalone',
  // next/image is not used, so its optional native image library can stay
  // out of the Docker image.
  images: { unoptimized: true },
  outputFileTracingExcludes: {
    '*': ['node_modules/sharp/**', 'node_modules/@img/**'],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  async rewrites() {
    // Keep the public URLs of CodeScrobble 1.x (the Last.fm callback URL is
    // registered with Last.fm).
    return [
      { source: '/auth/lastfm', destination: '/api/auth/lastfm' },
      { source: '/auth/lastfm/callback', destination: '/api/auth/lastfm/callback' },
      { source: '/logout', destination: '/api/logout' },
      { source: '/health', destination: '/api/health' },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
          ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]),
        ],
      },
      {
        // Retired service worker; must never be cached so browsers pick up the
        // self-unregistering version.
        source: '/:sw(service-worker.js|static/service-worker.js)',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
  },
};

export default bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(nextConfig);
