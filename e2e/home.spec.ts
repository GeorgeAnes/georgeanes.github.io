import { test, expect, type Locator } from '@playwright/test';

const LAPTOP = { width: 1366, height: 768 };

/** True when the element is fully inside the initial viewport, unscrolled. */
async function fitsAboveFold(locator: Locator, viewportHeight: number) {
  const box = await locator.boundingBox();
  if (!box) return false;
  return box.y >= 0 && box.y + box.height <= viewportHeight;
}

test.describe('home page', () => {
  test.use({ viewport: LAPTOP });

  test('AC1: who George is and what he does sit above the fold', async ({ page }) => {
    await page.goto('/');

    // Nothing may have scrolled to make this pass.
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toHaveText('George Anesiadis');
    expect(await fitsAboveFold(heading, LAPTOP.height), 'h1 is below the fold').toBe(
      true,
    );

    const positioning = page.getByText(
      /MSc Artificial Intelligence and Engineering Systems/,
    );
    expect(
      await fitsAboveFold(positioning, LAPTOP.height),
      'positioning line is below the fold',
    ).toBe(true);

    const primaryCta = page.getByRole('link', { name: /view projects/i }).first();
    expect(
      await fitsAboveFold(primaryCta, LAPTOP.height),
      'primary CTA is below the fold',
    ).toBe(true);
  });

  test('leads with a real project rather than a decorative graphic', async ({ page }) => {
    await page.goto('/');

    const heroImage = page.locator('section').first().locator('img').first();
    await expect(heroImage).toBeVisible();
    await expect(heroImage).toHaveAttribute('alt', /.+/);
  });

  test('shows the three featured projects and a route to the rest', async ({ page }) => {
    await page.goto('/');

    const projectLinks = page.locator('a[href^="/projects/"]:not([href="/projects/"])');
    await expect(projectLinks).toHaveCount(3);

    await expect(page.locator('a[href="/projects/"]')).not.toHaveCount(0);
  });

  test('about and contact are reachable from the hero CTAs', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#about')).toHaveCount(1);
    await expect(page.locator('#contact')).toHaveCount(1);

    await page.getByRole('link', { name: /get in touch/i }).click();
    await expect(page.locator('#contact')).toBeInViewport();
  });
});

test('blog renders with zero posts and offers a route onward', async ({ page }) => {
  const response = await page.goto('/blog/');
  expect(response?.status()).toBe(200);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Writing');
  await expect(page.locator('a[href="/projects/"]')).not.toHaveCount(0);
});
