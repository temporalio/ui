module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:svelte/prettier',
    'plugin:storybook/recommended',
  ],
  plugins: ['svelte', '@typescript-eslint', 'vitest', 'import'],
  ignorePatterns: ['**/*.cjs', '/server', '**/error-boundary.svelte'],
  overrides: [
    {
      files: ['src/**/*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    {
      files: ['tests/**/*.spec.ts'],
      extends: ['plugin:playwright/playwright-test'],
    },
  ],
  parserOptions: {
    extraFileExtensions: ['.svelte'],
    sourceType: 'module',
    ecmaVersion: 2019,
    svelteFeatures: {
      experimentalGenerics: true,
    },
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  globals: {
    // These are needed until https://github.com/sveltejs/eslint-plugin-svelte/issues/348 is resolved
    App: 'readonly',
    $$Generic: 'readonly',
  },
  rules: {
    quotes: ['error', 'single', { avoidEscape: true }],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|^\\$\\$(Props|Events|Slots)$',
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
    '@typescript-eslint/no-empty-function': 'off',
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
