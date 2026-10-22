import { expect, test } from './support/test.ts';

test.describe('release search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Search release' }).click();
  });

  test('finds a release by name and opens it', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search release' }).fill('night drive');
    await page.keyboard.press('Enter');

    const result = page.getByRole('link', { name: /The Testers - Night Drive \(2019\)/ });
    await expect(result).toContainText('Germany · Vinyl, LP');
    await result.click();

    await expect(page).toHaveURL(/\/detected\/id:1001$/);
    await expect(page.getByRole('button', { name: 'Scrobble' })).toBeVisible();
  });

  test('says when nothing matches', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search release' }).fill('does not exist');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.getByText('No results were found')).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('searchbox')).toHaveCount(0);
  });
});
