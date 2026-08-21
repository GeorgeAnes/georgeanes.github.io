// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

// GitHub Pages user site: served at the domain root, so no `base` path.
// See SPEC.md -> Resolved Decisions 1.
export default defineConfig({
  site: 'https://georgeanes.github.io',
  // Phosphor only, via @iconify-json/ph. One icon family for the whole site.
  // No `include` list: astro-icon inlines just the icons actually referenced,
  // at build time, so the icon layer costs zero client JS.
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()],
  },
});
