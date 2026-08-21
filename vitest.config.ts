/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Real unit tests arrive in B-1 and B-3; until then verify must not fail on an empty suite.
    passWithNoTests: true,
    coverage: {
      include: ['src/lib/**/*.ts'],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
});
