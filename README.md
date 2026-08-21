# Portfolio — georgeanes.github.io

Personal portfolio site for George Anesiadis. Static, built with Astro, deployed to
GitHub Pages.

## Documentation

| Document | Purpose |
|---|---|
| [`SPEC.md`](SPEC.md) | Source of truth — objective, stack, conventions, boundaries, success criteria |
| [`tasks/plan.md`](tasks/plan.md) | Technical plan — dependency graph, build slices, risks |
| [`tasks/todo.md`](tasks/todo.md) | Ordered task list with acceptance and verification steps |

Read `SPEC.md` before changing anything. It defines what "done" means and which changes
require asking first.

## Development

```sh
npm ci          # install
npm run dev     # dev server at localhost:4321
npm run build   # static build to dist/
npm run preview # serve the build locally
npm run verify  # full gate: check, lint, test, build, e2e
```

`npm run verify` must pass before every commit.

## Stack

Astro 7 (static, zero client JS by default) · TypeScript strict · Tailwind CSS v4 ·
Vitest · Playwright + axe · GitHub Pages via Actions. Requires Node 24 (see `.nvmrc`).

## Content

Projects and posts are Astro content collections under `src/content/`, validated by the
Zod schemas in `src/content.config.ts`. `my-repos.json` is seed data only — nothing
imports it at build time.
