# Spec: George Anesiadis — Personal Portfolio Site

Status: **Shipped 2026-08-21. Live at https://georgeanes.github.io/**
Verification: `tasks/lighthouse-report.md`. Plan in `tasks/plan.md`.
Last updated: 2026-08-20

## Objective

Build and deploy a public portfolio website that presents George Anesiadis as a
credible candidate for **ML / AI engineering roles**.

**User:** A hiring manager, recruiter, or engineer who lands on the site from a CV,
LinkedIn message, or GitHub profile. They have 60–90 seconds and one question:
*"Can this person build real ML/AI systems?"*

**Why now:** The 10 GitHub repos in `my-repos.json` have **empty descriptions and no
README-level framing**. The work exists; the story does not. The site's job is to
supply the story GitHub cannot.

**Success looks like:** a visitor can, in under two minutes, name three projects
George built, say what problem each solved, and find a way to contact him.

### Acceptance criteria (user-facing)

- AC1 — Landing on `/`, a visitor sees who George is and what he does above the fold,
  with no scrolling, on a 1366×768 laptop.
- AC2 — All **9 project repos** appear as project entries, each with a human-written
  summary; **no entry shows an empty description**. (`my-repos.json` lists 10 repos;
  `GeorgeAnes` is the GitHub *profile* repo and is excluded — it is a bio source, not
  a project. Verified 2026-08-20: those 10 are the complete set of public repos.)
- AC3 — Projects relevant to ML/AI engineering sort first on the index page.
- AC4 — Each project has a detail page at `/projects/<slug>/` with problem, approach,
  results, stack, and a link to its GitHub repo.
- AC5 — A visitor can reach email (`giwrgosanesiadis4@gmail.com`) and the GitHub
  profile (`github.com/GeorgeAnes`) from any page. LinkedIn is deliberately omitted
  from v1 at George's request.
- AC6 — The blog index renders at `/blog/`, works with zero posts, and does not
  appear in primary navigation until at least one post is published.

## Tech Stack

| Concern | Choice | Version |
|---|---|---|
| Framework | Astro (static output, zero client JS by default) | 7.2.4 |
| Content | Astro content collections + MDX (`@astrojs/mdx`) | 7.0.7 |
| Styling | Tailwind CSS v4 (CSS-first config, `@theme`) | 4.3.3 |
| Language | TypeScript, `strict` | via `astro check` |
| Unit tests | Vitest | latest 3.x |
| E2E / a11y | Playwright + `@axe-core/playwright` | latest |
| Runtime | Node | 24.18.0 (local); pinned to 24 in CI |
| Hosting | GitHub Pages via GitHub Actions | — |

**No client-side framework.** React/Vue/Svelte are not in scope; if an island genuinely
needs interactivity, it is written as a vanilla `<script>` in the `.astro` file.

## Commands

```
Install:      npm ci
Dev:          npm run dev                 # astro dev --host
Build:        npm run build               # astro build
Preview:      npm run preview             # astro preview
Typecheck:    npm run check               # astro check
Lint:         npm run lint                # eslint . --max-warnings=0
Format:       npm run format              # prettier --write .
Unit tests:   npm run test                # vitest run
Unit (watch): npm run test:watch          # vitest
Coverage:     npm run test:coverage       # vitest run --coverage
E2E tests:    npm run test:e2e            # playwright test
Full gate:    npm run verify              # check && lint && test && build && test:e2e
```

`npm run verify` is the single command CI runs and the single command that must pass
before any commit lands on the default branch.

## Project Structure

```
.
├── SPEC.md                     → This document (source of truth)
├── tasks/
│   ├── plan.md                 → Phase 2 technical plan
│   └── todo.md                 → Phase 3 ordered task list
├── astro.config.mjs            → Astro config: site URL, MDX, integrations
├── src/
│   ├── content.config.ts       → Collection schemas (projects, posts) — Zod
│   ├── content/
│   │   ├── projects/           → One .md per project, slug = repo name
│   │   └── posts/              → One .mdx per blog post
│   ├── pages/
│   │   ├── index.astro         → Hero + featured projects + about + contact
│   │   ├── projects/index.astro
│   │   ├── projects/[...slug].astro
│   │   ├── blog/index.astro
│   │   ├── blog/[...slug].astro
│   │   └── 404.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro    → <head>, meta, skip link, header, footer
│   │   └── ProseLayout.astro   → Long-form wrapper for project/post bodies
│   ├── components/             → ProjectCard, TagList, ContactLinks, SEO, …
│   ├── config/site.ts          → Site name, URL, published contact details
│   ├── icons/                  → Empty; astro-icon scans it. Phosphor set is used instead
│   ├── lib/                    → Pure TS helpers (sorting, formatting) — unit tested
│   └── styles/global.css       → Tailwind v4 entry + @theme design tokens
├── public/                     → Favicon, OG images, static assets
├── tests/                      → Vitest unit tests, mirrors src/lib
├── e2e/                        → Playwright specs
└── .github/workflows/
    ├── ci.yml                  → verify on every push + PR
    └── deploy.yml              → build + deploy to Pages on the default branch
```

`my-repos.json` is **seed data only**. Once the content files exist it is reference
material, not a build input — nothing imports it at build time.

## Code Style

One real component beats a paragraph of rules:

```astro
---
// src/components/ProjectCard.astro
import type { CollectionEntry } from 'astro:content';
import TagList from './TagList.astro';

interface Props {
  project: CollectionEntry<'projects'>;
  featured?: boolean;
}

const { project, featured = false } = Astro.props;
const { title, summary, stack, repoUrl } = project.data;
---

<article class:list={['group rounded-lg border p-6', featured && 'border-accent']}>
  <h3 class="text-lg font-medium">
    <a href={`/projects/${project.id}/`} class="after:absolute after:inset-0">
      {title}
    </a>
  </h3>
  <p class="mt-2 text-sm text-muted">{summary}</p>
  <TagList tags={stack} />
  <a href={repoUrl} rel="noopener" class="relative mt-4 inline-block text-sm">
    View source on GitHub
  </a>
</article>
```

**Conventions**

- Components `PascalCase.astro`; helpers and tests `kebab-case.ts`; content files
  `kebab-case.md`, slug = the GitHub repo name exactly.
- Every component declares a typed `interface Props`. No untyped `Astro.props`.
- Content shape lives in the Zod schema in `content.config.ts`, never in ad-hoc casts.
- Business logic (sorting, filtering, date formatting) goes in `src/lib/` as pure
  functions so it is unit-testable without rendering.
- Tailwind utilities inline; design tokens (`--color-accent`, `--font-display`) defined
  once in `@theme`. No arbitrary hex values in markup.
- Prettier + `prettier-plugin-astro` decide all formatting. Style is never hand-reviewed.
- Semantic HTML first: `<article>`, `<nav>`, `<time>`, one `<h1>` per page.

## Testing Strategy

Proportionate to a static site — thin at the unit level, meaningful at the page level.

| Level | Tool | Location | Covers |
|---|---|---|---|
| Types | `astro check` | — | Props, collection entry types, config |
| Unit | Vitest | `tests/**/*.test.ts` | Everything in `src/lib/` — sorting, tag normalization, date formatting |
| Schema | Vitest | `tests/content.test.ts` | Every content file parses against its Zod schema; all 9 project slugs present; no empty summaries (AC2) |
| E2E | Playwright | `e2e/*.spec.ts` | Page renders, nav works, project detail pages resolve, contact links present (AC1, AC4, AC5) |
| A11y | axe-core in Playwright | `e2e/a11y.spec.ts` | Zero serious/critical violations on `/`, a project page, a blog page |
| Links | `lychee` in CI | workflow | No broken internal or external links |

**Coverage expectation:** 100% of `src/lib/` — it is pure and small, so there is no
excuse. No coverage target on `.astro` components; E2E covers them behaviorally.

**TDD applies to `src/lib/` and the content schema.** Write the failing test first. It
does not apply to markup and styling, which are verified visually and by E2E.

## Boundaries

**Always do**
- Run `npm run verify` before every commit.
- Write the content file for a project before building its detail page.
- Give every image an `alt`; every interactive element a visible focus ring.
- Keep the site fully functional with JavaScript disabled.
- Update `SPEC.md` first when a decision changes, then the code.

**Ask first**
- Adding any runtime dependency (build-time dev deps within the listed stack are fine).
- Adding a client-side framework or an interactive island.
- Changing the URL structure of a page that already shipped.
- Adding analytics, tracking, embedded third-party scripts, or web fonts served from a
  third-party host.
- Publishing anything that names a real employer, colleague, or private project detail.
- Creating the public GitHub repo or enabling Pages for the first time.

**Never do**
- Commit secrets, tokens, or `.env` files.
- Commit personal data beyond what George chooses to publish (no phone number, no home
  address, no student ID).
- Invent project results, metrics, dates, or claims. Every number on the site must be
  something George confirms is true.
- Delete or skip a failing test to make CI green.
- Force-overwrite the shared history of the default branch.
- Hand-edit anything in `dist/` or `node_modules/`.

## Success Criteria

Done means every one of these is objectively true:

1. `npm run verify` exits 0 from a clean `npm ci` on Node 24.
2. All 9 project repos have a content file with a non-empty `summary` and a reachable
   `repoUrl`; `tests/content.test.ts` enforces this and fails if a slug is missing or
   an unexpected one appears. *(AC2)*
3. `/`, `/projects/`, `/projects/<slug>/` (×9), `/blog/`, and `/404` all build and
   return 200 from `npm run preview`. *(AC4)*
4. Lighthouse on the deployed `/`: Performance ≥ 95, Accessibility = 100, Best
   Practices ≥ 95, SEO = 100, mobile profile.
5. Core Web Vitals on simulated 4G: LCP < 2.0 s, CLS < 0.05, total transferred JS on
   `/` < 20 KB gzipped.
6. Zero serious or critical axe violations on `/`, one project page, one blog page.
   Full keyboard traversal reaches every link; a skip-to-content link is present.
7. Every page has a unique `<title>`, meta description, canonical URL, and OG image;
   `sitemap-index.xml` and `robots.txt` are generated.
8. Renders correctly at 320 px, 768 px, and 1440 px with no horizontal scroll, in both
   light and dark color schemes.
9. The site is live on GitHub Pages, deployed by GitHub Actions from the default
   branch, and a fresh commit updates it within 5 minutes.
10. `SPEC.md`, `tasks/plan.md`, and `tasks/todo.md` are committed and reflect what
    actually shipped.

## Out of Scope (v1)

CV/resume page and PDF download · contact form or any backend · comments · search ·
i18n · CMS · manual dark/light toggle (respect `prefers-color-scheme` only) ·
live GitHub API stats · RSS beyond a basic feed if it comes free with the blog.

## Resolved Decisions

Approved 2026-08-20. Recorded here because downstream tasks depend on them.

1. **Pages URL — RESOLVED.** Deploy as a GitHub *user site*: repo `georgeanes.github.io`,
   served at `https://georgeanes.github.io/` with **no `base` path**. No custom domain.
   → `astro.config.mjs` sets `site: 'https://georgeanes.github.io'`.
2. **Contact — RESOLVED.** Public email `giwrgosanesiadis4@gmail.com`; GitHub profile
   link `https://github.com/GeorgeAnes`. **No LinkedIn in v1.**
   *Note:* a LinkedIn URL (`linkedin.com/in/anesgeorge/`) is already public on the
   GitHub profile README. Omitted per instruction; it is a one-line addition later.
3. **Bio — RESOLVED from primary source.** The `GeorgeAnes` profile README supplies the
   facts, so nothing is invented: *MSc Artificial Intelligence & Engineering Systems
   student at TU/e, High Tech Systems & Robotics track; background in Chemical
   Engineering.* Focus areas: MPC and robotics, multi-agent systems, ML for sensor and
   vision data, optimization, AI engineering for industrial workflows.
   George reviews the final hero and about copy before launch.
4. **Project write-ups — RESOLVED.** All 9 project repos are public and were cloned
   2026-08-20. **Every one has a substantive README** (55–312 lines) with a stated
   problem, approach, and results, plus **46 figures/screenshots** in total. Drafting
   is therefore summarization from primary source, not invention. Numeric results still
   require George's confirmation before they ship (Never-do rule).
5. **Featured set — RESOLVED (default accepted).** `enterprise-ai-document-risk-auditor`,
   `vfrm-agentic-design-assistant`, `facial-expression-recognition-ml`.
6. **Blog at launch — RESOLVED (default accepted).** Build `/blog/` so it renders with
   zero posts; hide it from primary nav until a post exists (AC6).

## Carried Risks

Open items that do not block the plan but must be closed before launch.

- **R1 — CLOSED 2026-08-20.** Naming **ASML** and TU/e course **5ARIP10** explicitly is
  approved — real names build credibility. Constraints that still apply: describe the
  collaboration only as the public README already does, claim no ASML endorsement, and
  attribute team work as team work (`vfrm-agentic-design-assistant` was TU/e 5ARIP10
  Team 1, not solo). The *Ask first* boundary still governs any **new** third-party
  name not already public in a repo README.
- **R2 — CLOSED 2026-08-21.** The *RL quadcopter landing* project is omitted from v1,
  as agreed. Nothing on the site references it, so no unlinkable claim ships.
- **R3 — CLOSED 2026-08-21.** No face imagery ships. The three figures used from
  `facial-expression-recognition-ml` are a pipeline block diagram, a model-comparison
  chart and a confusion matrix. The only figure that could plausibly have contained a
  face was opened and checked; it does not. No consent question arises.
