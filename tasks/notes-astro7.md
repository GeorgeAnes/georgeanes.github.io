# A-2 — Astro 7 / Tailwind 4 API verification

Verified 2026-08-21 against official docs **and** an empirical probe built in this repo
(probe since removed). Closes plan risks **P3** and **P4**.

Installed: `astro@7.2.4`, `@tailwindcss/vite@4.x`, Node 24.18.0.

---

## 1. Content Layer API — CONFIRMED

Config file is `src/content.config.ts` (as the spec assumed). Imports differ from older
Astro and from what the plan assumed:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';   // ← loader, NOT astro:content
import { z } from 'astro/zod';          // ← zod, NOT astro:content

const probe = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/probe' }),
  schema: z.object({ title: z.string(), summary: z.string().min(1) }),
});

export const collections = { probe };
```

**⚠️ Correction:** `z` comes from `astro/zod` and `glob` from `astro/loaders`. Importing
either from `astro:content` fails.

### Querying and rendering

```ts
import { getCollection, getEntry, render } from 'astro:content';

const entries = await getCollection('probe');
const { Content } = await render(entries[0]);   // render() is a top-level import
```

`<Content />` renders the entry body. Verified: body markdown appeared in `dist/`.

### IDs

`entry.id`, **not** `entry.slug`. Derived from the filename:
`src/content/probe/hello.md` → `id === "hello"` (confirmed in built HTML).
`SPEC.md`'s `ProjectCard` example already uses `project.id` — correct as written.

Docs name the dynamic route `[...id].astro`; the spec uses `[...slug].astro`. Both are
valid — the filename only sets the **param name**, so `[...slug].astro` must use
`params: { slug: entry.id }`. Keeping the spec's `[...slug]` since public URLs read as
`/projects/<slug>/`.

---

## 2. Tailwind v4 — CONFIRMED, install path corrected

**⚠️ Correction:** `@astrojs/tailwind` is **Tailwind 3 only**. Tailwind 4 uses the Vite
plugin. `npx astro add tailwind --yes` does it correctly:

```js
// astro.config.mjs
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ vite: { plugins: [tailwindcss()] } });
```

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  --color-probe: oklch(0.55 0.18 265);
}
```

No `tailwind.config.js` — v4 is CSS-first. The stylesheet must be imported from a
layout; it is not global automatically.

**Probe result:** `--color-probe` in `@theme` generated the utility
`.text-probe{color:var(--color-probe)}` in the built CSS. The `@theme` mechanism the
spec relies on for design tokens (C-1) works as assumed.

---

## 3. Images — one correction that changes task E-1

Components come from `astro:assets`:

```astro
import { Image, Picture } from 'astro:assets';
import hero from '../assets/projects/foo/hero.png';
<Image src={hero} alt="…" width={800} height={450} />
```

**⚠️ Correction to E-1:** Astro 7 has a **`priority` prop**. Setting `priority` applies
`loading="eager"`, `decoding="sync"`, and `fetchpriority="high"` together. Use it for
the LCP image instead of setting the three attributes by hand.

Other relevant props: `format` (default `webp`), `quality` (`low|mid|high|max` or
0–100), `widths` + `sizes` for responsive srcsets, `densities`, and `layout`
(`constrained` | `full-width` | `fixed` | `none`). `loading` defaults to `lazy` and
`decoding` to `async`, so below-the-fold images need no extra props.

**⚠️ Correction to B-2:** a `heroImage` field validated by the `image()` helper requires
the schema to be a **function**, not a plain object:

```ts
schema: ({ image }) => z.object({
  heroImage: image().optional(),
}),
```

Local images belong in `src/` (bundled and optimized), not `public/` (served raw).
`getImage()` exists for generating OG images outside of HTML — relevant to J-2.

---

## 4. Net effect on the plan

| Task | Change |
|---|---|
| B-2 | Schema must use the `({ image }) => z.object(…)` function form for `heroImage`. |
| C-1 | Approach confirmed. `astro add tailwind` already applied; no `@astrojs/tailwind`. |
| E-1 | Use the `priority` prop rather than hand-setting eager/fetchpriority/decoding. |
| J-2 | `getImage()` is the tool for generated OG images. |

No change required to `SPEC.md`'s stack, structure, or success criteria.
