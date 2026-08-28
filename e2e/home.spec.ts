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
    await expect(heading).toHaveText('AI for engineering.');
    await expect(page.locator('.hero-name')).toHaveText('George Anesiadis');
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

  test('keeps the hero and editorial project covers decorative', async ({ page }) => {
    await page.goto('/');

    const artwork = page.locator('[data-hero-art]');
    await expect(artwork).toHaveAttribute('aria-hidden', 'true');
    await expect(artwork.locator('img')).toHaveAttribute('alt', '');

    const projectImages = page.locator('#selected-work article img');
    await expect(projectImages).toHaveCount(3);
    for (const image of await projectImages.all()) {
      await expect(image).toHaveAttribute('alt', '');
    }
    await expect(page.locator('#selected-work article h3 a')).toHaveCount(3);
    await expect(
      page.locator('#selected-work .cover-scene[aria-hidden="true"]'),
    ).toHaveCount(3);
  });

  test('the orb recedes with page scroll and project artwork responds to hover', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 250));
    await expect
      .poll(() =>
        page
          .locator('.orb-recede')
          .evaluate((element) => Number(getComputedStyle(element).opacity)),
      )
      .toBeLessThan(0.9);

    const cover = page.locator('#selected-work article').first();
    await cover.hover();
    await expect
      .poll(() =>
        cover
          .locator('img')
          .evaluate(
            (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a,
          ),
      )
      .toBeGreaterThan(1.02);
  });

  test('reduced motion leaves the hero and project artwork static', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('[data-hero-art]').hover();
    await expect(page.locator('.orb-image')).toHaveCSS('transform', 'none');
    await page.evaluate(() => window.scrollTo(0, 250));
    await expect(page.locator('.orb-recede')).toHaveCSS('animation-name', 'none');
    await expect(page.locator('.orb-recede')).toHaveCSS('opacity', '1');
    const cover = page.locator('#selected-work article').first();
    await cover.hover();
    await expect(cover).toHaveCSS('animation-name', 'none');
    await expect(cover.locator('img')).toHaveCSS('transform', 'none');
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
