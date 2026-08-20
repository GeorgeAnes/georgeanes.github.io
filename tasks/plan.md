# Technical Plan — Portfolio Site v1

Derived from `SPEC.md` (approved 2026-08-20). Read that first; this document does not
restate requirements, only how they get built.

Status: **Approved 2026-08-20 — Phase 2 gate passed. Tasks in `tasks/todo.md`.**

---

## 1. What the evidence changed

Reconnaissance on 2026-08-20 (all 9 project repos cloned) moved two assumptions:

| Assumed at spec time | Actually true | Effect on the plan |
|---|---|---|
| Repos have no usable content | Every repo has a 55–312 line README with problem/approach/results | Content drafting is **summarization**, not interviewing. Cheaper and lower-risk. |
| Text-only project pages | **46 figures/screenshots** exist across the repos | Image pipeline becomes a **first-class component**, not an afterthought. It is the main threat to the LCP < 2.0 s target. |

The image finding is the single biggest driver below. Nine project pages carrying raw
PNG plots would miss success criterion 5 outright; the plan therefore treats asset
optimization as a build-order dependency, not a polish step.

---

## 2. Component inventory and dependency graph

```
                    ┌──────────────────────┐
                    │ A. Toolchain         │  astro, ts, tailwind, prettier,
                    │    (scaffold + CI)   │  eslint, vitest, playwright, CI
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
   ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
   │ B. Content     │ │ C. Design      │ │ D. Deploy      │
   │    schema      │ │    system      │ │    pipeline    │
   │ (Zod, Astro    │ │ (tokens, Base  │ │ (Pages,        │
   │  collections)  │ │  Layout, SEO)  │ │  Actions)      │
   └───────┬────────┘ └───────┬────────┘ └────────────────┘
           │                  │                    ▲
           ├──────────────────┤                    │ (independent after A;
           ▼                  ▼                    │  verifies at F)
   ┌────────────────┐ ┌────────────────┐
   │ E. Image       │ │ F. Page shells │
   │    pipeline    │ │ (index, 404,   │
   │ (optimize,     │ │  routes stubbed)│
   │  <Image/>)     │ └───────┬────────┘
   └───────┬────────┘         │
           └─────────┬────────┘
                     ▼
          ┌─────────────────────┐
          │ G. Project catalog  │  index + [...slug] + ProjectCard
          │    (9 entries)      │  ← the deliverable that matters
          └──────────┬──────────┘
                     │
           ┌─────────┴─────────┐
           ▼                   ▼
  ┌─────────────────┐  ┌─────────────────┐
  │ H. Blog         │  │ I. Home page    │
  │ (empty-safe)    │  │  (hero/about/   │
  │                 │  │   contact)      │
  └────────┬────────┘  └────────┬────────┘
           └─────────┬──────────┘
                     ▼
          ┌─────────────────────┐
          │ J. Launch hardening │  a11y, Lighthouse, links, OG, sitemap
          └─────────────────────┘
```

**Critical path:** A → B → E → G → J. Everything else has slack.

**Parallelizable after A:** C (design system), D (deploy pipeline), and B (schema) touch
disjoint files and can proceed in any order. D can be built and verified against a
placeholder page long before the real content exists — do it early so deployment
problems surface when they are cheap.

**Hard sequencing rules**

- E before G. Rewriting 9 project pages to swap image handling is the expensive mistake
  this ordering exists to prevent.
- B before G. The schema is the contract; pages typed against a half-built schema get
  rewritten.
- C before F. Page shells built without tokens get restyled.
- H and I depend on G only for shared components (`ProjectCard`, `ProseLayout`), not for
  content. If time runs short, H is the cut.

---

## 3. Build order — vertical slices

Each slice ends in something demonstrable, not a layer that "will pay off later".

### Slice 1 — Walking skeleton (A + D)
Scaffold Astro, wire the full toolchain, and **deploy a one-line homepage to
`georgeanes.github.io` on day one.** A live URL before any real content means every
later slice is a visible increment, and Pages/Actions/permissions problems get found
while the diff is three lines.

**Demonstrable:** a real public URL that serves a real page, updated by a commit.

### Slice 2 — Content contract (B)
Zod schemas for `projects` and `posts`. Write `tests/content.test.ts` **first**: it
asserts the 9 expected slugs, non-empty summaries, valid `repoUrl`s. It fails (no
content yet) — that failing test is the definition of done for the whole content effort.

**Demonstrable:** `npm test` fails with a precise, meaningful list of what's missing.

### Slice 3 — Design system + shell (C + F)
Design tokens in `@theme`, `BaseLayout` with skip-link and SEO head, header/footer,
404. Light and dark via `prefers-color-scheme`.

**Demonstrable:** a styled, accessible, empty site at three breakpoints.

### Slice 4 — Image pipeline (E)
Curate figures from the 46 available, convert to Astro `<Image />` with explicit
dimensions (CLS), AVIF/WebP output, lazy-loading below the fold, eager + `fetchpriority`
for any LCP image. Establish the per-project asset convention here, once.

**Demonstrable:** one project page with three optimized images, measured.

### Slice 5 — Project catalog (G) ← *the slice that matters*
Draft all 9 content files from the cloned READMEs, then index + detail pages. Do the
**hardest project first** (`enterprise-ai-document-risk-auditor`, 312-line README, most
architecture) to expose schema gaps while only one file needs revising.

**Demonstrable:** Slice 2's failing test turns green. That is AC2 and AC4 satisfied.

### Slice 6 — Home + blog (I + H)
Hero, about, contact, featured three; blog index that renders correctly with zero posts
and stays out of nav until a post exists.

**Demonstrable:** every AC has a page behind it.

### Slice 7 — Launch hardening (J)
Playwright a11y sweep, Lighthouse against the deployed URL, link check, OG images,
sitemap/robots. Close carried risks R1–R3.

**Demonstrable:** every numbered success criterion in `SPEC.md` checked off with evidence.

---

## 4. Risks and mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| P1 | **Image weight blows the LCP < 2.0 s and 20 KB JS budgets.** 46 candidate figures; MATLAB/matplotlib PNG plots are large and text-heavy. | High | High | Slice 4 precedes all project pages. Hard budget: **≤ 3 images per project page**, hero image ≤ 150 KB after conversion. Measure on the deployed URL at the end of slices 4, 5, and 7 — not once at the end. |
| P2 | **Content drafting stalls.** 9 write-ups is the bulk of the human effort and needs George's confirmation on every number (Never-do rule). | High | High | Draft from READMEs, but mark every metric `<!-- CONFIRM -->` in the file. A dedicated confirmation pass batches all 9 into one review instead of nine interruptions. Schema requires `summary`; detailed `results` stays optional so a project can ship on its summary alone. |
| P3 | **Astro 7 API drift.** My knowledge of the Content Layer API predates 7.2.4; `content.config.ts` shape and the `glob()` loader may differ. | Medium | Medium | Slice 1 resolves this against **official Astro 7 docs** before schema work starts (`source-driven-development`). No API detail in this plan is authoritative until verified. |
| P4 | **Tailwind v4 CSS-first config.** v4 dropped `tailwind.config.js` for `@theme`; muscle memory produces v3 patterns that silently no-op. | Medium | Low | Verify against v4 docs in slice 3. One token file, reviewed once. |
| P5 | **GitHub Pages misconfiguration** — wrong repo name, Actions permissions, or an unset Pages source. | Medium | Medium | Slice 1 exists specifically to hit this on day one with a trivial diff. |
| P6 | ~~Third-party naming (R1) forces a late rewrite.~~ **RETIRED 2026-08-20** — R1 closed in favour of naming ASML and TU/e explicitly. | — | — | Residual: attribute team projects as team work and claim no endorsement. Covered by task G-4. |
| P7 | **Scope creep into the blog.** Writing posts is unbounded work outside this spec. | Medium | Low | v1 ships blog *infrastructure*, zero posts. Explicit in AC6. |

---

## 5. Verification checkpoints

Gates between slices. Failing a gate means fixing it before the next slice, not logging it.

| After | Gate |
|---|---|
| Slice 1 | `npm run verify` green on a clean `npm ci`; **deployed URL returns 200**; a fresh commit updates the live site within 5 min *(SC 1, 9)* |
| Slice 2 | Content tests fail for exactly the right reason (9 named missing slugs), and pass against a single hand-made fixture |
| Slice 3 | axe: zero serious/critical on the shell; keyboard traversal reaches everything; skip-link works; no horizontal scroll at 320/768/1440 in both schemes *(SC 6, 8)* |
| Slice 4 | Measured on the deployed page: LCP < 2.0 s, CLS < 0.05, JS < 20 KB gzipped *(SC 5)* |
| Slice 5 | `tests/content.test.ts` green — all 9 slugs, no empty summaries; all 10 project routes (index + 9 detail) return 200 *(SC 2, 3 / AC2, AC4)* |
| Slice 6 | Every AC1–AC6 demonstrably satisfied on the deployed site |
| Slice 7 | Lighthouse ≥ 95/100/95/100 mobile; link check clean; R1–R3 closed *(SC 4, 7, 10)* |

---

## 6. Explicitly not in this plan

Writing blog posts · CV page and PDF (out of scope in `SPEC.md`) · analytics · contact
form · the RL quadcopter project (R2 — no public repo) · any client-side framework.

---

## 7. Phase 2 gate — decisions signed off 2026-08-20

1. **Deploy-first ordering — APPROVED.** Slice 1 deploys immediately to
   `georgeanes.github.io`. Public but unlinked until content lands.
2. **Image budget ≤ 3 per project page — APPROVED.** Keep it lean; SC 5 stands
   unrelaxed. This is now a hard constraint, enforced in task G-2.
3. **Hardest-project-first — APPROVED.** Slice 5 opens with
   `enterprise-ai-document-risk-auditor`.
4. **R1 — CLOSED.** ASML and TU/e are named explicitly. Risk P6 (late rewrite from a
   naming reversal) is therefore **retired**; the "one removable sentence" constraint
   no longer applies. See `SPEC.md` → Carried Risks → R1 for the attribution rules that
   still hold.
