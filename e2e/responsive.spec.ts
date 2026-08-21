import { test, expect } from '@playwright/test';

const WIDTHS = [320, 768, 1440];
const SCHEMES = ['light', 'dark'] as const;
const PAGES = [
  '/',
  '/404',
  '/projects/',
  '/projects/process-mining-kpi-dashboard',
  '/blog/',
];

/**
 * SPEC.md success criterion 8: no horizontal scroll at any of these widths, in
 * either colour scheme. Checked on the document element rather than by eye,
 * because a single overflowing element is easy to miss and ugly on mobile.
 */
for (const path of PAGES) {
  for (const width of WIDTHS) {
    for (const scheme of SCHEMES) {
      test(`${path} at ${width}px in ${scheme} does not scroll horizontally`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);

        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        expect(
          overflow.scrollWidth,
          `content overflows by ${overflow.scrollWidth - overflow.clientWidth}px`,
        ).toBeLessThanOrEqual(overflow.clientWidth);
      });
    }
  }
}
