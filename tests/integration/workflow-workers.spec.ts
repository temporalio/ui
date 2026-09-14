import { expect, test } from '@playwright/test';

import {
  mockNamespaceWithNoWorkerHeartbeats,
  mockTaskQueuesApi,
  mockWorkersApi,
  mockWorkflowApis,
  TASK_QUEUES_API,
  WORKERS_API,
} from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const workersUrl = `/namespaces/default/workflows/${workflowId}/${runId}/workers`;

test.describe('Workflow Workers Tab', () => {
  test.describe('with worker heartbeats enabled and workers', () => {
    test.beforeEach(async ({ page }) => {
      await mockWorkflowApis(page);
      await mockWorkersApi(page);
    });

    test('renders the workers table with data', async ({ page }) => {
      await page.goto(workersUrl);
      await page.waitForResponse(WORKERS_API);

      const table = page.getByRole('table', { name: 'Workers' });
      await expect(table).toBeVisible();

      const rows = table.locator('tbody tr');
      await expect(rows).toHaveCount(2);

      await expect(rows.first()).toContainText('worker-instance-1');
      await expect(rows.first()).toContainText('my-deployment');
      await expect(rows.first()).toContainText('build-abc123');

      await expect(rows.nth(1)).toContainText('worker-instance-2');
    });
  });

  test.describe('with worker heartbeats enabled and no workers', () => {
    test.beforeEach(async ({ page }) => {
      await mockWorkflowApis(page);
      await mockWorkersApi(page, true);
    });

    test('renders the SDK warning empty state', async ({ page }) => {
      await page.goto(workersUrl);
      await page.waitForResponse(WORKERS_API);

      const sdkWarning = page.getByTestId('worker-heartbeats-sdk-warning');
      await expect(sdkWarning).toBeVisible();
      await expect(sdkWarning).toContainText('No Workers Sending Heartbeats');
    });
  });

  test.describe('with worker heartbeats disabled', () => {
    test.beforeEach(async ({ page }) => {
      await mockWorkflowApis(page);
      await mockNamespaceWithNoWorkerHeartbeats(page);
    });

    test('renders the fallback pollers table', async ({ page }) => {
      await page.goto(workersUrl);
      await page.waitForResponse(TASK_QUEUES_API);

      const heading = page.getByTestId('workers');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('Workers');

      const rows = page.getByTestId('poller-row');
      await expect(rows).toHaveCount(1);

      const identity = page.getByTestId('poller-identity');
      await expect(identity).toContainText('@poller');
    });
  });

  test.describe('with no workers polling', () => {
    test.beforeEach(async ({ page }) => {
      await mockWorkflowApis(page);
      await mockTaskQueuesApi(page, true);
    });

    test('renders the no workers polling alert', async ({ page }) => {
      await page.goto(workersUrl);

      const alert = page
        .getByRole('status')
        .filter({ hasText: 'No workers polling' });
      await expect(alert).toBeVisible();
    });
  });
});
