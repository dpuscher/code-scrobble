import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config.ts';

// Captures every screen at phone and desktop size for design reviews:
//   yarn screenshots   (writes to test-results/screens, or $SHOT_DIR)
export default defineConfig({
  ...base,
  testDir: 'e2e/capture',
  testMatch: /\.capture\.ts$/,
  retries: 0,
  reporter: [['list']],
  projects: [
    { name: 'setup', testDir: 'e2e', testMatch: /auth\.setup\.ts/, use: { ...devices['Pixel 7'] } },
    {
      name: 'phone',
      dependencies: ['setup'],
      use: { ...devices['Pixel 7'], storageState: 'e2e/.auth/user.json' },
    },
    {
      name: 'desktop',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, storageState: 'e2e/.auth/user.json' },
    },
  ],
});
