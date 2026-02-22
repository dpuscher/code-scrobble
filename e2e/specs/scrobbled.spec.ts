import { test, expect } from '@playwright/test';
import { AUTH_FILE, KNOWN_BARCODE } from '../constants';

test.use({ storageState: AUTH_FILE });

test.setTimeout(60_000);

test.describe('Scrobbled page (authenticated)', () => {
  test('shows success message after navigating to the scrobbled page', async ({ page }) => {
    await page.goto(`/scrobbled/${KNOWN_BARCODE}`);

    // The page fetches release data via fetchReleaseIfNeeded, then renders the success UI
    // Note: "sucessfully" is a typo intentionally kept from the source code
    await expect(
      page.locator('text=Record sucessfully scrobbled to Last.fm'),
    ).toBeVisible({ timeout: 30_000 });
  });

  test('"Scan another code" button navigates back to /', async ({ page }) => {
    await page.goto(`/scrobbled/${KNOWN_BARCODE}`);

    await expect(
      page.locator('text=Scan another code'),
    ).toBeVisible({ timeout: 30_000 });

    await page.locator('text=Scan another code').click();
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});
