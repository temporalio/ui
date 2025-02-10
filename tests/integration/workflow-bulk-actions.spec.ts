import { expect, test } from '@playwright/test';

import {
  mockBatchOperationApis,
  mockClusterApi,
  mockWorkflowsApis,
  waitForWorkflowsApis,
} from '~/test-utilities/mock-apis';

test.describe('Batch and Bulk Workflow Actions', () => {
  test.describe('when advanced visibility is enabled', () => {
    test.beforeEach(async ({ page }) => {
      await mockWorkflowsApis(page);
      await mockClusterApi(page, { visibilityStore: 'elasticsearch' });
      await mockBatchOperationApis(page);

      await page.goto('/namespaces/default/workflows');

      await waitForWorkflowsApis(page);
      await page.waitForSelector('[data-testid="workflow-count"]');
    });

    test('allows running workflows to be terminated by ID without a reason', async ({
      page,
    }) => {
      await page.getByTestId('batch-actions-checkbox').click();
      await page.click('[data-testid="bulk-terminate-button"]');
      await page
        .getByTestId('batch-terminate-confirmation')
        .getByTestId('confirm-modal-button')
        .click();
      await expect(
        page.locator('#batch-terminate-success-toast'),
      ).toBeVisible();
    });

    test('allows running workflows to be terminated by a query', async ({
      page,
    }) => {
      await page.locator('#search-attribute-filter-button').click();
      await page.getByTestId('manual-search-toggle').click();
      await page.locator('#manual-search').fill('ExecutionStatus="Running"');
      await page.getByTestId('manual-search-button').click();
      await page.getByTestId('batch-actions-checkbox').click();
      await page.click('[data-testid="select-all-workflows"]');
      await page.click('[data-testid="bulk-terminate-button"]');
      const batchActionWorkflowsQuery = page
        .getByTestId('batch-terminate-confirmation')
        .getByTestId('batch-action-workflows-query');
      await expect(batchActionWorkflowsQuery).toHaveText(
        'ExecutionStatus="Running"',
      );
      await page.fill(
        '[data-testid="batch-terminate-confirmation"] #bulk-action-reason-2',
        'Sarah Connor',
      );
      await page
        .getByTestId('batch-terminate-confirmation')
        .getByTestId('confirm-modal-button')
        .click();
      await expect(
        page.locator('#batch-terminate-success-toast'),
      ).toBeVisible();
    });

    test('allows running workflows to be cancelled by ID without a reason', async ({
      page,
    }) => {
      await page.getByTestId('batch-actions-checkbox').click();
      await page.click('[data-testid="bulk-cancel-button"]');
      await page
        .getByTestId('batch-cancel-confirmation')
        .getByTestId('confirm-modal-button')
        .click();
      await expect(page.locator('#batch-cancel-success-toast')).toBeVisible();
    });

    test('allows running workflows to be cancelled by a query', async ({
      page,
    }) => {
      await page.locator('#search-attribute-filter-button').click();
      await page.getByTestId('manual-search-toggle').click();
      await page.locator('#manual-search').fill('ExecutionStatus="Running"');
      await page.getByTestId('manual-search-button').click();
      await page.getByTestId('batch-actions-checkbox').click();
      await page.click('[data-testid="select-all-workflows"]');
      await page.click('[data-testid="bulk-cancel-button"]');
      const batchActionWorkflowsQuery = page
        .getByTestId('batch-cancel-confirmation')
        .getByTestId('batch-action-workflows-query');
      await expect(batchActionWorkflowsQuery).toHaveText(
        'ExecutionStatus="Running"',
      );
      await page.fill(
        '[data-testid="batch-cancel-confirmation"] #bulk-action-reason-0',
        'Sarah Connor',
      );
      await page
        .getByTestId('batch-cancel-confirmation')
        .getByTestId('confirm-modal-button')
        .click();
      await expect(page.locator('#batch-cancel-success-toast')).toBeVisible();
    });

    test('works when visiting a URL directly that has an existing query in it', async ({
      page,
    }) => {
      await page.goto(
        '/namespaces/default/workflows?query=WorkflowId%3D"test"',
      );

      await waitForWorkflowsApis(page);

      await page.getByTestId('batch-actions-checkbox').click();
      await page.getByTestId('select-all-workflows').click();
      await page.getByTestId('bulk-cancel-button').click();

      const cancelQueryValue = await page
        .getByTestId('batch-cancel-confirmation')
        .getByTestId('batch-action-workflows-query')
        .innerText();

      expect(cancelQueryValue).toBe('WorkflowId="test"');

      await page
        .getByTestId('batch-cancel-confirmation')
        .getByLabel('Cancel')
        .click();
      await page.getByTestId('bulk-terminate-button').click();

      const terminateQueryValue = await page
        .getByTestId('batch-terminate-confirmation')
        .getByTestId('batch-action-workflows-query')
        .innerText();

      expect(terminateQueryValue).toBe('WorkflowId="test"');
    });
  });
});
