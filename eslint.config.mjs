import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'public/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      'react/prop-types': 'off',
      // Cover art and avatars are served by the Discogs and Last.fm CDNs;
      // next/image optimization is disabled (see next.config.ts).
      '@next/next/no-img-element': 'off',
    },
  },
]);
