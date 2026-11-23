import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['scripts/io-usage-review/*.test.ts'],
    restoreMocks: true,
  },
});
