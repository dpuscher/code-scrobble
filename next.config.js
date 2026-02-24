const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.BUNDLE_ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["styled-components"],
};

module.exports = withBundleAnalyzer(nextConfig);
