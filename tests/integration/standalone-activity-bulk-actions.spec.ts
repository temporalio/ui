import { expect, test } from '@playwright/test';

import {
  mockActivitiesApis,
  mockBatchOperationApis,
  mockClusterApi,
} from '~/test-utilities/mock-apis';

test.describe('Batch and Bulk Standalone Activity Actions', () => {
  test.beforeEach(async ({ page }) => {
    await mockActivitiesApis(page);
    await mockClusterApi(page, {
      serverVersion: '1.32.0',
      visibilityStore: 'elasticsearch',
      persistenceStore: 'postgres,elasticsearch',
    });
    await mockBatchOperationApis(page);

    await page.goto('/namespaces/default/activities');

    await page
      .getByTestId('activities-summary-configurable-table-row')
      .first()
      .waitFor();
  });

  test('allows running activities to be terminated by ID without a reason', async ({
    page,
  }) => {
    await page.getByTestId('batch-actions-checkbox').click();
    await page.getByTestId('bulk-terminate-button').click();
    await page
      .getByTestId('batch-terminate-confirmation')
      .getByTestId('confirm-modal-button')
      .click();
    await expect(page.locator('#batch-terminate-success-toast')).toBeVisible();
  });

  test('allows running activities to be cancelled by ID without a reason', async ({
    page,
  }) => {
    await page.getByTestId('batch-actions-checkbox').click();
    await page.getByTestId('bulk-cancel-button').click();
    await page
      .getByTestId('batch-cancel-confirmation')
      .getByTestId('confirm-modal-button')
      .click();
    await expect(page.locator('#batch-cancel-success-toast')).toBeVisible();
  });

  test('terminates activities by a query when selecting all matching a query', async ({
    page,
  }) => {
    await page.goto(
      '/namespaces/default/activities?query=ExecutionStatus%3D"Running"',
    );
    await page
      .getByTestId('activities-summary-configurable-table-row')
      .first()
      .waitFor();

    await page.getByTestId('batch-actions-checkbox').click();
    await page.getByTestId('select-all-activities').click();
    await page.getByTestId('bulk-terminate-button').click();

    const query = page
      .getByTestId('batch-terminate-confirmation')
      .getByTestId('batch-action-activities-query');
    await expect(query).toHaveText('ExecutionStatus="Running"');

    await page
      .getByTestId('batch-terminate-confirmation')
      .getByTestId('confirm-modal-button')
      .click();
    await expect(page.locator('#batch-terminate-success-toast')).toBeVisible();
  });
});
