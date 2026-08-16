import { expect, test } from '@playwright/test';

import { mockWorkflowsApis } from '~/test-utilities/mock-apis';

test.describe('Visual version rollback', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowsApis(page);
  });

  test('the legacy query keeps the shared DOM path usable', async ({
    page,
  }) => {
    await page.goto('/namespaces/default/workflows?visual=legacy');

    await expect(page.locator('html')).toHaveAttribute(
      'data-visual-version',
      'legacy',
    );
    await expect(page.locator('body')).toHaveAttribute(
      'data-visual-version',
      'legacy',
    );
    await expect(page.locator('#content')).toBeVisible();

    const documentOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(documentOverflow).toBeLessThanOrEqual(1);
  });
});
