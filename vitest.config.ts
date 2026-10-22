import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/server/**/*.test.ts'],
          setupFiles: ['src/test/setup-server.ts'],
          // Each file gets its own in-memory PGlite database.
          testTimeout: 20_000,
        },
      },
      {
        extends: true,
        test: {
          name: 'client',
          environment: 'jsdom',
          include: ['src/{components,lib}/**/*.test.{ts,tsx}'],
          setupFiles: ['src/test/setup-client.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: ['src/test/**', '**/*.test.*', 'src/**/*.styles.js'],
    },
  },
});
