import { test, expect } from '@playwright/test';

/**
 * AC5: email and the GitHub profile must be reachable from any page.
 * Extend PAGES as new page types land (projects index in G-3, project detail
 * in G-3, blog in H-1).
 */
const PAGES = ['/', '/404'];

for (const path of PAGES) {
  test(`${path} exposes email and GitHub`, async ({ page }) => {
    await page.goto(path);

    await expect(
      page.locator('a[href="mailto:giwrgosanesiadis4@gmail.com"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('footer a[href="https://github.com/GeorgeAnes"]'),
    ).toHaveCount(1);
  });

  test(`${path} does not publish a LinkedIn link`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('a[href*="linkedin.com"]')).toHaveCount(0);
  });
}

test('primary navigation renders on a single line at desktop width', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  const nav = page.locator('nav[aria-label="Primary"]');
  const box = await nav.boundingBox();

  // Design direction caps the header at 80px; two lines would exceed it.
  expect(box!.height).toBeLessThanOrEqual(80);
});

test('the blog stays out of navigation while no post exists', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('nav[aria-label="Primary"] a[href="/blog/"]')).toHaveCount(0);
});
