import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'not found', path: '/404' },
  { name: 'projects index', path: '/projects/' },
  { name: 'project detail', path: '/projects/process-mining-kpi-dashboard' },
  { name: 'blog index', path: '/blog/' },
];

for (const { name, path } of PAGES) {
  test(`${name} has no serious or critical accessibility violations`, async ({
    page,
  }) => {
    await page.goto(path);

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
