import { describe, expect, it } from 'vitest';
import { sortProjects, type SortableProject } from '../src/lib/sort-projects';

function project(
  id: string,
  overrides: Partial<SortableProject['data']> = {},
): SortableProject {
  return {
    id,
    data: { featured: false, domain: 'ai-ml', ...overrides },
  };
}

const ids = (projects: readonly SortableProject[]) => projects.map((p) => p.id);

describe('sortProjects', () => {
  it('returns an empty array unchanged', () => {
    expect(sortProjects([])).toEqual([]);
  });

  it('puts featured projects first regardless of domain', () => {
    const input = [
      project('plain-ai', { domain: 'ai-ml' }),
      project('featured-control', { featured: true, domain: 'control-robotics' }),
    ];

    expect(ids(sortProjects(input))).toEqual(['featured-control', 'plain-ai']);
  });

  it('keeps a featured project first when it already leads the input', () => {
    const input = [
      project('featured-control', { featured: true, domain: 'control-robotics' }),
      project('plain-ai', { domain: 'ai-ml' }),
    ];

    expect(ids(sortProjects(input))).toEqual(['featured-control', 'plain-ai']);
  });

  it('sorts ai-ml ahead of data-optimization ahead of control-robotics', () => {
    const input = [
      project('c', { domain: 'control-robotics' }),
      project('a', { domain: 'ai-ml' }),
      project('b', { domain: 'data-optimization' }),
    ];

    expect(ids(sortProjects(input))).toEqual(['a', 'b', 'c']);
  });

  it('applies the domain order inside the featured group too', () => {
    const input = [
      project('featured-control', { featured: true, domain: 'control-robotics' }),
      project('featured-ai', { featured: true, domain: 'ai-ml' }),
    ];

    expect(ids(sortProjects(input))).toEqual(['featured-ai', 'featured-control']);
  });

  it('breaks ties within a domain using the explicit order field', () => {
    const input = [
      project('second', { order: 2 }),
      project('first', { order: 1 }),
      project('third', { order: 3 }),
    ];

    expect(ids(sortProjects(input))).toEqual(['first', 'second', 'third']);
  });

  it('sorts projects without an explicit order after those that have one', () => {
    const input = [project('unordered'), project('ordered', { order: 5 })];

    expect(ids(sortProjects(input))).toEqual(['ordered', 'unordered']);
  });

  it('falls back to alphabetical id so the output is deterministic', () => {
    const input = [project('zebra'), project('alpha'), project('mango')];

    expect(ids(sortProjects(input))).toEqual(['alpha', 'mango', 'zebra']);
  });

  it('does not mutate the input array', () => {
    const input = [project('b'), project('a')];
    const snapshot = ids(input);

    sortProjects(input);

    expect(ids(input)).toEqual(snapshot);
  });

  it('orders the real nine-project set with the ML/AI work first', () => {
    const input = [
      project('aero-mpc-spc-koopman-control', { domain: 'control-robotics' }),
      project('process-mining-kpi-dashboard', { domain: 'data-optimization' }),
      project('enterprise-ai-document-risk-auditor', {
        featured: true,
        domain: 'ai-ml',
        order: 1,
      }),
      project('facial-expression-recognition-ml', {
        featured: true,
        domain: 'ai-ml',
        order: 3,
      }),
      project('vfrm-agentic-design-assistant', {
        featured: true,
        domain: 'ai-ml',
        order: 2,
      }),
    ];

    expect(ids(sortProjects(input))).toEqual([
      'enterprise-ai-document-risk-auditor',
      'vfrm-agentic-design-assistant',
      'facial-expression-recognition-ml',
      'process-mining-kpi-dashboard',
      'aero-mpc-spc-koopman-control',
    ]);
  });
});
