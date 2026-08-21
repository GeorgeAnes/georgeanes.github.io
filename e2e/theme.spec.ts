import { test, expect, type Page } from '@playwright/test';

/**
 * The palette was designed against a WCAG calculation in task C-1. This suite
 * checks what the browser actually paints, so a token edit that breaks contrast
 * fails here rather than in a Lighthouse run at the end of the project.
 */

type Rgb = [number, number, number];

function relativeLuminance([r, g, b]: Rgb): number {
  const [lr, lg, lb] = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (light + 0.05) / (dark + 0.05);
}

/**
 * Chrome reports computed colours in the authored colour space, so a token
 * written in oklch() comes back as `oklch(0.985 0.002 70)`. Painting each one
 * to a 1x1 canvas is what turns it into the sRGB bytes a contrast ratio needs.
 */
async function paletteOf(page: Page): Promise<Record<string, Rgb>> {
  return page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d')!;

    const toRgb = (css: string): [number, number, number] => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = css;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
      return [r, g, b];
    };

    const body = getComputedStyle(document.body);
    const muted = document.querySelector('[data-probe="muted"]') ?? document.body;
    const accent = document.querySelector('[data-probe="accent"]') ?? document.body;

    return {
      background: toRgb(body.backgroundColor),
      text: toRgb(body.color),
      muted: toRgb(getComputedStyle(muted).color),
      accent: toRgb(getComputedStyle(accent).color),
    };
  });
}

test.describe('colour tokens', () => {
  test('light scheme paints a light background with readable text', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const palette = await paletteOf(page);

    expect(relativeLuminance(palette.background)).toBeGreaterThan(0.5);
    expect(contrastRatio(palette.text, palette.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(palette.muted, palette.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(palette.accent, palette.background)).toBeGreaterThanOrEqual(4.5);
  });

  test('dark scheme paints a dark background with readable text', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const palette = await paletteOf(page);

    expect(relativeLuminance(palette.background)).toBeLessThan(0.15);
    expect(contrastRatio(palette.text, palette.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(palette.muted, palette.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(palette.accent, palette.background)).toBeGreaterThanOrEqual(4.5);
  });

  test('the two schemes are actually different', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const light = await paletteOf(page);

    await page.emulateMedia({ colorScheme: 'dark' });
    const dark = await paletteOf(page);

    expect(dark.background).not.toEqual(light.background);
    expect(dark.text).not.toEqual(light.text);
  });
});
