/* eslint-disable no-param-reassign */
const path = require('path');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.BUNDLE_ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  useFileSystemPublicRoutes: false,
  poweredByHeader: false,

  webpack: (config, { dev, isServer, buildId }) => {
    if (!dev) {
      config.plugins.push(
        new SWPrecacheWebpackPlugin({
          cacheId: 'codescrobble',
          filepath: path.resolve('./public/static/service-worker.js'),
          minify: false,
          navigateFallback: "/",
          mergeStaticsConfig: false,
          staticFileGlobs: [
            '.next/bundles/**/*.js',
            '.next/static/**/*.{js,css,jpg,jpeg,png,svg,gif}',
          ],
          staticFileGlobsIgnorePatterns: [/_.*\.js$/, /\.map/],
          stripPrefixMulti: {
            '.next/bundles/pages/': `/_next/${buildId}/page/`,
            '.next/static/': '/_next/static/',
          },
          runtimeCaching: [
            { handler: 'fastest', urlPattern: /[.](jpe?g|png|svg|gif|ico)/ },
            { handler: 'networkFirst', urlPattern: /[.](js|css)/ },
            { handler: 'networkFirst', urlPattern: /\/detected\// },
            { handler: 'networkFirst', urlPattern: /\/session/ },
            { handler: 'networkFirst', urlPattern: /\/login/ },
            { handler: 'networkFirst', urlPattern: '/' },
          ],
          verbose: true,
        }),
      );

      if (!isServer) {
        const originalEntry = config.entry;
        config.entry = async () => {
          const entries = await originalEntry();
          entries['main.js'].push(path.resolve('./lib/offline'));
          entries['main.js'].unshift(path.resolve('./lib/polyfills.js'));
          return entries;
        };
      }
    }
    return config;
  },
});
