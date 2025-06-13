import { expect } from '@playwright/test';

expect.extend({
  async toHaveLocalStorageItem(page, key: string, expected: string) {
    const stored = await page.evaluate((key) => localStorage.getItem(key), key);
    const pass = stored === JSON.stringify(expected);
    return {
      pass,
      message: () =>
        pass
          ? `Expected local storage at key "${key}" not to have value "${JSON.stringify(expected)}"`
          : `Expected local storage at key "${key}" to have value ${JSON.stringify(expected)}, but got ${stored}`,
    };
  },
});

declare module '@playwright/test' {
  interface Matchers {
    toHaveLocalStorageItem(key: string, expected: string): Promise<void>;
  }
}
