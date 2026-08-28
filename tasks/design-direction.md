# Design Direction

## Approved refresh: Midnight + iridescent

### Reference-fidelity correction after prototype review

George rejected the palette-plus-orb interpretation. This is a visual overhaul,
not preservation of the original card layout. Follow the complete right-hand
Midnight reference: wider integrated hero scene, lighter display typography,
subtle cyan/violet light, and one large project cover beside two stacked covers.
Continue that visual language into About, Contact, and the project index.

`DESIGN_VARIANCE: 8`, `MOTION_INTENSITY: 6`, `VISUAL_DENSITY: 4`.
Midnight is the default, with an explicit, persisted light preference. This
supersedes the earlier system-only default. The small theme script is vanilla;
all content and navigation still work without JavaScript.

The three generated project covers are decorative editorial artwork, never
presented as actual results or architectures. Keep the real evidence in case
studies. Retain route slugs, names, team attribution, and factual claims.

The final local Playwright revision passed 205 checks, including actual computed
scroll transforms/opacity, hover enlargement, both appearances, reduced motion,
and navigation without JavaScript. Animation longhands preserve scroll timelines
through the installed CSS optimizer. George explicitly authorized publication
and merge after CI passes on 2026-08-28; deployment verification remains separate.

Selected by George on 2026-08-28. This section supersedes the older palette,
hero-artwork restriction, layout restrictions, theme default, and motion dial
below; all content, performance, accessibility, and scope constraints remain
in force. The project index shares the featured mosaic before its full archive.

### First-prototype direction (superseded by the review above)

Reading this as a professional AI engineering portfolio with a cinematic hero
and calm, evidence-led project pages. Dials: variance **7**, motion **6**, density
**4**. Keep Astro, native CSS, Geist, Geist Mono, and the Phosphor icon family.

- Dark palette: midnight background, slightly lighter navy surfaces, ice-blue
  accent, off-white text. Light counterpart: cool near-white, blue-gray text,
  darker blue accent. Both follow the existing system preference.
- The hero pairs "AI for engineering." with one generated refractive glass orb.
  Its cyan/violet interference colors are approved artwork, not a general
  purple-gradient UI. Keep real project images below; never invent results.
- Use a short, finite hero entrance; a gentle scroll-linked orb recession;
  and small project-image/CTA hover transforms. No perpetual motion, scroll
  hijacking, cursor replacement, WebGL scene, or animation library.
- Prefer native CSS scroll timelines behind feature and reduced-motion queries.
  Default styles stay visible and fully usable without JavaScript.
- Preserve the three featured projects, the remaining project routes, contact
  links, and the empty-blog behavior. Do not change their technical claims.
- Generated source artwork came from the built-in image-generation tool. The
  source PNG has an opaque dark background; render it through Astro's image
  pipeline and visually check the edge treatment in both schemes.

The first slice was a local homepage prototype, not an authorized release.

## Original v1 design record (historical)

Produced with the `design-taste-frontend` skill, 2026-08-21. Binding on every UI task
(C-1 onward). Re-read before building any component or page.

---

## Design read

> **Reading this as:** a developer/researcher portfolio for ML/AI hiring managers, with
> a technical-editorial language, leaning toward Tailwind v4 `@theme` tokens over native
> CSS with no component library.

The reader is technically literate and scanning fast. Credibility comes from evidence
(real plots, real architecture, real results), not from decoration. The design's job is
to make nine dense engineering projects legible in 90 seconds.

## Dials

| Dial | Value | Reasoning |
|---|---|---|
| `DESIGN_VARIANCE` | **7** | Above the skill's developer-portfolio preset of 6. George's explicit standard is "intentionally designed, not a default template," and asymmetry is the cheapest way to escape template-feel without costing performance. |
| `MOTION_INTENSITY` | **4** | Below the preset of 5. `SPEC.md` requires Lighthouse accessibility = 100 and LCP < 2.0 s with < 20 KB JS. Level 4 is CSS-only fluid transitions, which we can deliver honestly. |
| `VISUAL_DENSITY` | **4** | Standard. Nine projects with real detail; art-gallery airiness would push the index below the fold. |

## Stack reconciliation

The skill assumes React/Next plus the Motion library. `SPEC.md` forbids a client-side
framework and caps JS at 20 KB. **The spec wins**; the skill's intent is met differently:

| Skill default | What we do instead | Why it still satisfies the intent |
|---|---|---|
| Motion (`motion/react`) for animation | CSS transitions and scroll-driven animations (`animation-timeline: view()`) | Section 5.D explicitly permits CSS scroll-driven animations. Zero bundle cost. |
| `useReducedMotion()` hook | `@media (prefers-reduced-motion: reduce)` | Same guarantee, no JS. Mandatory at `MOTION_INTENSITY` 4. |
| `next/font` | Self-hosted `@font-face` with `font-display: swap`, subset and preloaded | Skill's rule is "never link Google Fonts via `<link>` in production." Self-hosting also protects the LCP budget. |
| Tailwind `dark:` variant | `@theme` tokens swapped under `prefers-color-scheme` | `SPEC.md` already mandates the token strategy; the skill leaves the choice open. |
| "Motion claimed = motion shown" | Real entry and hover transitions, or the dial drops to 3 | We ship working CSS motion or we ship none. No half-built animation. |

**Icons — RESOLVED 2026-08-21.** Approved: `astro-icon` with the **Phosphor** set
(`@iconify-json/ph`). Icons are resolved and inlined at build time, so client JS stays at
zero. One family for the whole site, one global stroke weight, no hand-rolled SVG paths.
Installed in C-3.

## Committed decisions

**Typography.** Not Inter. A sans display face for headings paired with a mono for
metadata, stack labels, and figure captions — mono is honest here because the content is
genuinely technical. Body at `max-w-[65ch]`, `leading-relaxed`.

**Color.** One accent, locked across every section. Neutral base (zinc/stone family),
not the AI-purple/blue-glow default. No gradient text. Off-black and off-white, never
`#000`/`#fff`. Both color schemes designed from the start, one page-level theme with no
mid-page inversion.

**Layout.** No centered hero (`DESIGN_VARIANCE` 7 forbids it). Asymmetric split. At
least four distinct layout families across the site; the project index must not reuse the
home page's featured-projects composition. Max two consecutive image+text splits.

**Shape.** One corner-radius scale, chosen once, applied everywhere.

## Bans carried into this project

Zero em-dashes anywhere visible. No eyebrow above every section (max 1 per 3 sections).
No section-number labels (`001 · Projects`). No scroll cues. No decorative status dots.
No middle-dot separator chains. No version stamps. No locale/time strips. No fake
precision — every number traces to a repo README and clears the `<!-- CONFIRM -->` gate.
No div-based fake screenshots: we have **46 real figures**, so there is no excuse.
No three-equal-cards feature row. No `border-t` + `border-b` on every row of a list.

## Pre-flight

The skill's Section 14 checklist runs before any UI task is marked done, not at the end
of the slice. Gate 3 and Gate 6 in `tasks/todo.md` are where it is enforced.
