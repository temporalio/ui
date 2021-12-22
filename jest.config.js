export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.test.ts', '<rootDir>/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: [
    'node_modules',
    'src/database',
    'src/test',
    'src/types',
  ],
  reporters: ['default'],
  globals: { 'ts-jest': { diagnostics: false } },
  transform: {},
};
