module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['svelte3', '@typescript-eslint', 'vitest'],
  ignorePatterns: ['*.cjs', 'prism.js', '/server'],
  overrides: [
    // This was previously being overwritten by a duplicate and will cause the build to fail.
    // {
    //   files: ['*.svelte'],
    //   processor: 'svelte3/svelte3',
    // },
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
      1,
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
};
