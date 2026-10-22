import type { Page } from '@playwright/test';
import { KNOWN_BARCODE, UNKNOWN_BARCODE } from './fixtures.ts';
import { expect, MOCK_URL, receivedScrobbles, test } from './support/test.ts';

test('scans a barcode with the camera and scrobbles the record', async ({ page, request }) => {
  await page.goto('/');
  await expect(page).toHaveURL(new RegExp(`/detected/${KNOWN_BARCODE}$`), { timeout: 30_000 });

  await page.getByRole('button', { name: 'Scrobble' }).click();
  await expect(page).toHaveURL(new RegExp(`/scrobbled/${KNOWN_BARCODE}$`));
  await expect(page.getByText('Record successfully scrobbled to Last.fm')).toBeVisible();

  const scrobbles = await receivedScrobbles(request);
  expect(scrobbles.map((s) => s.track)).toEqual(['Headlights', 'Overpass', 'Last Exit']);
  expect(scrobbles[0]).toMatchObject({ artist: 'The Testers', album: 'Night Drive', trackNumber: '1' });
  // Starts now, each following track offset by the previous durations.
  const [first, second, third] = scrobbles.map((s) => Number(s.timestamp));
  expect(Math.abs(first - Date.now() / 1000)).toBeLessThan(60);
  expect([second - first, third - second]).toEqual([210, 245]);
});

test('falls back to quagga2 where the browser has no barcode reader', async ({ page }) => {
  await page.addInitScript(() => {
    delete (window as { BarcodeDetector?: unknown }).BarcodeDetector;
  });
  await page.goto('/');
  await expect(page).toHaveURL(new RegExp(`/detected/${KNOWN_BARCODE}$`), { timeout: 30_000 });
});

test.describe('built-in barcode reader', () => {
  type Stub = { showBarcode: boolean; frames: number; vibrations: unknown[]; torch: unknown[] };

  // Stands in for the BarcodeDetector of Chrome on Android, a camera with a
  // torch and the vibration motor, none of which desktop Chromium has.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((barcode) => {
      const stub: Stub = { showBarcode: false, frames: 0, vibrations: [], torch: [] };
      Object.assign(window, {
        scanStub: stub,
        BarcodeDetector: class {
          static async getSupportedFormats() { return ['ean_13', 'ean_8', 'qr_code']; }

          async detect(source: unknown) {
            if (!(source instanceof HTMLVideoElement)) throw new TypeError('Expected the camera video');
            stub.frames += 1;
            return stub.showBarcode ? [{ rawValue: barcode, format: 'ean_13' }] : [];
          }
        },
      });
      navigator.vibrate = (pattern) => stub.vibrations.push(pattern) > 0;
      const { getCapabilities } = MediaStreamTrack.prototype;
      MediaStreamTrack.prototype.getCapabilities = function () {
        return { ...getCapabilities.call(this), torch: true };
      };
      MediaStreamTrack.prototype.applyConstraints = async function (constraints) {
        stub.torch.push(constraints?.advanced?.[0]?.torch);
      };
    }, KNOWN_BARCODE);
  });

  const stub = (page: Page) => page.evaluate(() => (window as unknown as { scanStub: Stub }).scanStub);

  test('reads the camera video, toggles the torch and vibrates on detection', async ({ page }) => {
    await page.goto('/');
    await expect.poll(async () => (await stub(page)).frames).toBeGreaterThan(0);

    const torch = page.getByRole('button', { name: 'Flashlight' });
    await torch.click();
    await expect(torch).toHaveAttribute('aria-pressed', 'true');
    await torch.click();
    await expect(torch).toHaveAttribute('aria-pressed', 'false');
    expect((await stub(page)).torch).toEqual([true, false]);

    await page.evaluate(() => { (window as unknown as { scanStub: Stub }).scanStub.showBarcode = true; });
    await expect(page).toHaveURL(new RegExp(`/detected/${KNOWN_BARCODE}$`));
    expect((await stub(page)).vibrations).toEqual([40]);
  });
});

test('auto-scrobbles a record when it is scanned again', async ({ page, request }) => {
  await page.goto(`/detected/${KNOWN_BARCODE}`);
  await page.getByText('Auto-scrobble on next scan').click();
  await page.getByRole('button', { name: 'Scrobble' }).click();
  await expect(page.getByText('Record successfully scrobbled to Last.fm')).toBeVisible();

  // Client-side navigation back to the scanner, which reads the barcode again
  // and goes straight through to /scrobbled.
  await page.getByRole('button', { name: 'Scan another code' }).click();
  await expect(page).toHaveURL(/:\d+\/$/);
  await expect.poll(async () => (await receivedScrobbles(request)).length, { timeout: 30_000 }).toBe(6);
  await expect(page).toHaveURL(new RegExp(`/scrobbled/${KNOWN_BARCODE}$`));
});

test('offers a retry when Last.fm fails', async ({ page, request, consoleErrors }) => {
  await request.post(`${MOCK_URL}/__fail-scrobbles?count=1`);
  await page.goto(`/detected/${KNOWN_BARCODE}`);
  await page.getByRole('button', { name: 'Scrobble' }).click();

  await expect(page.getByText('An error occurred while sending data to Last.fm')).toBeVisible();
  expect(await receivedScrobbles(request)).toHaveLength(0);
  // The failed request is expected to show up in the console.
  expect(consoleErrors).toEqual([expect.stringContaining('502')]);
  consoleErrors.length = 0;

  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByText('Record successfully scrobbled to Last.fm')).toBeVisible();
  expect(await receivedScrobbles(request)).toHaveLength(3);
});

test.describe('detected release', () => {
  test('shows the tracklist and links to Discogs', async ({ page }) => {
    await page.goto(`/detected/${KNOWN_BARCODE}`);
    await page.getByRole('button', { name: 'Release info' }).click();

    await expect(page.getByText('Night Drive', { exact: true })).toBeVisible();
    const rows = page.getByRole('row');
    await expect(rows).toHaveText([/1\s*Headlights\s*3:30/, /2\s*Overpass\s*4:05/, /3\s*Last Exit\s*5:00/]);
    await expect(page.getByRole('link', { name: 'Show on Discogs' }))
      .toHaveAttribute('href', 'https://www.discogs.com/release/1001-Night-Drive');

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(rows).toHaveCount(0);

    await page.getByRole('button', { name: 'Release info' }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('cancel goes back to the scanner', async ({ page }) => {
    await page.goto(`/detected/${KNOWN_BARCODE}`);
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/:\d+\/$/);
  });

  test('reports unknown barcodes', async ({ page }) => {
    await page.goto(`/detected/${UNKNOWN_BARCODE}`);
    await expect(page.getByText(`No release found${UNKNOWN_BARCODE}`)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Scrobble' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page).not.toHaveURL(new RegExp(UNKNOWN_BARCODE));
  });

  test('auto-scrobble scrobbles immediately on the next scan', async ({ page, request }) => {
    await page.goto(`/detected/${KNOWN_BARCODE}`);
    await page.getByText('Auto-scrobble on next scan').click();
    await expect(page.getByLabel('Auto-scrobble on next scan')).toBeChecked();
    await page.getByRole('button', { name: 'Scrobble' }).click();
    await expect(page.getByText('Record successfully scrobbled to Last.fm')).toBeVisible();

    await page.goto(`/detected/${KNOWN_BARCODE}`);
    await expect(page).toHaveURL(new RegExp(`/scrobbled/${KNOWN_BARCODE}$`));
    expect(await receivedScrobbles(request)).toHaveLength(6);
  });
});
