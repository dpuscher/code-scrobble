import path from 'node:path';
import type { Page } from '@playwright/test';
import { KNOWN_BARCODE, UNKNOWN_BARCODE } from '../fixtures.ts';
import { anonymous, MOCK_URL, test } from '../support/test.ts';

const dir = process.env.SHOT_DIR ?? 'test-results/screens';

async function shot(page: Page, name: string, project: string, fullPage = false) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(dir, `${project}-${name}.png`), fullPage, animations: 'disabled' });
}

// A static grey camera picture without a barcode, so the scanner stays open.
const fakeCamera = () => {
  navigator.mediaDevices.getUserMedia = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d')!;
    const draw = () => {
      const g = ctx.createLinearGradient(0, 0, 1280, 720);
      g.addColorStop(0, '#6b6f7a');
      g.addColorStop(1, '#2a2d34');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 1280, 720);
    };
    draw();
    setInterval(draw, 100);
    return canvas.captureStream(10);
  };
};
const brokenCamera = () => {
  navigator.mediaDevices.getUserMedia = async () => { throw new Error('denied'); };
};

test.describe('anonymous', () => {
  test.use(anonymous);
  test('login', async ({ page }, info) => {
    await page.goto('/login');
    await shot(page, 'login', info.project.name);
  });
  test('legal', async ({ page }, info) => {
    await page.goto('/legal');
    await shot(page, 'legal', info.project.name);
  });
  test('privacy', async ({ page }, info) => {
    await page.goto('/privacy');
    await shot(page, 'privacy', info.project.name);
  });
});

test('scan', async ({ page }, info) => {
  await page.addInitScript(fakeCamera);
  await page.goto('/');
  await page.locator('video').waitFor();
  await page.waitForTimeout(1000);
  await shot(page, 'scan', info.project.name);

  await page.getByRole('button', { name: 'Account menu' }).click();
  await shot(page, 'scan-menu', info.project.name);
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Search release' }).click();
  await shot(page, 'search-empty', info.project.name);
  await page.getByRole('searchbox').fill('testers');
  await page.keyboard.press('Enter');
  await page.getByRole('link', { name: /Night Drive/ }).waitFor();
  await shot(page, 'search-results', info.project.name);
  await page.getByRole('searchbox').fill('nothing');
  await page.keyboard.press('Enter');
  await page.getByText('No results were found').waitFor();
  await shot(page, 'search-none', info.project.name);
});

test('camera error', async ({ page }, info) => {
  await page.addInitScript(brokenCamera);
  await page.goto('/');
  await page.getByText('An error occurred').waitFor();
  await shot(page, 'scan-error', info.project.name);
});

test('detected', async ({ page }, info) => {
  await page.goto(`/detected/${KNOWN_BARCODE}`);
  await page.getByRole('button', { name: 'Scrobble' }).waitFor();
  await shot(page, 'detected', info.project.name);
  await page.getByText('Auto-scrobble on next scan').click();
  await shot(page, 'detected-checked', info.project.name);
  await page.getByRole('button', { name: 'Release info' }).click();
  await page.getByRole('dialog').waitFor();
  await shot(page, 'release-info', info.project.name);
});

test('not found', async ({ page }, info) => {
  await page.goto(`/detected/${UNKNOWN_BARCODE}`);
  await page.getByText('No release found').waitFor();
  await shot(page, 'not-found', info.project.name);
});

test('scrobbling and scrobbled', async ({ page }, info) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/api/scrobble', async (route) => { await held; await route.continue(); });
  await page.goto(`/detected/${KNOWN_BARCODE}`);
  await page.getByRole('button', { name: 'Scrobble' }).click();
  await page.getByText('Sending data to Last.fm').waitFor();
  await shot(page, 'scrobbling', info.project.name);
  release();
  await page.getByText('Record successfully scrobbled').waitFor();
  await shot(page, 'scrobbled', info.project.name);
});

test('scrobble failed', async ({ page, request, consoleErrors }, info) => {
  await request.post(`${MOCK_URL}/__fail-scrobbles?count=1`);
  await page.goto(`/detected/${KNOWN_BARCODE}`);
  await page.getByRole('button', { name: 'Scrobble' }).click();
  await page.getByText('An error occurred while sending').waitFor();
  await shot(page, 'scrobble-failed', info.project.name);
  consoleErrors.length = 0;
});

test('profile', async ({ page }, info) => {
  await page.goto('/profile');
  await page.getByText('No entries found.').first().waitFor();
  await shot(page, 'profile-empty', info.project.name);
  await page.request.get(`/api/barcode/${KNOWN_BARCODE}`);
  await page.request.get('/api/barcode/id:1002');
  await page.request.post('/api/scrobble', { data: { id: 1002, autoScrobble: false } });
  await page.request.post('/api/scrobble', { data: { id: 1001, autoScrobble: true } });
  await page.reload();
  await page.getByRole('link', { name: /Quiet Hours/ }).waitFor();
  await shot(page, 'profile', info.project.name, true);
});
