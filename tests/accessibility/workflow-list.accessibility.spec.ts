import { test, expect } from '@playwright/test';
import { workflowsApi, mockClusterApi } from '$utilities/mock-apis.js';
import { setLocalStorage } from '$utilities/mock-local-storage';
import AxeBuilder from '@axe-core/playwright';

const workflowsUrl = '/namespaces/default/workflows';

test.beforeEach(async ({ page }) => {
  await mockClusterApi(page);
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);
});

test.describe('Accessibility: Workflow Details Page', () => {
  test.fixme(
    'should not have any automatically detectable accessibility issues',
    async ({ page }) => {
      await page.goto(workflowsUrl);
      await page.waitForRequest(workflowsApi);

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    },
  );
});
