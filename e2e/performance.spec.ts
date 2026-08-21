import { test, expect } from '@playwright/test';

/**
 * Budgets from SPEC.md success criterion 5. Measured locally here so a
 * regression fails on the branch; J-4 re-measures against the deployed site,
 * which is the criterion of record.
 */

const PAGES = ['/', '/projects/process-mining-kpi-dashboard'];

for (const path of PAGES) {
  test(`${path} reserves space for every image`, async ({ page }) => {
    await page.goto(path);

    const unsized = await page.$$eval('img', (images) =>
      images
        .filter((img) => !img.getAttribute('width') || !img.getAttribute('height'))
        .map((img) => img.getAttribute('src') ?? 'unknown'),
    );

    expect(unsized, 'images without intrinsic dimensions cause layout shift').toEqual([]);
  });

  test(`${path} stays under the layout shift budget`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });

    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const shift = entry as PerformanceEntry & {
                value: number;
                hadRecentInput: boolean;
              };
              if (!shift.hadRecentInput) total += shift.value;
            }
          }).observe({ type: 'layout-shift', buffered: true });

          setTimeout(() => resolve(total), 600);
        }),
    );

    expect(cls, `cumulative layout shift was ${cls}`).toBeLessThan(0.05);
  });

  test(`${path} ships under 20 KB of JavaScript`, async ({ page }) => {
    let javascriptBytes = 0;

    page.on('response', async (response) => {
      const type = response.headers()['content-type'] ?? '';
      if (type.includes('javascript')) {
        const body = await response.body().catch(() => Buffer.alloc(0));
        javascriptBytes += body.byteLength;
      }
    });

    await page.goto(path, { waitUntil: 'networkidle' });

    expect(javascriptBytes / 1024, 'JavaScript budget exceeded').toBeLessThan(20);
  });
}

test('project images are served as avif or webp, never raw png', async ({ page }) => {
  const rasterRequests: string[] = [];
  page.on('request', (request) => {
    if (/\.(png|jpe?g)(\?|$)/i.test(request.url())) {
      rasterRequests.push(request.url());
    }
  });

  await page.goto('/projects/process-mining-kpi-dashboard', { waitUntil: 'networkidle' });

  expect(rasterRequests, 'unoptimised source images were served').toEqual([]);
});

test('only the hero image loads eagerly', async ({ page }) => {
  await page.goto('/projects/process-mining-kpi-dashboard');

  const eager = await page.$$eval(
    'img',
    (images) => images.filter((img) => img.getAttribute('loading') !== 'lazy').length,
  );

  expect(eager, 'exactly one image should opt out of lazy loading').toBe(1);
});
