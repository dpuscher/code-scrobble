/* eslint-disable no-param-reassign */
const path = require('path');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');

module.exports = withBundleAnalyzer({
  useFileSystemPublicRoutes: false,
  poweredByHeader: false,

  analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
  analyzeBrowser: ['browser', 'both'].includes(process.env.BUNDLE_ANALYZE),
  bundleAnalyzerConfig: {
    server: {
      analyzerMode: 'static',
      reportFilename: '../bundles/server.html',
    },
    browser: {
      analyzerMode: 'static',
      reportFilename: '../bundles/client.html',
    },
  },

  webpack: (config, { dev, isServer, buildId }) => {
    if (!isServer) {
      const oldEntry = config.entry;
      config.entry = () => oldEntry().then((entry) => {
        entry['main.js'].push(path.resolve('./lib/offline'));
        return entry;
      });

      config.plugins.push(new CleanWebpackPlugin());

      if (!dev) {
        config.plugins.push(new SWPrecacheWebpackPlugin({
          cacheId: 'codescrobble',
          filepath: path.resolve('./static/service-worker.js'),
          minify: false,
          navigateFallback: process.env.SERVER_URL,
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
        }));
      }
    }
    return config;
  },
});
