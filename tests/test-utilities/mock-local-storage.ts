import { Page } from '@playwright/test';

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

export const clearLocalStorage = async (page: Page) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
  await page.reload();
};
