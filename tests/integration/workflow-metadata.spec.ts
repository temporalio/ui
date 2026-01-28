import { expect, test } from '@playwright/test';

import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

test.describe('Workflow Reset Modal Shown', () => {
  const {
    workflowExecutionInfo: {
      execution: { workflowId, runId },
    },
  } = mockWorkflow;

  const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}`;

  test.beforeEach(async ({ page }) => {
    await mockWorkflowApis(page, mockWorkflow);
  });

  test.describe('Memo renders', () => {
    test('Shows Memo when Present', async ({ page }) => {
      await page.goto(`${workflowUrl}/memo`);

      await expect(page.getByText('summary')).toBeVisible();
      await expect(
        page.getByText('Workflow to demonstrate EJSON encoding of User'),
      ).toBeVisible();
      await expect(page.getByText('Jane Doe')).toBeVisible();
      await expect(page.getByText('premium')).toBeVisible();
    });
  });

  test.describe('Search Attributes render', () => {
    test('Shows Search Attributes when Present', async ({ page }) => {
      await page.goto(`${workflowUrl}/search-attributes`);
      const header = page.getByRole('heading', { name: 'Search Attributes' });
      await expect(header).toBeVisible();
      await expect(page.getByText('rainbow-statuses-09db15')).toBeVisible();
    });
  });

  test('Shows User Metadata when Present', async ({ page }) => {
    await page.goto(`${workflowUrl}`);

    const userMetadataTab = page.getByTestId('user-metadata-tab');
    await userMetadataTab.click();
    await expect(page).toHaveURL(/user-metadata/);

    await expect(page.getByRole('heading', { name: 'Summary' })).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Details', exact: true }),
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Current Details', exact: true }),
    ).toBeVisible();
  });
});
