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
        .getByTestId('batch-Terminate-confirmation')
        .getByTestId('confirm-modal-button')
        .click();
      await expect(
        page.locator('#batch-terminate-success-toast'),
      ).toBeVisible();
    });

    test('allows running workflows to be terminated by a query', async ({
      page,
    }) => {
      await page.getByTestId('batch-actions-checkbox').click();
      await page.click('[data-testid="select-all-workflows"]');
      await page.click('[data-testid="bulk-terminate-button"]');
      const batchActionWorkflowsQuery = page
        .getByTestId('batch-Terminate-confirmation')
        .getByTestId('batch-action-workflows-query');
      await expect(batchActionWorkflowsQuery).toHaveText(
        'ExecutionStatus="Running"',
      );
      await page.fill(
        '[data-testid="batch-Terminate-confirmation"] #bulk-action-reason-2',
        'Sarah Connor',
      );
      await page
        .getByTestId('batch-Terminate-confirmation')
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
        .getByTestId('batch-Cancel-confirmation')
        .getByTestId('confirm-modal-button')
        .click();
      await expect(page.locator('#batch-cancel-success-toast')).toBeVisible();
    });

    test('allows running workflows to be cancelled by a query', async ({
      page,
    }) => {
      await page.getByTestId('batch-actions-checkbox').click();
      await page.click('[data-testid="select-all-workflows"]');
      await page.click('[data-testid="bulk-cancel-button"]');
      const batchActionWorkflowsQuery = page
        .getByTestId('batch-Cancel-confirmation')
        .getByTestId('batch-action-workflows-query');
      await expect(batchActionWorkflowsQuery).toHaveText(
        'ExecutionStatus="Running"',
      );
      await page.fill(
        '[data-testid="batch-Cancel-confirmation"] #bulk-action-reason-0',
        'Sarah Connor',
      );
      await page
        .getByTestId('batch-Cancel-confirmation')
        .getByTestId('confirm-modal-button')
        .click();
      await expect(page.locator('#batch-cancel-success-toast')).toBeVisible();
    });
  });
});
