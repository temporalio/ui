import { expect, test } from '@playwright/test';

import {
  mockClusterApi,
  mockWorkflowsApis,
  mockWorkflowsGroupByCountApi,
  waitForWorkflowsApis,
} from '~/test-utilities/mock-apis';

test.describe('Workflows List with Counts', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowsApis(page);
    await mockClusterApi(page, {
      visibilityStore: 'elasticsearch',
      persistenceStore: 'postgres,elasticsearch',
    });
    await mockWorkflowsGroupByCountApi(page);

    page.goto('/namespaces/default/workflows');

    await waitForWorkflowsApis(page);
  });

  test.describe('Shows only result count', () => {
    test('Counts of workflows', async ({ page }) => {
      await page.getByTestId('workflow-count').waitFor();
      await expect(page.getByTestId('workflow-count')).toHaveText('31,230');
      await expect(page.getByTestId('workflow-status-Running')).toHaveText(
        '6 Running',
      );
      await expect(page.getByTestId('workflow-status-Completed')).toHaveText(
        '21,652 Completed',
      );
    });
  });
});
