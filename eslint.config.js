import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import-x';
import pluginPlaywright from 'eslint-plugin-playwright';
import pluginStorybook from 'eslint-plugin-storybook';
import svelte from 'eslint-plugin-svelte';
import pluginVitest from 'eslint-plugin-vitest';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const sharedGlobals = {
  ...globals.browser,
  ...globals.es2017,
  ...globals.node,
  App: 'readonly',
  $$Generic: 'readonly',
};

const sharedPlugins = {
  import: pluginImport,
  vitest: pluginVitest,
};

const sharedRules = {
  'no-undef': 'off',
  quotes: ['error', 'single', { avoidEscape: true }],
  '@typescript-eslint/no-unused-vars': [
    'warn',
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
  '@typescript-eslint/ban-types': 'off',
  '@typescript-eslint/no-empty-object-type': 'warn',
  '@typescript-eslint/no-unused-expressions': 'warn',
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
  'sort-imports': ['error', { ignoreCase: true, ignoreDeclarationSort: true }],
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
};

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  ...pluginStorybook.configs['flat/recommended'],
  {
    files: ['**/*.js', '**/*.ts', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2019,
      sourceType: 'module',
      globals: sharedGlobals,
      parser: tseslint.parser,
    },
    plugins: sharedPlugins,
    rules: sharedRules,
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      globals: {
        ...sharedGlobals,
        IntersectionObserverInit: 'readonly',
      },
      parser: svelte.parser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte'],
      },
    },
    plugins: sharedPlugins,
    rules: {
      ...sharedRules,
      'svelte/require-each-key': 'warn',
      'svelte/no-navigation-without-resolve': 'warn',
      'svelte/no-reactive-reassign': 'warn',
      'svelte/no-reactive-functions': 'warn',
      'svelte/no-reactive-literals': 'warn',
      'svelte/no-immutable-reactive-statements': 'warn',
      'svelte/infinite-reactive-loop': 'warn',
      'svelte/prefer-svelte-reactivity': 'warn',
      'svelte/no-useless-mustaches': 'warn',
      'svelte/no-at-html-tags': 'warn',
      'svelte/require-store-reactive-access': 'warn',
    },
  },
  {
    files: ['tests/**/*.spec.ts'],
    ...pluginPlaywright.configs['flat/recommended'],
  },
  {
    ignores: [
      '**/*.cjs',
      'server/**',
      '**/error-boundary.svelte',
      '.svelte-kit/**',
      'dist/**',
      'build/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'coverage/**',
      'storybook-static/**',
    ],
  },
];
