import { chromium, FullConfig } from '@playwright/test';
import { config } from 'dotenv';
import path from 'path';

// Load .env so LASTFM_TEST_USERNAME / LASTFM_TEST_PASSWORD are available
config();

const AUTH_FILE = path.join(__dirname, '.auth/user.json');

export default async function globalSetup(_config: FullConfig) {
  const username = process.env.LASTFM_TEST_USERNAME;
  const password = process.env.LASTFM_TEST_PASSWORD;

  if (!username || !password) {
    throw new Error(
      '[global-setup] LASTFM_TEST_USERNAME and LASTFM_TEST_PASSWORD must be set in .env to run e2e tests.',
    );
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Kick off the OAuth flow — app redirects to Last.fm
    await page.goto('http://localhost:3000/auth/lastfm');

    // Wait for the Last.fm page to fully load
    await page.waitForLoadState('domcontentloaded', { timeout: 15_000 });

    // ── Step 1: Fill in credentials if a login form is visible ────────────────
    // Last.fm uses 'username_or_email' on their main login page;
    // the API-auth page may use 'username' or show both fields.
    const usernameInput = page.locator(
      'input[name="username_or_email"], input[name="username"]',
    ).first();

    if (await usernameInput.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await usernameInput.fill(username);

      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.fill(password);

      // Submit via Enter or the first visible submit button
      await Promise.race([
        page.keyboard.press('Enter'),
        page.locator('[type="submit"]').first().click(),
      ]).catch(() => page.keyboard.press('Enter'));

      // Wait for the page to transition after login
      await page.waitForLoadState('domcontentloaded', { timeout: 15_000 });
    }

    // ── Step 2: Click the "Allow" / "Grant Access" button if shown ────────────
    const allowButton = page
      .locator('button, input[type="submit"]')
      .filter({ hasText: /allow|grant|yes/i })
      .first();

    if (await allowButton.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await allowButton.click();
    }

    // ── Step 3: Wait for the app to complete the OAuth callback ───────────────
    await page.waitForURL('http://localhost:3000/', { timeout: 30_000 });

    // Persist session cookies for all authenticated test specs
    await context.storageState({ path: AUTH_FILE });
  } catch (err) {
    // Save a screenshot to help debug OAuth failures
    await page.screenshot({ path: 'e2e/.auth/global-setup-failure.png' }).catch(() => {});
    throw err;
  } finally {
    await browser.close();
  }
}
