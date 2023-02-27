import { test, expect } from '@playwright/test';
const importUrl = '/import';

test.beforeEach(async ({ page }) => {
  test.setTimeout(10000);
});

test('it displays the import page', async ({ page }) => {
  await page.goto(importUrl);

  const title = await page.getByTestId('import-event-history').waitFor();
  expect(title).toBe('Event History Import');

  const button = await page.getByRole('button', { name: 'Import' });
  await expect(button).toBeDisabled();
});
