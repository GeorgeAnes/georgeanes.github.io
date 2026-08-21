// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// GitHub Pages user site: served at the domain root, so no `base` path.
// See SPEC.md -> Resolved Decisions 1.
export default defineConfig({
  site: 'https://georgeanes.github.io',
  vite: {
    plugins: [tailwindcss()],
  },
});
