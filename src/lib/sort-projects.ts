import { PROJECT_DOMAINS } from '../content.config';

export type ProjectDomain = (typeof PROJECT_DOMAINS)[number];

/**
 * The shape `sortProjects` depends on, kept structural rather than importing
 * `CollectionEntry<'projects'>`. Sorting is pure logic and should be unit
 * testable without booting the Astro content layer.
 */
export interface SortableProject {
  id: string;
  data: {
    featured: boolean;
    domain: ProjectDomain;
    order?: number;
  };
}

/** Position in PROJECT_DOMAINS is the ranking: ai-ml first, per AC3. */
const domainRank = new Map<ProjectDomain, number>(
  PROJECT_DOMAINS.map((domain, index) => [domain, index]),
);

/** Projects without an explicit order sort after those that have one. */
const orderRank = (order: number | undefined) => order ?? Number.MAX_SAFE_INTEGER;

/**
 * Orders projects for the index page: featured first, then by domain relevance
 * to ML/AI engineering roles, then by explicit order, then alphabetically so
 * the output never depends on filesystem read order.
 *
 * Returns a new array; the input is not mutated.
 */
export function sortProjects<T extends SortableProject>(projects: readonly T[]): T[] {
  return [...projects].sort((a, b) => {
    if (a.data.featured !== b.data.featured) {
      return a.data.featured ? -1 : 1;
    }

    const byDomain = domainRank.get(a.data.domain)! - domainRank.get(b.data.domain)!;
    if (byDomain !== 0) return byDomain;

    const byOrder = orderRank(a.data.order) - orderRank(b.data.order);
    if (byOrder !== 0) return byOrder;

    return a.id.localeCompare(b.id);
  });
}
