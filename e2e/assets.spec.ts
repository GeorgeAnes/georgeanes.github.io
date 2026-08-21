import { test, expect } from '@playwright/test';

/**
 * Guards the transfer budget in SPEC.md. The font packages ship cyrillic,
 * greek, vietnamese and latin-ext cuts alongside latin; unicode-range is what
 * keeps the browser from fetching them. Importing `index.css` or the italic
 * axis instead of `wght.css` would silently break that, so assert it.
 */
test('downloads only the latin font subsets', async ({ page }) => {
  const fontRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('.woff2')) {
      fontRequests.push(request.url().split('/').pop()!);
    }
  });

  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  expect(fontRequests.length).toBeGreaterThan(0);
  for (const file of fontRequests) {
    expect(file, `unexpected non-latin font fetched: ${file}`).toMatch(
      /latin-wght-normal/,
    );
    expect(file, `italic axis should not be imported: ${file}`).not.toMatch(/italic/);
  }
});

test('serves no third-party requests', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.hostname !== 'localhost' && url.protocol !== 'data:') {
      external.push(request.url());
    }
  });

  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  expect(
    external,
    `page must be fully self-hosted, found: ${external.join(', ')}`,
  ).toEqual([]);
});
