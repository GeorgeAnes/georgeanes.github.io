import { test, expect } from '@playwright/test';

const WIDTHS = [320, 768, 1440];
const SCHEMES = ['light', 'dark'] as const;
const PAGES = [
  '/',
  '/404',
  '/projects/',
  '/projects/process-mining-kpi-dashboard',
  '/projects/vfrm-agentic-design-assistant/',
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
        await page.addInitScript(
          (theme) => localStorage.setItem('portfolio-theme', theme),
          scheme,
        );
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

/**
 * SPEC.md -> Always do: the site must stay fully functional with JavaScript
 * disabled. The optional appearance switch is hidden; content and navigation
 * do not depend on its script.
 */
test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the mobile project CTA navigates after its entrance animation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    // Use the real entrance completion, not a forced click or a fixed sleep.
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        document
          .getAnimations()
          .filter(
            (animation) =>
              animation.timeline instanceof DocumentTimeline &&
              animation.effect?.getTiming().iterations !== Infinity,
          )
          .map((animation) => animation.finished.catch(() => {})),
      );
    });
    await page.getByRole('link', { name: 'View projects', exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(page.locator('article')).toHaveCount(9);
  });

  for (const path of PAGES) {
    test(`${path} still renders and navigates`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await expect(page.locator('#theme-toggle')).toBeHidden();
      await expect(page.locator('nav[aria-label="Primary"] a').first()).toBeVisible();
      await expect(page.locator('footer a[href^="mailto:"]')).toHaveCount(1);
    });
  }
});
