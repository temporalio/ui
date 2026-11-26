import type { Page } from '@playwright/test';

export const setLocalStorage = async (
  key: string,
  value: string,
  page: Page,
) => {
  await page.addInitScript(
    (item) => {
      window.localStorage.setItem(item.key, item.value);
    },
    { key, value },
  );
  await page.reload();
};

export const removeLocalStorageItem = async (
  key: string,
  page: Page,
): Promise<void> => {
  await page.addInitScript((key) => window.localStorage.removeItem(key), key);
  await page.reload();
};
