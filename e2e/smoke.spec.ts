import { test, expect } from '@playwright/test';

test('home page loads and has a single h1', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveCount(1);
});
