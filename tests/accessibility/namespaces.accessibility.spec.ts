import { test, expect } from '@playwright/test';
import { mockClusterApi } from '$utilities/mock-apis.js';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await mockClusterApi(page);
});

test.describe('Accessibility: Namespaces Page', () => {
  test.fixme(
    'should not have any automatically detectable accessibility issues',
    async ({ page }) => {
      await page.goto('/namespaces');
      await page.waitForRequest('http://localhost:8233/api/v1/namespaces?');

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    },
  );
});
