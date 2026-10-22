import { anonymous, expect, test } from './support/test.ts';

test.use(anonymous);

test.describe('anonymous visitors', () => {
  for (const path of ['/', '/profile', '/detected/4006381333931', '/scrobbled/4006381333931']) {
    test(`are sent from ${path} to the login page`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole('link', { name: /login with/i })).toHaveAttribute('href', '/auth/lastfm');
      await expect(page.getByText('CodeScrobble makes it easy to scrobble')).toBeVisible();
    });
  }

  test('can read the legal notice and privacy policy', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Legal' }).click();
    await expect(page.getByRole('heading', { name: 'Legal Notice' })).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByRole('link', { name: 'Privacy' }).click();
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByText('Google Analytics')).toHaveCount(0);
  });

  test('get 401 from the API', async ({ request }) => {
    const response = await request.get('/api/session');
    expect(response.status()).toBe(401);
  });
});

test('serves health, security headers and the retired service worker', async ({ request }) => {
  const health = await request.get('/health');
  expect(await health.json()).toEqual({ status: 'ok' });

  const page = await request.get('/login');
  const headers = page.headers();
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-powered-by']).toBeUndefined();

  const sw = await request.get('/service-worker.js');
  expect(sw.ok()).toBe(true);
  expect(sw.headers()['cache-control']).toContain('no-store');
  expect(await sw.text()).toContain('unregister');
});
