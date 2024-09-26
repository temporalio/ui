import { expect, test } from '@playwright/test';

import { ResetReapplyType } from '$src/lib/types';
import { mockSettingsApi, mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  mockCompletedWorkflow,
  mockWorkflow,
  mockWorkflowResetApi,
  WORKFLOW_RESET_API,
} from '~/test-utilities/mocks/workflow';

test.describe('Workflow Actions for a Completed Workflow', () => {
  const {
    workflowExecutionInfo: {
      execution: { workflowId, runId },
    },
  } = mockCompletedWorkflow;

  const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}/history`;

  test.beforeEach(async ({ page }) => {
    await page.goto(workflowUrl);

    await mockWorkflowApis(page, mockCompletedWorkflow);
    await mockWorkflowResetApi(page);
  });

  test.describe('Workflow Reset', () => {
    test('is disabled when global write actions are disabled via Settings API', async ({
      page,
    }) => {
      await mockSettingsApi(page, { DisableWriteActions: true });

      await expect(page.getByTestId('workflow-reset-button')).toBeDisabled();
    });

    test('is disabled when reset is disabled via Settings API', async ({
      page,
    }) => {
      await mockSettingsApi(page, { WorkflowResetDisabled: true });

      await expect(page.getByTestId('workflow-reset-button')).toBeDisabled();
    });

    test('allows NOT reapplying signals after the reset point', async ({
      page,
    }) => {
      const requestPromise = page.waitForRequest(WORKFLOW_RESET_API);

      await page.getByTestId('workflow-reset-button').click();
      await page.locator('#reset-event-5').click();
      await page
        .getByTestId('reset-confirmation-modal')
        .getByTestId('confirm-modal-button')
        .click();

      const request = await requestPromise;
      const body = request.postDataJSON();

      expect(body.resetReapplyType).toBe(
        ResetReapplyType.RESET_REAPPLY_TYPE_NONE,
      );
    });

    test('allows reapplying signals after the reset point', async ({
      page,
    }) => {
      const requestPromise = page.waitForRequest(WORKFLOW_RESET_API);

      await page.getByTestId('workflow-reset-button').click();
      await page.locator('#reset-event-5').click();
      await page
        .getByText('Reapply Signals that happened after the Reset point')
        .click();

      await page
        .getByTestId('reset-confirmation-modal')
        .getByTestId('confirm-modal-button')
        .click();

      const request = await requestPromise;
      const body = request.postDataJSON();

      expect(body.resetReapplyType).toBe(
        ResetReapplyType.RESET_REAPPLY_TYPE_SIGNAL,
      );
    });
  });
});

test.describe('Workflow actions for a Running Workflow', () => {
  test.beforeEach(async ({ page }) => {
    const {
      workflowExecutionInfo: {
        execution: { workflowId, runId },
      },
    } = mockWorkflow;

    const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}`;

    await page.goto(workflowUrl);
    await mockWorkflowApis(page);
    await mockWorkflowResetApi(page);
  });

  test('All actions are disabled when global write actions are disabled via Settings API', async ({
    page,
  }) => {
    await mockSettingsApi(page, { DisableWriteActions: true });

    await expect(page.locator('#workflow-actions-menu-button')).toBeDisabled();

    await expect(
      page.locator('#workflow-actions-primary-button'),
    ).toBeDisabled();
  });

  test.describe('Workflow Cancel', () => {
    test('is disabled when cancel is disabled via Settings API', async ({
      page,
    }) => {
      await mockSettingsApi(page, { WorkflowCancelDisabled: true });

      await expect(
        page.locator('#workflow-actions-primary-button'),
      ).toBeDisabled();

      await page.locator('#workflow-actions-menu-button').click();

      await expect(
        page.locator('#workflow-actions-menu').getByText('Send a Signal'),
      ).toBeEnabled();

      await expect(
        page.locator('#workflow-actions-menu').getByText('Terminate'),
      ).toBeEnabled();

      await expect(
        page.locator('#workflow-actions-menu').getByText('Reset'),
      ).toBeEnabled();
    });
  });

  test.describe('Workflow Terminate', () => {
    test('is disabled when teminate is disabled via Settings API', async ({
      page,
    }) => {
      await mockSettingsApi(page, { WorkflowTerminateDisabled: true });

      await expect(
        page.locator('#workflow-actions-primary-button'),
      ).toBeEnabled();

      await page.locator('#workflow-actions-menu-button').click();

      await expect(
        page.locator('#workflow-actions-menu').getByText('Send a Signal'),
      ).toBeEnabled();

      await expect(
        page.locator('#workflow-actions-menu').getByText('Terminate'),
      ).toBeDisabled();

      await expect(
        page.locator('#workflow-actions-menu').getByText('Reset'),
      ).toBeEnabled();
    });
  });

  test.describe('Workflow Signal', () => {
    test('is disabled when signal is disabled via Settings API', async ({
      page,
    }) => {
      await mockSettingsApi(page, { WorkflowSignalDisabled: true });

      await expect(
        page.locator('#workflow-actions-primary-button'),
      ).toBeEnabled();

      await page.locator('#workflow-actions-menu-button').click();

      await expect(
        page.locator('#workflow-actions-menu').getByText('Send a Signal'),
      ).toBeDisabled();

      await expect(
        page.locator('#workflow-actions-menu').getByText('Terminate'),
      ).toBeEnabled();

      await expect(
        page.locator('#workflow-actions-menu').getByText('Reset'),
      ).toBeEnabled();
    });
  });
});
