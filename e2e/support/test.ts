import { test as base, expect } from '@playwright/test';
import { MOCK_PORT } from '../fixtures.ts';
import { resetUserData } from './db.ts';

export const MOCK_URL = `http://localhost:${MOCK_PORT}`;

/**
 * Fails a test on uncaught page errors or console errors (which includes
 * Content-Security-Policy violations), and resets per-user data and the mock
 * Last.fm scrobble log before each test.
 */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [async ({ page, request }, use) => {
    await resetUserData();
    await request.delete(`${MOCK_URL}/__scrobbles`);

    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await use(errors);
    expect(errors, 'browser console errors').toEqual([]);
  }, { auto: true }],
});

export { expect };

export async function receivedScrobbles(request: import('@playwright/test').APIRequestContext) {
  const response = await request.get(`${MOCK_URL}/__scrobbles`);
  return (await response.json()) as Record<string, string>[];
}

export const anonymous = { storageState: { cookies: [], origins: [] } };

/** Scrobbles a release through the release page, by barcode or `id:<discogs id>`. */
export async function scrobbleRelease(page: import('@playwright/test').Page, code: string, { autoScrobble = false } = {}) {
  await page.goto(`/detected/${code}`);
  if (autoScrobble) await page.getByText(/^Auto-scrobble/).click();
  await page.getByRole('button', { name: 'Scrobble', exact: true }).click();
  await page.waitForURL(/\/scrobbled\//);
}

/** Waits for the response to the next server action call. */
export const serverAction = (page: import('@playwright/test').Page) => page.waitForResponse(
  (response) => response.request().method() === 'POST' && Boolean(response.request().headers()['next-action']),
);
