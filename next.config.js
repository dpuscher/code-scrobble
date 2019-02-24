/* eslint-disable no-param-reassign */
const path = require('path');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

module.exports = {
  useFileSystemPublicRoutes: false,
  poweredByHeader: false,

  webpack: (config, { dev, isServer, buildId }) => {
    if (!isServer) {
      const oldEntry = config.entry;
      config.entry = () => oldEntry().then((entry) => {
        entry['main.js'].push(path.resolve('./lib/offline'));
        return entry;
      });
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
            { handler: 'fastest', urlPattern: /[.](jpe?g|png|svg|gif)/ },
            { handler: 'networkFirst', urlPattern: /^https.*(js|css)/ },
          ],
          verbose: true,
        }));
      }
    }
    return config;
  },
};
