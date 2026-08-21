# Lighthouse Report — J-4

Measured against the **deployed** site at `https://georgeanes.github.io/`, mobile
profile, Lighthouse 12. Dated 2026-08-21.

## Result against SPEC.md success criteria

| Criterion | Target | Measured | Status |
|---|---|---|---|
| Accessibility | 100 | **100** | ✅ met |
| Best Practices | ≥ 95 | **100** | ✅ met |
| SEO | 100 | **100** | ✅ met |
| LCP | < 2.0 s | **1.85 s** median | ✅ met |
| CLS | < 0.05 | **0** | ✅ met |
| Total JS on `/` | < 20 KB | **0 KB** | ✅ met |
| Performance score | ≥ 95 | **99 when measurable, otherwise 90** | ⚠️ instrument-limited |

Accessibility, Best Practices and SEO all returned 100 on `/`, `/projects/` and a
project detail page.

## The performance score cannot be certified in this environment

Speed Index carries 10% of the performance score, and it is not measurable here.
Across 17 runs it came back **bimodal**: either ~1.5 s or ~10.2 s, never in
between, on identical content.

The Lighthouse trace shows why. On a run reporting Speed Index 10.36 s:

```
observedFirstVisualChange   7137 ms
observedLastVisualChange    7137 ms   <- identical
observedLoad                 413 ms   <- page had finished loading
observedDomContentLoaded     214 ms
```

First and last visual change are the same timestamp, meaning **only one
filmstrip frame was captured**, at 7.1 s, on a page that finished loading at
0.4 s. The affected runs were *faster* to load than the clean ones, and still
scored worse. That is a headless screenshot capture failure, not a site problem.

Passing `--headless=new` made it worse: the filmstrip broke in all six runs.
With plain `--headless`, roughly two runs in five captured correctly, and every
correctly captured run scored **99**.

**How to confirm properly:** run Lighthouse from Chrome DevTools, or use
PageSpeed Insights at `https://pagespeed.web.dev/analysis?url=https://georgeanes.github.io/`.
Both use a real browser rather than this headless setup and will produce a
trustworthy performance number.

## Supporting evidence that the site is genuinely fast

None of these depend on the filmstrip:

- **97 KiB** total page weight, everything included
- **Zero** JavaScript files shipped
- Largest asset is a 29.4 KB font; largest image is a 19.8 KB AVIF
- LCP consistently 1.75–2.0 s under mobile throttling
- Total Blocking Time **0 ms**, Cumulative Layout Shift **0**
- Load complete at ~0.4 s

## Fixes this measurement drove

Lighthouse caught three defects the local test suite passed over:

1. **Heading order.** `ProjectCard` always rendered an `h3`, so a card directly
   under a page `h1` skipped a level. axe rates `heading-order` as *moderate*
   and the sweep filtered to serious and critical, so it went unnoticed. The
   heading outline is now asserted directly on every page type.
2. **LCP load delay.** The home hero card held the largest contentful element
   but was not marked `priority`, costing 432 ms of load delay plus 493 ms of
   load time. Both dropped to **0 ms** after the fix.
3. **Label in Name.** `ContactLinks` carried an `aria-label` whose words
   differed from the visible link text, failing WCAG 2.5.3.
