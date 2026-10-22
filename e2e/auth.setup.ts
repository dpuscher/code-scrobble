import { expect, test as setup } from '@playwright/test';

setup('log in with Last.fm', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('link', { name: /login with/i }).click();
  await expect(page).toHaveURL(/:\d+\/$/);
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
});
