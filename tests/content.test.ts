import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

/**
 * The nine public project repositories, verified against `gh repo list` on
 * 2026-08-20. `GeorgeAnes` is the GitHub profile repo, not a project, and is
 * deliberately absent. See SPEC.md -> AC2.
 */
const EXPECTED_PROJECT_SLUGS = [
  'aero-mpc-spc-koopman-control',
  'camera-calibration-nerfstudio-pipeline',
  'enterprise-ai-document-risk-auditor',
  'facial-expression-recognition-ml',
  'multi-drone-ltl-formation-control',
  'petri-net-ga-optimization',
  'process-mining-kpi-dashboard',
  'smartphone-activity-recognition',
  'vfrm-agentic-design-assistant',
] as const;

const PROJECTS_DIR = join('src', 'content', 'projects');
const REPO_OWNER_PREFIX = 'https://github.com/GeorgeAnes/';

interface ProjectFrontmatter {
  title?: unknown;
  summary?: unknown;
  stack?: unknown;
  repoUrl?: unknown;
}

interface ProjectEntry {
  slug: string;
  data: ProjectFrontmatter;
}

function splitFrontmatter(raw: string): string {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!match) {
    throw new Error('File has no YAML frontmatter block');
  }
  return match[1];
}

function readProjectEntries(): ProjectEntry[] {
  if (!existsSync(PROJECTS_DIR)) return [];

  return readdirSync(PROJECTS_DIR)
    .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'))
    .map((name) => {
      const raw = readFileSync(join(PROJECTS_DIR, name), 'utf-8');
      return {
        slug: name.replace(/\.mdx?$/, ''),
        data: parse(splitFrontmatter(raw)) as ProjectFrontmatter,
      };
    });
}

const entries = readProjectEntries();
const foundSlugs = entries.map((entry) => entry.slug);

describe('project content collection', () => {
  it('has a content file for every public project repo', () => {
    const missing = EXPECTED_PROJECT_SLUGS.filter((slug) => !foundSlugs.includes(slug));

    expect(
      missing,
      `Missing ${missing.length} project content file(s) in ${PROJECTS_DIR}:\n` +
        missing.map((slug) => `  - ${slug}.md`).join('\n'),
    ).toEqual([]);
  });

  it('has no content files for repos that do not exist', () => {
    const unexpected = foundSlugs.filter(
      (slug) => !(EXPECTED_PROJECT_SLUGS as readonly string[]).includes(slug),
    );

    expect(
      unexpected,
      `Unexpected project content file(s). Every file must match a public repo name, ` +
        `and the GeorgeAnes profile repo is not a project:\n` +
        unexpected.map((slug) => `  - ${slug}`).join('\n'),
    ).toEqual([]);
  });

  it('gives every project a non-empty summary', () => {
    const offenders = entries
      .filter(
        ({ data }) => typeof data.summary !== 'string' || data.summary.trim() === '',
      )
      .map(({ slug }) => slug);

    expect(
      offenders,
      `These projects have a missing or empty summary. AC2 exists precisely because ` +
        `the GitHub descriptions are empty:\n` +
        offenders.map((s) => `  - ${s}`).join('\n'),
    ).toEqual([]);
  });

  it('gives every project a non-empty title', () => {
    const offenders = entries
      .filter(({ data }) => typeof data.title !== 'string' || data.title.trim() === '')
      .map(({ slug }) => slug);

    expect(
      offenders,
      `Projects with a missing or empty title: ${offenders.join(', ')}`,
    ).toEqual([]);
  });

  it('points every project at its own GitHub repo', () => {
    const offenders = entries
      .filter(({ slug, data }) => data.repoUrl !== `${REPO_OWNER_PREFIX}${slug}`)
      .map(({ slug, data }) => `${slug} -> ${String(data.repoUrl)}`);

    expect(
      offenders,
      `repoUrl must be exactly ${REPO_OWNER_PREFIX}<slug>:\n` +
        offenders.map((line) => `  - ${line}`).join('\n'),
    ).toEqual([]);
  });

  it('lists at least one stack entry per project', () => {
    const offenders = entries
      .filter(({ data }) => !Array.isArray(data.stack) || data.stack.length === 0)
      .map(({ slug }) => slug);

    expect(offenders, `Projects with an empty stack: ${offenders.join(', ')}`).toEqual(
      [],
    );
  });

  it('ships no unconfirmed metrics', () => {
    if (!existsSync(PROJECTS_DIR)) return;

    const offenders = readdirSync(PROJECTS_DIR)
      .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'))
      .filter((name) =>
        readFileSync(join(PROJECTS_DIR, name), 'utf-8').includes('CONFIRM'),
      );

    expect(
      offenders,
      `These files still carry CONFIRM markers. Every metric needs George's ` +
        `sign-off before it ships (SPEC.md -> Never do):\n` +
        offenders.map((name) => `  - ${name}`).join('\n'),
    ).toEqual([]);
  });
});
