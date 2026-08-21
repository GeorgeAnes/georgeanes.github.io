import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'playwright-report/',
      'test-results/',
      'coverage/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    /*
     * `no-undef` cannot see TypeScript's type namespace, so ambient types like
     * Astro's `ImageMetadata` register as undefined identifiers. TypeScript
     * already rejects genuinely undefined names, and `astro check` runs in the
     * same gate, so the rule is redundant here and only produces false
     * positives. This is typescript-eslint's own recommendation.
     */
    files: ['**/*.ts', '**/*.tsx', '**/*.astro'],
    rules: { 'no-undef': 'off' },
  },
);
