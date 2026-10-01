import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/*
 * The hero fades in over 700 ms after a 120 ms delay, and axe measures the
 * colour on screen while that runs, so a scan that starts early reports a
 * contrast the page never settles at. Wait for the timed animations so the
 * scan sees the settled page. Scroll- and view-driven animations advance only
 * when the page scrolls, so they never finish by themselves and are not awaited.
 */
async function waitForTimedAnimations(page: Page, timeoutMs = 5000) {
  await page.evaluate(async (limit) => {
    const timed = document
      .getAnimations()
      .filter((animation) => animation.timeline instanceof DocumentTimeline)
      .map((animation) => animation.finished.catch(() => undefined));
    const timer = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`animations still running after ${limit} ms`)),
        limit,
      ),
    );
    await Promise.race([Promise.all(timed), timer]);
  }, timeoutMs);
}

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'not found', path: '/404' },
  { name: 'projects index', path: '/projects/' },
  { name: 'project detail', path: '/projects/process-mining-kpi-dashboard' },
  { name: 'private-source project', path: '/projects/vfrm-agentic-design-assistant/' },
  { name: 'blog index', path: '/blog/' },
];

for (const { name, path } of PAGES) {
  test(`${name} has no serious or critical accessibility violations`, async ({
    page,
  }) => {
    await page.goto(path);
    await waitForTimedAnimations(page);

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = violations.filter(
      ({ impact }) => impact === 'serious' || impact === 'critical',
    );

    expect(
      blocking.map((v) => `${v.id} (${v.impact}): ${v.help}`),
      'axe reported blocking violations',
    ).toEqual([]);
  });

  test(`${name} exposes exactly one h1`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
  });
}

test.describe('skip link', () => {
  test('is the first focusable element and moves focus to main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skipLink = page.locator('a[href="#main"]');
    await expect(skipLink).toBeFocused();
    // It must become visible on focus, not stay clipped.
    await expect(skipLink).toBeInViewport();

    await page.keyboard.press('Enter');

    const focusedId = await page.evaluate(() => document.activeElement?.id);
    expect(focusedId).toBe('main');
  });
});

test.describe('keyboard traversal', () => {
  test('every interactive element in the shell is reachable by Tab', async ({ page }) => {
    await page.goto('/');

    /*
     * Tag each element with a unique index first. Identifying focus by href or
     * text is not sound: the GitHub profile is legitimately linked from both
     * the page body and the footer, and identical markers silently collapse.
     */
    const total = await page.evaluate(() => {
      const elements = document.querySelectorAll<HTMLElement>(
        'a[href], button, [tabindex="0"]',
      );
      elements.forEach((element, index) => {
        element.dataset.tabProbe = String(index);
      });
      return elements.length;
    });

    const reached = new Set<string>();
    for (let i = 0; i < total + 3; i++) {
      await page.keyboard.press('Tab');
      const probe = await page.evaluate(
        () => (document.activeElement as HTMLElement | null)?.dataset.tabProbe ?? null,
      );
      if (probe !== null) reached.add(probe);
    }

    expect(reached.size, `only ${reached.size} of ${total} elements were reachable`).toBe(
      total,
    );
  });
});

/*
 * Lighthouse flagged a skipped heading level that the axe sweep above let
 * through, because axe rates heading-order as moderate rather than serious.
 * Checked explicitly so the regression cannot come back quietly.
 */
for (const { name, path } of PAGES) {
  test(`${name} has a heading outline with no skipped levels`, async ({ page }) => {
    await page.goto(path);

    const levels = await page.$$eval('h1, h2, h3, h4, h5, h6', (headings) =>
      headings.map((h) => Number(h.tagName[1])),
    );

    expect(levels[0], 'the first heading should be the h1').toBe(1);

    const skips: string[] = [];
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i - 1] > 1) {
        skips.push(`h${levels[i - 1]} jumps to h${levels[i]} at position ${i}`);
      }
    }

    expect(skips, `heading outline: ${levels.map((l) => `h${l}`).join(' ')}`).toEqual([]);
  });
}
