/**
 * Generates the Open Graph cards in public/og/.
 *
 * Run manually with `npm run og` after adding a page or renaming a project.
 * Deliberately not part of `npm run build`: the cards change rarely, rendering
 * them needs a browser, and committing the output keeps CI fast and offline.
 */
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'og');

const SITE_NAME = 'George Anesiadis';
const WIDTH = 1200;
const HEIGHT = 630;

/** Reads the title out of a content file's frontmatter. */
async function titleOf(path) {
  const raw = await readFile(path, 'utf-8');
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)?.[1] ?? '';
  const match = /^title:\s*(.+)$/m.exec(block);
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

async function cardHtml({ title, kicker, fontCss }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  ${fontCss}
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px;
    background: oklch(0.175 0.005 60);
    color: oklch(0.945 0.004 60);
    font-family: 'Geist Card', system-ui, sans-serif;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 72px 80px;
  }
  .kicker {
    font-family: 'Geist Mono Card', ui-monospace, monospace;
    font-size: 24px; letter-spacing: 0.02em;
    color: oklch(0.76 0.15 52);
  }
  h1 {
    font-size: ${title.length > 46 ? 66 : 80}px;
    font-weight: 600; line-height: 1.06; letter-spacing: -0.022em;
    max-width: 18ch;
  }
  .rule { height: 6px; width: 96px; background: oklch(0.76 0.15 52); border-radius: 3px; }
  footer { display: flex; align-items: center; justify-content: space-between; }
  .name { font-size: 26px; font-weight: 600; }
  .site {
    font-family: 'Geist Mono Card', ui-monospace, monospace;
    font-size: 22px; color: oklch(0.7 0.01 60);
  }
</style></head>
<body>
  <div><div class="kicker">${kicker}</div><div class="rule" style="margin-top:26px"></div></div>
  <h1>${title}</h1>
  <footer><span class="name">${SITE_NAME}</span><span class="site">georgeanes.github.io</span></footer>
</body></html>`;
}

async function main() {
  await mkdir(outDir, { recursive: true });

  // Embed the real typeface so the cards match the site rather than falling
  // back to whatever the rendering machine happens to have installed.
  const fontFile = join(
    root,
    'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2',
  );
  const monoFile = join(
    root,
    'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2',
  );
  const [sans, mono] = await Promise.all([readFile(fontFile), readFile(monoFile)]);
  const fontCss = `
    @font-face { font-family: 'Geist Card'; font-weight: 100 900;
      src: url(data:font/woff2;base64,${sans.toString('base64')}) format('woff2-variations'); }
    @font-face { font-family: 'Geist Mono Card'; font-weight: 100 900;
      src: url(data:font/woff2;base64,${mono.toString('base64')}) format('woff2-variations'); }`;

  const projectDir = join(root, 'src', 'content', 'projects');
  const files = (await readdir(projectDir)).filter((f) => f.endsWith('.md'));

  const cards = [
    {
      file: 'default',
      title: 'AI systems for engineering problems',
      kicker: 'Portfolio',
    },
    { file: 'projects', title: 'Projects', kicker: 'Portfolio' },
    { file: 'blog', title: 'Writing', kicker: 'Notes' },
  ];

  for (const file of files) {
    const title = await titleOf(join(projectDir, file));
    if (title) cards.push({ file: file.replace(/\.md$/, ''), title, kicker: 'Project' });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });

  for (const card of cards) {
    await page.setContent(await cardHtml({ ...card, fontCss }), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const buffer = await page.screenshot({ type: 'png' });
    await writeFile(join(outDir, `${card.file}.png`), buffer);
    console.log(`  ${card.file}.png  ${(buffer.byteLength / 1024).toFixed(0)} KB`);
  }

  await browser.close();
  console.log(`\ngenerated ${cards.length} cards in public/og/`);
}

main();
