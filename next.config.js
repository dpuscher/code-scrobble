const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.BUNDLE_ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["redis", "@redis/client", "mongoose", "lastfmapi", "disconnect"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "lastfm.freetls.fastly.net" }],
    // Match exactly the 4 size buckets Last.fm's CDN supports.
    // This is effectively scoped to LastFmImage since that's the only
    // <Image> consumer in the app — Next.js has no per-component API for this.
    imageSizes: [34, 64, 174, 300],
    deviceSizes: [],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
