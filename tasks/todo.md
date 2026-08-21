# Task List — Portfolio Site v1

Ordered by dependency, not importance. Derived from `tasks/plan.md` slices 1–7.
Rules: no task touches more than ~5 files · every task has a verify step · finish a task
completely before starting the next · `npm run verify` before every commit.

Legend: **[G]** = slice gate, do not proceed past it while red.

---

## Slice 1 — Walking skeleton

- [x] **A-1 · Scaffold Astro 7 project** ✅ 2026-08-21 (`0343c73`)
  - Acceptance: `npm create astro@latest` (minimal, TypeScript strict) produces a
    building project; Node pinned to 24 in `.nvmrc` and `package.json` `engines`.
  - Verify: `npm run build` exits 0; `npm run dev` serves a page.
  - Files: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.nvmrc`, `.gitignore`

- [x] **A-2 · Verify Astro 7 / Tailwind 4 APIs against official docs** ✅ 2026-08-21
  - Why: plan risks P3 and P4 — my knowledge predates 7.2.4, and Tailwind v4 dropped
    `tailwind.config.js` for CSS-first `@theme`. Guessing here silently no-ops.
  - Acceptance: written notes confirming the Content Layer `defineCollection`/`glob()`
    signature, `content.config.ts` location, the `<Image />` import path, and the
    Tailwind v4 Vite plugin setup. Corrections applied back into `SPEC.md` if the
    documented API differs from what the spec assumes.
  - Verify: a throwaway collection + a `@theme` token both work in `dev`.
  - Files: `tasks/notes-astro7.md`

- [x] **A-3 · Wire toolchain and the `verify` script** ✅ 2026-08-21
  - Acceptance: prettier + `prettier-plugin-astro`, eslint (`--max-warnings=0`), vitest,
    playwright + `@axe-core/playwright` installed; all 10 scripts from `SPEC.md` →
    Commands exist and run.
  - Verify: `npm run verify` exits 0 on the empty project.
  - Files: `package.json`, `.prettierrc`, `eslint.config.js`, `vitest.config.ts`,
    `playwright.config.ts`

- [x] **A-4 · Configure site URL for user-site deployment** ✅ 2026-08-21
  - Acceptance: `site: 'https://georgeanes.github.io'`, **no `base`** (user site serves
    at root — see `SPEC.md` → Resolved Decisions 1).
  - Verify: built `dist/` links and canonicals are root-absolute, not `/portfolio/…`.
  - Files: `astro.config.mjs`

- [x] **D-1 · CI workflow** ✅ 2026-08-21
  - Acceptance: `ci.yml` runs `npm ci && npm run verify` on Node 24 for every push and PR.
  - Verify: workflow green in Actions.
  - Files: `.github/workflows/ci.yml`

- [x] **D-2 · Create `georgeanes.github.io` repo and enable Pages** ✅ 2026-08-21 (authorized)
  - ⚠️ **Ask-first boundary** (`SPEC.md`): creating the public repo and enabling Pages
    is George's call to trigger. Confirm before running.
  - Acceptance: public repo exists, Pages source = GitHub Actions, Actions has
    `pages: write` + `id-token: write`.
  - Verify: Pages settings show "GitHub Actions" as source.
  - Files: — (GitHub settings)

- [x] **D-3 · Deploy workflow** ✅ 2026-08-21
  - Acceptance: `deploy.yml` builds and publishes `dist/` to Pages on the default branch
    via `actions/deploy-pages`, with a concurrency group.
  - Verify: **`https://georgeanes.github.io/` returns 200**; a fresh commit updates it
    within 5 minutes.
  - Files: `.github/workflows/deploy.yml`

- [x] **[G] Gate 1** ✅ 2026-08-21 — CI green from clean `npm ci` (52s); https://georgeanes.github.io/ returns 200; deploy 40s, well under 5 min.
  Criteria: `npm run verify` green from clean `npm ci`; live URL returns 200;
  commit-to-live under 5 min. *(SC 1, SC 9)*

---

## Slice 2 — Content contract

- [x] **B-1 · Write the failing content test first (TDD)** ✅ 2026-08-21
  - Acceptance: `tests/content.test.ts` asserts exactly the 9 project slugs
    (`aero-mpc-spc-koopman-control`, `camera-calibration-nerfstudio-pipeline`,
    `enterprise-ai-document-risk-auditor`, `facial-expression-recognition-ml`,
    `multi-drone-ltl-formation-control`, `petri-net-ga-optimization`,
    `process-mining-kpi-dashboard`, `smartphone-activity-recognition`,
    `vfrm-agentic-design-assistant`); no empty `summary`; every `repoUrl` under
    `github.com/GeorgeAnes/`; fails if an unexpected slug appears.
  - Verify: `npm test` fails naming all 9 missing slugs — **that precise failure is the
    definition of done for slice 5.**
  - Files: `tests/content.test.ts`

- [x] **B-2 · Define collection schemas** ✅ 2026-08-21
  - Acceptance: Zod schema for `projects` (`title`, `summary`, `stack[]`, `repoUrl`,
    `featured?`, `order?`, `role?`, `results?`, `heroImage?`) and `posts`
    (`title`, `description`, `pubDate`, `draft?`). `summary` required and non-empty;
    `results` optional so a project can ship on its summary alone (plan risk P2).
    **Per A-2:** import `z` from `astro/zod` and `glob` from `astro/loaders`; the
    `projects` schema must use the function form `({ image }) => z.object({…})` so
    `heroImage` can be validated by the `image()` helper.
  - Verify: `astro check` clean; one hand-made fixture entry passes B-1's schema
    assertions.
  - Files: `src/content.config.ts`

- [x] **B-3 · Project ordering helper (TDD, pure)** ✅ 2026-08-21
  - Acceptance: `sortProjects()` in `src/lib/` puts featured first, then ML/AI-relevant
    ahead of control/robotics (AC3), stable and deterministic within groups.
  - Verify: unit tests cover featured-first, category order, and tie-breaking;
    100% coverage of `src/lib/` (`SPEC.md` → Testing Strategy).
  - Files: `src/lib/sort-projects.ts`, `tests/sort-projects.test.ts`

- [x] **[G] Gate 2** ✅ 2026-08-21 — content test fails naming all 9 missing slugs (1 failed, 6 passed); schema verified against a valid fixture and rejects each invalid field with a precise message; `src/lib/` at 100% statements, branches, functions, lines.

---

## Slice 3 — Design system and shell

- [x] **C-1 · Design tokens** ✅ 2026-08-21
  - Acceptance: Tailwind v4 `@theme` block defines color, type, and spacing tokens for
    light **and** dark via `prefers-color-scheme`. No manual toggle (out of scope).
    No arbitrary hex in markup thereafter.
  - Verify: a probe page renders correctly in both schemes; forced-colors mode legible.
  - Files: `src/styles/global.css`, `astro.config.mjs`

- [x] **C-2 · BaseLayout with skip link and SEO head** ✅ 2026-08-21
  - Acceptance: `<html lang="en">`, unique title/description per page, canonical, OG +
    Twitter tags, skip-to-content link as first focusable element, one `<h1>` per page.
  - Verify: view-source on two pages shows distinct titles and canonicals.
  - Files: `src/layouts/BaseLayout.astro`, `src/components/SEO.astro`

- [x] **C-3 · Header, footer, contact links** ✅ 2026-08-21
  - Acceptance: header nav (Projects, About; **blog hidden until a post exists** — AC6);
    footer with email `giwrgosanesiadis4@gmail.com` and
    `https://github.com/GeorgeAnes`. **No LinkedIn** (Resolved Decision 2). Reachable
    from every page (AC5).
  - Verify: e2e asserts both links present on 3 different page types.
  - Files: `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`,
    `src/components/ContactLinks.astro`, `e2e/contact.spec.ts`

- [x] **C-4 · 404 page** ✅ 2026-08-21
  - Acceptance: styled 404 using BaseLayout with a route back home.
  - Verify: `dist/404.html` exists and renders.
  - Files: `src/pages/404.astro`

- [x] **[G] Gate 3** ✅ 2026-08-21 — 30 e2e tests green: axe reports zero serious/critical on `/` and `/404`; all 7 interactive elements reachable by Tab; skip link is first focusable and moves focus to `#main`; no horizontal scroll at 320/768/1440 in both schemes; 0 client JS files shipped. *(SC 6, SC 8)*

---

## Slice 4 — Image pipeline

- [x] **E-1 · Asset convention and one optimized project page** ✅ 2026-08-21
  - Why first: plan risk **P1** — 46 raw MATLAB/matplotlib PNGs would miss LCP < 2.0 s.
    Establish the pattern once, before 9 pages depend on it.
  - Acceptance: per-project assets live at `src/assets/projects/<slug>/`; Astro
    `<Image />` from `astro:assets` with explicit `width`/`height` (CLS), AVIF/WebP
    output, and a real `alt` on every image. **Per A-2:** use the **`priority` prop**
    for the LCP image — it applies `loading="eager"`, `decoding="sync"`, and
    `fetchpriority="high"` together. Below-the-fold images need nothing: `loading`
    already defaults to `lazy` and `decoding` to `async`.
  - Verify: one project page renders 3 optimized images; no CLS on reload.
  - Files: `src/components/ProjectImage.astro`, `src/assets/projects/…`

- [x] **E-2 · Curate images to budget** ✅ 2026-08-21
  - Acceptance: **≤ 3 images per project** (approved hard constraint); hero image
    ≤ 150 KB after conversion. Prefer figures that show a *result* over decorative
    screenshots. **R3:** no third-party faces from a research dataset in
    `facial-expression-recognition-ml` — George's own image, licensed, or synthetic only.
  - Verify: `find src/assets -size +150k` returns nothing; per-project count ≤ 3.
  - Files: `src/assets/projects/**`

- [~] **[G] Gate 4** — PARTIAL 2026-08-21. Measured locally: CLS < 0.05 and JS < 20 KB both green in `e2e/performance.spec.ts`; every image carries intrinsic dimensions; no raw PNG or JPEG is served; exactly one image opts out of lazy loading. **LCP is not yet measured**: the branch is held back from `main` per the single-PR decision, so there is nothing deployed to measure against. J-4 closes it on the live site, which is the criterion of record. *(SC 5)*

---

## Slice 5 — Project catalog ← the slice that matters

- [x] **G-1 · Draft `enterprise-ai-document-risk-auditor` (hardest first)** ✅ 2026-08-21
  - Why first: 312-line README, most architecture — exposes schema gaps while only one
    file needs revising (approved decision 3).
  - Acceptance: full content file — problem, approach, results, stack, repoUrl. Every
    numeric claim tagged `<!-- CONFIRM -->` pending George's sign-off (Never-do rule).
  - Verify: parses against the schema; B-1 drops from 9 missing slugs to 8.
  - Files: `src/content/projects/enterprise-ai-document-risk-auditor.md`

- [x] **G-2 · Schema revision pass** ✅ 2026-08-21 — no changes required; `results` and `role` both proved correctly optional and the figures cap held. Recorded rather than skipped.
  - Acceptance: any field G-1 revealed as missing/wrong is fixed in `content.config.ts`
    **before** the remaining 8 are written.
  - Verify: `astro check` + `npm test` clean.
  - Files: `src/content.config.ts`, `tests/content.test.ts`

- [x] **G-3 · ProjectCard, project index, detail route** ✅ 2026-08-21
  - Acceptance: `/projects/` lists all entries via `sortProjects()` (AC3);
    `/projects/[...slug]` renders body through `ProseLayout` with stack, repo link, and
    images (AC4).
  - Verify: index + the one existing detail page return 200 and are keyboard-navigable.
  - Files: `src/components/ProjectCard.astro`, `src/pages/projects/index.astro`,
    `src/pages/projects/[...slug].astro`, `src/layouts/ProseLayout.astro`

- [x] **G-4 · Draft `vfrm-agentic-design-assistant`** ✅ 2026-08-21
  - Acceptance: names **ASML** and TU/e course **5ARIP10** explicitly (R1 closed).
    Attribution rules that still hold: describe the collaboration only as the public
    README does, claim **no ASML endorsement**, and state it as **Team 1 work, not
    solo**. Include the README's own scope limit — the agent returns Pareto design
    regions for engineering review, it does not certify a final actuator design.
  - Verify: schema passes; wording reviewed against `SPEC.md` → R1.
  - Files: `src/content/projects/vfrm-agentic-design-assistant.md`

- [x] **G-5 · Draft the remaining projects** ✅ 2026-08-21 — six, not seven: process-mining landed early in E-1 as the image-pipeline demonstrator.
  - Acceptance: one content file each for `facial-expression-recognition-ml`,
    `process-mining-kpi-dashboard`, `smartphone-activity-recognition`,
    `petri-net-ga-optimization`, `camera-calibration-nerfstudio-pipeline`,
    `multi-drone-ltl-formation-control`, `aero-mpc-spc-koopman-control`. Summarized from
    each repo's README; metrics tagged `<!-- CONFIRM -->`; team/coursework projects
    attributed honestly.
  - Verify: `npm test` — all 9 slugs present, no empty summaries. **Gate 2's failing
    test turns green.**
  - Files: 7 files in `src/content/projects/`
  - Note: split into 2–3 commits; do not land 7 write-ups in one diff.

- [ ] **G-6 · Metric confirmation pass**
  - ⚠️ **Blocks launch.** Batch every `<!-- CONFIRM -->` into one review for George
    rather than interrupting per project (plan risk P2).
  - Acceptance: zero `<!-- CONFIRM -->` markers remain; each number is confirmed true or
    removed. Nothing unconfirmed ships (Never-do rule).
  - Verify: `grep -r "CONFIRM" src/content/` returns nothing.
  - Files: `src/content/projects/**`

- [ ] **[G] Gate 5** — content tests green (9 slugs, no empty summaries); all 10 project
  routes (index + 9 detail) return 200. *(SC 2, SC 3 / AC2, AC4)*

---

## Slice 6 — Home and blog

- [ ] **I-1 · Hero and about**
  - Acceptance: name, one-line positioning, and focus areas visible **above the fold at
    1366×768 with no scrolling** (AC1). Bio facts sourced from the profile README —
    MSc AI & Engineering Systems at TU/e, HTS&R track, Chemical Engineering background.
    **No invented credentials.** George reviews the final copy.
  - Verify: Playwright viewport 1366×768 asserts `<h1>` and positioning line in the
    initial viewport without scrolling.
  - Files: `src/pages/index.astro`, `src/components/Hero.astro`, `e2e/home.spec.ts`

- [ ] **I-2 · Featured projects on the home page**
  - Acceptance: the three approved featured projects —
    `enterprise-ai-document-risk-auditor`, `vfrm-agentic-design-assistant`,
    `facial-expression-recognition-ml` — plus a link to the full index.
  - Verify: e2e asserts 3 cards and the index link.
  - Files: `src/pages/index.astro`

- [ ] **H-1 · Blog infrastructure (zero posts)**
  - Acceptance: `/blog/` renders a graceful empty state; `[...slug]` route builds with
    zero entries (no crash on an empty collection); MDX configured; nav link stays
    hidden until a post exists (AC6). **No posts written — out of scope.**
  - Verify: build succeeds with an empty `posts/`; `/blog/` returns 200; nav has no
    blog link.
  - Files: `src/pages/blog/index.astro`, `src/pages/blog/[...slug].astro`,
    `astro.config.mjs`

- [ ] **[G] Gate 6** — AC1–AC6 each demonstrably satisfied on the deployed site.

---

## Slice 7 — Launch hardening

- [ ] **J-1 · Accessibility sweep**
  - Acceptance: axe on `/`, a project page, and `/blog/` — zero serious/critical.
    Keyboard reaches every interactive element with a visible focus ring.
  - Verify: `npm run test:e2e` green including `e2e/a11y.spec.ts`.
  - Files: `e2e/a11y.spec.ts`

- [ ] **J-2 · SEO artifacts**
  - Acceptance: unique title + meta description + canonical per page; OG image
    (site-wide default, per-project where an image exists); `sitemap-index.xml` and
    `robots.txt` generated.
  - Verify: both files present in `dist/`; OG tags validate.
  - Files: `astro.config.mjs`, `public/robots.txt`, `src/components/SEO.astro`

- [ ] **J-3 · Link check in CI**
  - Acceptance: `lychee` fails CI on any broken internal or external link — including
    all 9 `repoUrl`s.
  - Verify: workflow green.
  - Files: `.github/workflows/ci.yml`

- [ ] **J-4 · Performance verification on the deployed site**
  - Acceptance: Lighthouse mobile — Performance ≥ 95, Accessibility = 100, Best
    Practices ≥ 95, SEO = 100. LCP < 2.0 s, CLS < 0.05, JS < 20 KB gzipped.
  - Verify: Lighthouse report saved to `tasks/lighthouse-report.md`.
  - Files: `tasks/lighthouse-report.md`

- [ ] **J-5 · Responsive and no-JS check**
  - Acceptance: no horizontal scroll at 320/768/1440 in light and dark; site fully
    functional with JavaScript disabled (`SPEC.md` → Always do).
  - Verify: Playwright at 3 viewports with `javaScriptEnabled: false`.
  - Files: `e2e/responsive.spec.ts`

- [ ] **J-6 · Close carried risks and final doc sync**
  - Acceptance: R1 attribution rules honored in shipped copy; R2 (RL quadcopter) omitted
    as agreed; R3 image consent verified; `SPEC.md`, `plan.md`, `todo.md` reflect what
    actually shipped (SC 10).
  - Verify: all 10 success criteria checked off with evidence.
  - Files: `SPEC.md`, `tasks/plan.md`, `tasks/todo.md`

- [ ] **[G] Gate 7 — LAUNCH** — every numbered success criterion in `SPEC.md` verified.

---

## Parallelizable

After A-1…A-3: **D-1/D-2/D-3**, **B-1/B-2**, and **C-1/C-2** touch disjoint files.
Everything else is sequential on the critical path A → B → E → G → J.

## Cut line

If time runs short, **H-1 (blog) is the cut** — it ships zero posts and hides itself
from nav anyway. Nothing else in slices 1–7 is optional; each maps to a numbered
success criterion.
