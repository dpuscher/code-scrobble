import { test, expect } from '@playwright/test';
import { AUTH_FILE } from '../constants';

// Unauthenticated tests — no storageState
test.describe('Auth redirects (unauthenticated)', () => {
  test('GET / redirects to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('GET /detected/:barcode redirects to /login', async ({ page }) => {
    await page.goto('/detected/123456789');
    await expect(page).toHaveURL(/\/login/);
  });

  test('GET /scrobbled/:barcode redirects to /login', async ({ page }) => {
    await page.goto('/scrobbled/123456789');
    await expect(page).toHaveURL(/\/login/);
  });
});

// Authenticated test — use saved storageState
test.describe('Auth redirects (authenticated)', () => {
  test.use({ storageState: AUTH_FILE });

  test('GET /login redirects to / when already authenticated', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});
