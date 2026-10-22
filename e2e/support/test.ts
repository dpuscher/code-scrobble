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
