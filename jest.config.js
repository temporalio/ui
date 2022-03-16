/* eslint-disable no-useless-escape */
process.env.TZ = 'UTC';
process.env.VITE_API = 'http://localhost:8080';

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.test.ts', '<rootDir>/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^\\$lib/(.*)$': '<rootDir>/src/lib/$1',
    '^\\$types/(.*)$': '<rootDir>/src/types/$1',
    '^\\$components/(.*)$': '<rootDir>/src/components/$1',
    '^\\$app(.*)$': ['<rootDir>/.svelte-kit/runtime/app$1'],
  },

  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: [
    'node_modules',
    'src/database',
    'src/test',
    'src/types',
  ],
  reporters: ['default'],
  globals: { 'ts-jest': { diagnostics: false, isolatedModules: true } },
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        sourcemap: true,
        loaders: {
          '.spec.ts': 'tsx',
        },
      },
    ],
  },
};
