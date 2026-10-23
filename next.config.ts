import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

const nextConfig: NextConfig = {
  output: 'standalone',
  // next/image is not used, so its optional native image library can stay
  // out of the Docker image.
  images: { unoptimized: true },
  outputFileTracingExcludes: {
    '*': ['node_modules/sharp/**', 'node_modules/@img/**'],
  },
  poweredByHeader: false,
  // Cloudflare (in front of staging and production) compresses with zstd or
  // Brotli, but passes gzip from the origin through unchanged, so Next.js
  // must not gzip. Direct access to the container is uncompressed.
  compress: false,
  turbopack: {
    rules: {
      // zxing-wasm fetches and compiles its WebAssembly itself; importing the
      // file only has to emit it and return its URL.
      '*.wasm': { type: 'asset' },
    },
  },
  reactStrictMode: true,
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
        // The Content-Security-Policy is set per request in src/proxy.ts.
        source: '/:path*',
        headers: [
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
