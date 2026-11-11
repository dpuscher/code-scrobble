import { expect, serverAction, test } from './support/test.ts';

const formatOption = (page: import('@playwright/test').Page, name: string) => (
  page.locator('label').filter({ hasText: new RegExp(`^${name}$`) })
);

test.describe('release search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Search release' }).click();
  });

  test('groups the versions of an album and opens the chosen one', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search release' }).fill('night drive');
    await page.keyboard.press('Enter');

    const album = page.getByRole('button', { name: /Night Drive/ });
    await expect(album).toContainText('The Testers');
    await expect(album).toContainText('2019 · Vinyl, CD');
    await album.click();

    await expect(page.getByRole('heading', { name: 'Night Drive' })).toBeVisible();
    await expect(page.getByText('The Testers · 2 versions')).toBeVisible();
    await expect(page.getByText('Most collected')).toBeVisible();
    await page.getByRole('link', { name: /CD · Album/ }).click();

    await expect(page).toHaveURL(/\/detected\/id:1003$/);
    await expect(page.getByRole('button', { name: 'Scrobble' })).toBeVisible();
  });

  test('goes back from the versions to the results', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search release' }).fill('testers');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: /Night Drive/ }).click();
    await page.getByRole('button', { name: 'Back to results' }).click();

    await expect(page.getByRole('heading', { name: 'Night Drive' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Quiet Hours/ })).toBeVisible();
  });

  test('opens a release without other versions directly', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search release' }).fill('quiet hours');
    await page.keyboard.press('Enter');
    await page.getByRole('link', { name: /Quiet Hours/ }).click();
    await expect(page).toHaveURL(/\/detected\/id:1002$/);
  });

  test('narrows the search to a format and remembers it', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search release' }).fill('testers');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('link', { name: /Quiet Hours/ })).toBeVisible();

    const saved = serverAction(page);
    await formatOption(page, 'CD').click();
    expect((await saved).ok()).toBe(true);
    await expect(page.getByRole('link', { name: /Quiet Hours/ })).toHaveCount(0);
    // A single matching version opens without the extra step.
    await page.getByRole('button', { name: /Night Drive/ }).click();
    await expect(page).toHaveURL(/\/detected\/id:1003$/);

    await page.goto('/');
    await page.getByRole('button', { name: 'Search release' }).click();
    await expect(page.getByRole('radio', { name: 'CD' })).toBeChecked();
  });

  test('says when nothing matches', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search release' }).fill('does not exist');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.getByText('No results were found')).toBeVisible();

    await formatOption(page, 'Vinyl').click();
    await expect(page.getByText('No Vinyl releases were found')).toBeVisible();
    await page.getByRole('button', { name: 'Search all formats' }).click();
    await expect(page.getByRole('radio', { name: 'All' })).toBeChecked();

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('searchbox')).toHaveCount(0);
  });
});

test('searches for text that looks URL-encoded', async ({ page }) => {
  await page.goto('/');
  const response = await page.request.get('/api/search/100%25');
  expect(response.status()).toBe(200);
});
