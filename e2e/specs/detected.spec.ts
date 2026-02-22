import { test, expect } from '@playwright/test';
import { AUTH_FILE, KNOWN_BARCODE } from '../constants';

test.use({ storageState: AUTH_FILE });

// Allow extra time for the real Discogs API to respond
test.setTimeout(60_000);

test.describe('Detected page (authenticated, real Discogs API)', () => {
  test('loads release data for a known barcode', async ({ page }) => {
    await page.goto(`/detected/${KNOWN_BARCODE}`);

    // Wait for the loading spinner to disappear (Discogs API has responded)
    // SearchRelease renders Loading while fetching, then shows buttons
    await expect(page.locator('text=Cancel')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('text=Scrobble')).toBeVisible({ timeout: 30_000 });
  });

  test('auto-scrobble checkbox is present after release loads', async ({ page }) => {
    await page.goto(`/detected/${KNOWN_BARCODE}`);
    await expect(page.locator('text=Cancel')).toBeVisible({ timeout: 30_000 });

    // Auto-scrobble checkbox label text
    await expect(page.locator('text=Auto-scrobble on next scan')).toBeVisible();
  });

  test('clicking scrobble triggers POST /api/scrobble and redirects to /scrobbled', async ({ page }) => {
    // Mock the scrobble endpoint to prevent real Last.fm submissions
    await page.route('**/api/scrobble', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await page.goto(`/detected/${KNOWN_BARCODE}`);
    await expect(page.locator('text=Scrobble')).toBeVisible({ timeout: 30_000 });

    // Click the Scrobble button
    await page.locator('text=Scrobble').click();

    // Should show "Sending data to Last.fm" loading text
    await expect(page.locator('text=Sending data to Last.fm')).toBeVisible({ timeout: 10_000 });

    // After the mocked scrobble resolves, should redirect to the scrobbled page
    await page.waitForURL(`**/scrobbled/${KNOWN_BARCODE}`, { timeout: 15_000 });
  });

  test('clicking cancel navigates back to /', async ({ page }) => {
    await page.goto(`/detected/${KNOWN_BARCODE}`);
    await expect(page.locator('text=Cancel')).toBeVisible({ timeout: 30_000 });

    await page.locator('text=Cancel').click();
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});
