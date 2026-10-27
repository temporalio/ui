import type { Page } from '@playwright/test';

export const mockNow = () => {
  const _Date = window.Date;

  _Date.now = () => new _Date('2026-10-16T22:13:19.800Z').getTime();
};

export const waitForImages = async (page: Page) => {
  await page.waitForFunction(() =>
    Array.from(document.images).every((image) => image.complete),
  );
  await page
    .locator('img')
    .evaluateAll((images) =>
      Promise.all(
        images.map((image) =>
          (image as HTMLImageElement).decode().catch(() => undefined),
        ),
      ),
    );
};
