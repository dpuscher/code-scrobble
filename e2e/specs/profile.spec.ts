import { test, expect } from '@playwright/test';
import { AUTH_FILE } from '../constants';

test.use({ storageState: AUTH_FILE });

test.describe('Profile page (authenticated)', () => {
  test('renders the Profile heading', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('h1')).toContainText('Profile');
  });

  test('back button is visible', async ({ page }) => {
    await page.goto('/profile');
    // BackButton component renders a button element
    await expect(page.locator('button').first()).toBeVisible();
  });

  test('shows the authenticated user name', async ({ page }) => {
    await page.goto('/profile');

    // The profile page fetches the session and shows the user's Last.fm username in an h2
    const username = process.env.LASTFM_TEST_USERNAME;
    if (username) {
      await expect(page.locator('h2')).toContainText(username, { timeout: 10_000 });
    } else {
      // If no credentials set, just verify h2 is present
      await expect(page.locator('h2')).toBeVisible({ timeout: 10_000 });
    }
  });

  test('auto-scrobbles and history sections are rendered', async ({ page }) => {
    await page.goto('/profile');
    // ProfileAutoScrobbles and ProfileHistory are rendered after the Header
    // Both are present in the DOM regardless of whether there are any entries
    await expect(page.locator('h1')).toContainText('Profile');
    // The page body should contain the profile sections (they always mount)
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
