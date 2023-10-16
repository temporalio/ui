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
      await page.waitForSelector(
        '[data-testid="workflow-count"][data-loaded="true"]',
      );

      await expect(page.getByTestId('workflow-count')).toHaveText(
        '15 workflows',
      );

      await page.fill('#manual-search', 'WorkflowType="ImportantWorkflowType"');
      await page.click('[data-testid="manual-search-button"]');

      await expect(page).toHaveURL(
        /WorkflowType%3D%22ImportantWorkflowType%22/,
      );

      await page.getByTestId('workflow-type-filter-button').click();
      const workflowTypeValue = await page.inputValue('#workflow-type');
      expect(workflowTypeValue).toBe('ImportantWorkflowType');
      await page.waitForSelector(
        '[data-testid="workflow-count"][data-loaded="true"]',
      );

      await expect(page.getByTestId('workflow-count')).toHaveText(
        'Results 15 of 15 workflows',
      );
    });
  });
});

test.describe('Workflows List with Counts when countGroupByExecutionStatus is enabled', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowsApis(page);
    await mockWorkflowApis(page);

    await mockClusterApi(page, {
      visibilityStore: 'elasticsearch',
      persistenceStore: 'postgres,elasticsearch',
    });

    page.goto('/namespaces/default/workflows');

    await mockWorkflowsGroupByCountApi(page);
    await waitForWorkflowsApis(page);
  });

  test.describe('Shows only result count', () => {
    test('Counts of workflows ', async ({ page }) => {
      await page.waitForSelector(
        '[data-testid="workflow-count"][data-loaded="true"]',
      );
      await expect(page.getByTestId('workflow-count')).toHaveText(
        '31,230 workflows',
      );
      await expect(page.getByTestId('workflow-status-Running')).toHaveText(
        '6 Running',
      );
      await expect(page.getByTestId('workflow-status-Completed')).toHaveText(
        '21,652 Completed',
      );
    });
  });
});
