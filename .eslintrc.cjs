module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['svelte3', '@typescript-eslint', 'vitest', 'import'],
  ignorePatterns: ['*.cjs', 'prism.cjs', '/server'],
  overrides: [
    {
      /**
       * Right now, we only lint Holocene components due to a previous
       * configuration issue where we *weren't* linting Svelte components.
       * Currently, if you try to lint all components, the build *will* fail.
       * So, we're selectively adding to this list until we get all
       * components to pass linting.
       */
      files: ['src/lib/holocene/*.svelte'],
      processor: 'svelte3/svelte3',
      /**
       * Temporary fix, see the following:
       *
       * - https://github.com/sveltejs/kit/issues/5125
       * - https://stackoverflow.com/questions/75578842/eslint-complains-that-sveltekits-app-namespace-is-not-defined
       */
      globals: {
        App: 'readable',
        NetworkError: 'readable',
        NextPageToken: 'readable',
      },
    },
    {
      files: ['cypress/**/*.js'],
      extends: ['plugin:cypress/recommended'],
    },
    {
      files: ['tests/**/*.spec.ts'],
      extends: ['plugin:playwright/playwright-test'],
    },
  ],
  settings: {
    'svelte3/typescript': () => require('typescript'),
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2019,
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/class-literal-property-style': 'error',
    '@typescript-eslint/consistent-generic-constructors': 'error',
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      { assertionStyle: 'as' },
    ],
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '$app/environment',
            message: 'Please use esm-env instead.',
          },
        ],
      },
    ],
    'sort-imports': [
      'error',
      { ignoreCase: true, ignoreDeclarationSort: true },
    ],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
        ],
        pathGroups: [
          {
            pattern: 'svelte/**',
            group: 'external',
            position: 'before',
          },
          { pattern: '$app/**', group: 'external', position: 'after' },
          { pattern: './$types', group: 'external', position: 'after' },
          { pattern: '$lib/**', group: 'internal' },
          {
            pattern: '$components/**/*.svelte',
            group: 'internal',
            position: 'after',
          },
          { pattern: './**/*.svelte', group: 'index', position: 'after' },
        ],
        pathGroupsExcludedImportTypes: ['svelte'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
          orderImportKind: 'asc',
        },
      },
    ],
  },
};
