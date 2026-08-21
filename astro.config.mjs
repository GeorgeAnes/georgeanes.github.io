// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// GitHub Pages user site: served at the domain root, so no `base` path.
// See SPEC.md -> Resolved Decisions 1.
export default defineConfig({
  site: 'https://georgeanes.github.io',
  // Moved out of node_modules so CI can cache it. A cold build generates ~166
  // AVIF and WebP variants, which takes minutes and puts the five-minute
  // commit-to-live criterion at risk; a warm cache brings it back to seconds.
  cacheDir: './.astro-cache',
  // Phosphor only, via @iconify-json/ph. One icon family for the whole site.
  // No `include` list: astro-icon inlines just the icons actually referenced,
  // at build time, so the icon layer costs zero client JS.
  integrations: [
    icon(),
    mdx(),
    // 404 is marked noindex, so it has no place in the sitemap either.
    sitemap({ filter: (page) => !page.endsWith('/404/') }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
