/**
 * Starting an isolated Vite server is slower than Vitest's default hook
 * timeout allows once several suites run at once, which failed locally and in
 * CI rather than pointing at the code under test.
 */
export const catalogHarnessSetupTimeoutMs = 60_000;
