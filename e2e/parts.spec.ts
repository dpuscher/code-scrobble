import { KNOWN_BARCODE } from './fixtures.ts';
import {
  expect, MOCK_URL, receivedScrobbles, test,
} from './support/test.ts';

// Night Drive has sides A and B and a bonus CD.
const scrobbledTracks = async (request: Parameters<typeof receivedScrobbles>[0]) => (
  (await receivedScrobbles(request)).map((s) => s.track)
);

test('scrobbles one side, then the next', async ({ page, request }) => {
  await page.goto(`/detected/${KNOWN_BARCODE}`);
  const parts = page.getByRole('group', { name: 'Sides and discs to scrobble' });
  await expect(parts.getByRole('button', { name: 'Side A' })).toHaveAttribute('aria-pressed', 'true');
  await expect(parts.getByRole('button', { name: 'Side B' })).toHaveAttribute('aria-pressed', 'true');
  await expect(parts.getByRole('button', { name: 'CD (bonus)' })).toHaveAttribute('aria-pressed', 'false');

  await parts.getByRole('button', { name: 'Side B' }).click();
  await page.getByRole('button', { name: 'Scrobble', exact: true }).click();
  await expect(page.getByText('Side A scrobbled to Last.fm')).toBeVisible();
  expect(await scrobbledTracks(request)).toEqual(['Headlights', 'Overpass']);

  // Scrobbled right on this page, without loading it again.
  await page.evaluate(() => Object.assign(window, { stayed: true }));
  await page.getByRole('button', { name: 'Next side (B)' }).click();
  await expect(page.getByText('Side B scrobbled to Last.fm')).toBeVisible();
  await expect(page).toHaveURL(/\?parts=B$/);
  expect(await page.evaluate(() => (window as { stayed?: boolean }).stayed)).toBe(true);
  expect(await scrobbledTracks(request)).toEqual(['Headlights', 'Overpass', 'Last Exit']);
  // Nothing left after the last side.
  await expect(page.getByRole('button', { name: /Next/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Scan another code' })).toBeVisible();
});

test('scrobbles a bonus disc when it is picked', async ({ page, request }) => {
  await page.goto(`/detected/${KNOWN_BARCODE}`);
  const parts = page.getByRole('group', { name: 'Sides and discs to scrobble' });
  await parts.getByRole('button', { name: 'Side A' }).click();
  await parts.getByRole('button', { name: 'Side B' }).click();
  await expect(page.getByRole('button', { name: 'Scrobble', exact: true })).toBeDisabled();

  await parts.getByRole('button', { name: 'CD (bonus)' }).click();
  await page.getByRole('button', { name: 'Scrobble', exact: true }).click();
  await expect(page.getByText('CD scrobbled to Last.fm')).toBeVisible();
  expect(await scrobbledTracks(request)).toEqual(['Bonus Demo']);
});

test('remembers the picked side for auto-scrobbling', async ({ page, request }) => {
  await page.goto(`/detected/${KNOWN_BARCODE}`);
  await page.getByRole('group', { name: 'Sides and discs to scrobble' }).getByRole('button', { name: 'Side A' }).click();
  await page.getByText('Auto-scrobble side B on next scan').click();
  await page.getByRole('button', { name: 'Scrobble', exact: true }).click();
  await expect(page.getByText('Side B scrobbled to Last.fm')).toBeVisible();

  await page.goto(`/detected/${KNOWN_BARCODE}`);
  await expect(page.getByText('Side B scrobbled to Last.fm')).toBeVisible();
  expect(await scrobbledTracks(request)).toEqual(['Last Exit', 'Last Exit']);

  await page.goto('/profile');
  await expect(page.getByText('The Testers · 2019 · Side B')).toBeVisible();
});

test('lists the tracks by side', async ({ page }) => {
  await page.goto(`/detected/${KNOWN_BARCODE}`);
  await page.getByRole('button', { name: 'Release info' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('columnheader')).toHaveText(['Side A', 'Side B', 'CD · Bonus']);
});

test('preselects as much of the next record as was scrobbled last time', async ({ page }) => {
  await page.goto(`/detected/${KNOWN_BARCODE}`);
  const parts = page.getByRole('group', { name: 'Sides and discs to scrobble' });
  await parts.getByRole('button', { name: 'Side B' }).click();
  await page.getByRole('button', { name: 'Scrobble', exact: true }).click();
  await expect(page.getByText('Side A scrobbled to Last.fm')).toBeVisible();

  await page.goto(`/detected/${KNOWN_BARCODE}`);
  await expect(parts.getByRole('button', { name: 'Side A' })).toHaveAttribute('aria-pressed', 'true');
  await expect(parts.getByRole('button', { name: 'Side B' })).toHaveAttribute('aria-pressed', 'false');

  // Taking the whole record again goes back to the whole record.
  await parts.getByRole('button', { name: 'Side B' }).click();
  await page.getByRole('button', { name: 'Scrobble', exact: true }).click();
  await expect(page.getByText('Record successfully scrobbled to Last.fm')).toBeVisible();
  await page.goto(`/detected/${KNOWN_BARCODE}`);
  await expect(parts.getByRole('button', { name: 'Side B' })).toHaveAttribute('aria-pressed', 'true');
});

test('says when the next side could not be sent, and sends it on retry', async ({ page, request }) => {
  await page.goto(`/detected/${KNOWN_BARCODE}`);
  await page.getByRole('group', { name: 'Sides and discs to scrobble' }).getByRole('button', { name: 'Side B' }).click();
  await page.getByRole('button', { name: 'Scrobble', exact: true }).click();
  await expect(page.getByText('Side A scrobbled to Last.fm')).toBeVisible();

  await request.post(`${MOCK_URL}/__fail-scrobbles?count=1`);
  await page.getByRole('button', { name: 'Next side (B)' }).click();
  await expect(page.getByText('An error occurred while sending data to Last.fm.')).toBeVisible();
  await expect(page.getByText('Side A scrobbled to Last.fm')).toBeVisible();

  await page.getByRole('button', { name: 'Next side (B)' }).click();
  await expect(page.getByText('Side B scrobbled to Last.fm')).toBeVisible();
  await expect(page.getByText('An error occurred while sending data to Last.fm.')).toHaveCount(0);
  expect(await scrobbledTracks(request)).toEqual(['Headlights', 'Overpass', 'Last Exit']);
});
