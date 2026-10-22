import { anonymous, expect, test } from './support/test.ts';

// Uses its own login: logging out ends the session other tests share.
test.use(anonymous);

test('logs in and out', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('link', { name: /login with/i }).click();
  await expect(page).toHaveURL(/:\d+\/$/);

  await page.goto('/login');
  await expect(page).toHaveURL(/:\d+\/$/);

  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto('/profile');
  await expect(page).toHaveURL(/\/login$/);
});
