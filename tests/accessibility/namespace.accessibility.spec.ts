import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockClusterApi } from '$utilities/mock-apis';

test.beforeEach(async ({ page }) => {
  await mockClusterApi(page);
});

test.describe('Accessibility: Namespace Page', () => {
  test.fixme(
    'should not have any automatically detectable accessibility issues',
    async ({ page }) => {
      await page.goto('/namespaces/default');
      await page.waitForRequest(
        'http://localhost:8233/api/v1/namespaces/default?',
      );

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    },
  );
});
