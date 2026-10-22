import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { APP_PORT, KNOWN_BARCODE, MOCK_PORT } from './e2e/fixtures.ts';
import { E2E_DATABASE_URL } from './e2e/support/db.ts';
import { writeBarcodeVideo } from './e2e/support/barcode-video.ts';

const CI = !!process.env.CI;
const mock = `http://localhost:${MOCK_PORT}`;
const cameraVideo = writeBarcodeVideo(KNOWN_BARCODE, path.resolve('e2e/.generated/barcode.y4m'));

// Runs the standalone server exactly like the Docker image does.
const startApp = 'node scripts/prepare-standalone.mjs && cd .next/standalone && node server.js';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/, use: { ...devices['Pixel 7'] } },
    {
      name: 'mobile-chrome',
      dependencies: ['setup'],
      use: {
        ...devices['Pixel 7'],
        storageState: 'e2e/.auth/user.json',
        permissions: ['camera'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            `--use-file-for-fake-video-capture=${cameraVideo}`,
          ],
        },
      },
    },
  ],
  webServer: [
    {
      command: 'node e2e/mock-server.ts',
      url: `${mock}/__scrobbles`,
      reuseExistingServer: !CI,
    },
    {
      command: process.env.E2E_SKIP_BUILD ? startApp : `yarn build && ${startApp}`,
      url: `http://localhost:${APP_PORT}/health`,
      reuseExistingServer: !CI,
      timeout: 300_000,
      env: {
        PORT: String(APP_PORT),
        DATABASE_URL: E2E_DATABASE_URL,
        SERVER_URL: `http://localhost:${APP_PORT}`,
        LASTFM_KEY: 'e2e-key',
        LASTFM_SECRET: 'e2e-secret',
        LASTFM_API_URL: `${mock}/lastfm/api/`,
        LASTFM_AUTH_URL: `${mock}/lastfm/auth/`,
        DISCOGS_KEY: 'e2e-key',
        DISCOGS_SECRET: 'e2e-secret',
        DISCOGS_API_URL: `${mock}/discogs`,
      },
    },
  ],
});
