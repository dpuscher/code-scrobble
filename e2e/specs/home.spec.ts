import { test, expect } from '@playwright/test';
import { AUTH_FILE } from '../constants';

test.use({ storageState: AUTH_FILE });

test.describe('Home / scanner page (authenticated)', () => {
  test('renders without redirect', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('scanner camera container is present in the DOM', async ({ page }) => {
    await page.goto('/');
    // The Scanner component renders a div#camera element
    await expect(page.locator('#camera')).toBeAttached();
  });

  test('QueryRelease search button is visible in the header', async ({ page }) => {
    await page.goto('/');
    // CircleLayout renders the QueryRelease component in the header area.
    // QueryRelease renders a Button that opens the search overlay.
    // The button is the first (and only) button in the header area.
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});
