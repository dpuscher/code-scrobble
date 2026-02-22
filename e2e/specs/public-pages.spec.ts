import { test, expect } from '@playwright/test';

// No storageState — these pages are accessible without authentication
test.describe('Public pages', () => {
  test('/login — shows CodeScrobble branding and Last.fm login button', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);

    // Logo image is present (img with alt="CodeScrobble")
    await expect(page.locator('img[alt="CodeScrobble"]')).toBeVisible();

    // Last.fm login button links to /auth/lastfm
    const loginButton = page.locator('a[href="/auth/lastfm"]');
    await expect(loginButton).toBeVisible();

    // Legal links (links to /legal and /privacy) are present
    await expect(page.locator('a[href="/legal"]')).toBeVisible();
    await expect(page.locator('a[href="/privacy"]')).toBeVisible();
  });

  test('/legal — accessible without authentication, shows legal content', async ({ page }) => {
    await page.goto('/legal');
    // Should NOT redirect to login
    await expect(page).toHaveURL(/\/legal/);
    await expect(page.locator('h1')).toContainText('Legal Notice');
  });

  test('/privacy — accessible without authentication, shows privacy content', async ({ page }) => {
    await page.goto('/privacy');
    // Should NOT redirect to login
    await expect(page).toHaveURL(/\/privacy/);
    // Privacy page should have some heading or content
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
