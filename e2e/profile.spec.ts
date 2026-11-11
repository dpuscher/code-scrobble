import { KNOWN_BARCODE, MOCK_USER } from './fixtures.ts';
import { expect, scrobbleRelease, test } from './support/test.ts';

test('profile lists history and auto-scrobbles', async ({ page }) => {
  // Scrobble two releases, one with auto-scrobble enabled.
  await scrobbleRelease(page, 'id:1002');
  await scrobbleRelease(page, KNOWN_BARCODE, { autoScrobble: true });

  await page.goto('/');
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('menuitem', { name: 'Profile' }).click();

  await expect(page.getByRole('heading', { name: MOCK_USER.name })).toBeVisible();

  const history = page.getByRole('list').nth(1);
  await expect(history.getByRole('link')).toHaveText([
    /Night Drive\s*The Testers · 2019 · \d+ seconds? ago/, /Quiet Hours\s*The Testers · 2021/,
  ]);

  const autoScrobbles = page.getByRole('list').first();
  await expect(autoScrobbles.getByRole('listitem')).toHaveText([/Night Drive\s*The Testers · 2019/]);
  await autoScrobbles.getByRole('button', { name: 'Remove The Testers - Night Drive' }).click();
  await expect(autoScrobbles.getByText('No entries found.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('list').first().getByText('No entries found.')).toBeVisible();

  // History entries lead back to the release, by barcode or Discogs id.
  await page.getByRole('list').nth(1).getByRole('link', { name: /Night Drive/ }).click();
  await expect(page).toHaveURL(new RegExp(`/detected/${KNOWN_BARCODE}$`));
  await expect(page.getByRole('button', { name: 'Scrobble' })).toBeVisible();
});
