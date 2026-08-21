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
      })
      .refine((data) => data.heroImage === undefined || data.heroImageAlt !== undefined, {
        message: 'heroImageAlt is required whenever heroImage is set',
        path: ['heroImageAlt'],
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
