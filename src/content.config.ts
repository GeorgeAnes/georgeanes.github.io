import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Import paths verified against Astro 7 docs in task A-2: `glob` comes from
 * `astro/loaders` and `z` from `astro/zod`, not from `astro:content`.
 * See tasks/notes-astro7.md.
 */

/**
 * Which part of the portfolio a project speaks to. Drives index ordering:
 * the site targets ML/AI engineering roles, so `ai-ml` sorts first (AC3).
 * An explicit field beats inferring intent from the stack list, which would
 * silently reorder the page whenever a tag is edited.
 */
export const PROJECT_DOMAINS = [
  'ai-ml',
  'data-optimization',
  'control-robotics',
] as const;

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  // Function form is required so the `image()` helper is in scope for heroImage.
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        /** Required and non-empty: AC2 exists because the GitHub descriptions are blank. */
        summary: z.string().min(1),
        domain: z.enum(PROJECT_DOMAINS),
        stack: z.array(z.string().min(1)).nonempty(),
        repoUrl: z.string().url(),
        /** Private repositories keep their case study, but never get a public source link. */
        repoPrivate: z.boolean().default(false),
        /**
         * A deployed, publicly reachable instance. Optional because most of
         * these projects are research or coursework with nothing to host --
         * only a project that genuinely runs somewhere should claim a demo.
         */
        liveUrl: z.string().url().optional(),
        /**
         * Shown next to the live link when the demo is on scale-to-zero
         * infrastructure and the first request is visibly slow. Setting this
         * without `liveUrl` is meaningless, and the refine below rejects it:
         * a warning about a demo that does not exist is just noise.
         */
        liveNote: z.string().min(1).optional(),
        featured: z.boolean().default(false),
        /** Manual tie-break within a domain. Lower sorts first. */
        order: z.number().int().optional(),
        /** Honest attribution, e.g. "TU/e 5ARIP10 Team 1". See SPEC.md -> R1. */
        role: z.string().min(1).optional(),
        /**
         * Optional on purpose: plan risk P2. A project can ship on its summary
         * alone rather than blocking the whole slice on one unconfirmed metric.
         */
        results: z.array(z.string().min(1)).optional(),
        heroImage: image().optional(),
        heroImageAlt: z.string().min(1).optional(),
        /**
         * Supporting figures. Capped at two so that hero plus figures never
         * exceeds the approved three-images-per-project budget. The cap lives
         * here rather than in a review checklist so the build enforces it.
         * Alt text is required on every one: these carry results, so none of
         * them is decorative.
         */
        figures: z
          .array(
            z.object({
              src: image(),
              alt: z.string().min(1),
              caption: z.string().min(1).optional(),
            }),
          )
          .max(2)
          .optional(),
      })
      .refine((data) => data.heroImage === undefined || data.heroImageAlt !== undefined, {
        message: 'heroImageAlt is required whenever heroImage is set',
        path: ['heroImageAlt'],
      })
      .refine((data) => data.liveNote === undefined || data.liveUrl !== undefined, {
        message: 'liveNote is only meaningful alongside liveUrl',
        path: ['liveNote'],
      }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, posts };
