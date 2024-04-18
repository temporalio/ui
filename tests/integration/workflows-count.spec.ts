import { expect, test } from '@playwright/test';

import {
  mockClusterApi,
  mockSystemInfoApi,
  mockWorkflowApis,
  mockWorkflowsApis,
  mockWorkflowsGroupByCountApi,
  waitForWorkflowsApis,
} from '~/test-utilities/mock-apis';

test.describe('Workflows List with Counts when countGroupByExecutionStatus is disabled', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowsApis(page);
    await mockWorkflowApis(page);

    await mockClusterApi(page, {
      visibilityStore: 'elasticsearch',
      persistenceStore: 'postgres,elasticsearch',
    });

    await mockSystemInfoApi(page, {
      capabilities: {
        countGroupByExecutionStatus: false,
      },
    });

    page.goto('/namespaces/default/workflows');

    await waitForWorkflowsApis(page);
  });

  test.describe('Shows total count and result count', () => {
    test('Results of workflows ', async ({ page }) => {
      await page.waitForSelector('[data-testid="workflow-count"]');

      await expect(page.getByTestId('workflow-count')).toHaveText('15');

      await page.getByTestId('filter-configuration-menu-button').click();
      await page.getByTestId('manual-search-toggle').click();
      await page.fill('#manual-search', 'WorkflowType="ImportantWorkflowType"');
      await page.getByTestId('manual-search-button').click();

      await expect(page).toHaveURL(
        /WorkflowType%3D%22ImportantWorkflowType%22/,
      );

      await expect(page.getByTestId('workflow-count')).toHaveText('15');
    });
  });
});

test.describe('Workflows List with Counts when countGroupByExecutionStatus is enabled', () => {
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
    test('Counts of workflows ', async ({ page }) => {
      await page.waitForSelector('[data-testid="workflow-count"]');
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
