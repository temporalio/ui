import { expect, test } from '@playwright/test';

import { ResetReapplyExcludeType, ResetReapplyType } from '$src/lib/types';
import {
  mockClusterApi,
  mockSettingsApi,
  mockWorkflowApis,
} from '~/test-utilities/mock-apis';
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

  test.describe('Workflow Reset for server version <1.24', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(workflowUrl);

      await mockWorkflowApis(page, mockCompletedWorkflow);
      await mockWorkflowResetApi(page);
    });

    test('is disabled when global write actions are disabled via Settings API', async ({
      page,
    }) => {
      await mockSettingsApi(page, { DisableWriteActions: true });

      await expect(
        page.getByTestId('workflow-reset-button').locator('visible=true'),
      ).toBeDisabled();
    });

    test('is disabled when reset is disabled via Settings API', async ({
      page,
    }) => {
      await mockSettingsApi(page, { WorkflowResetDisabled: true });

      await expect(
        page.getByTestId('workflow-reset-button').locator('visible=true'),
      ).toBeDisabled();
    });

    test('allows reapplying signals after the reset point', async ({
      page,
    }) => {
      const requestPromise = page.waitForRequest(WORKFLOW_RESET_API);

      await page
        .getByTestId('workflow-reset-button')
        .locator('visible=true')
        .click();
      await page
        .getByTestId('workflow-reset-event-id-select-button')
        .locator('visible=true')
        .click();
      await page
        .locator('#reset-event-id-select')
        .locator('[role="option"]')
        .locator('visible=true')
        .first()
        .click();

      await page
        .getByTestId('reset-confirmation-modal')
        .locator('visible=true')
        .getByTestId('confirm-modal-button')
        .click();

      const request = await requestPromise;
      const body = request.postDataJSON();

      expect(body.resetReapplyType).toBe(
        ResetReapplyType.RESET_REAPPLY_TYPE_SIGNAL,
      );
    });

    test('allows NOT reapplying signals after the reset point', async ({
      page,
    }) => {
      const requestPromise = page.waitForRequest(WORKFLOW_RESET_API);

      await page
        .getByTestId('workflow-reset-button')
        .locator('visible=true')
        .click();
      await page
        .getByTestId('workflow-reset-event-id-select-button')
        .locator('visible=true')
        .click();
      await page
        .locator('#reset-event-id-select')
        .locator('[role="option"]')
        .locator('visible=true')
        .first()
        .click();

      // this checkbox is defaulted to checked, so click it to uncheck it
      await page
        .getByTestId('reset-include-signals-checkbox')
        .locator('visible=true')
        .click();

      await page
        .getByTestId('reset-confirmation-modal')
        .locator('visible=true')
        .getByTestId('confirm-modal-button')
        .click();

      const request = await requestPromise;
      const body = request.postDataJSON();

      expect(body.resetReapplyType).toBe(
        ResetReapplyType.RESET_REAPPLY_TYPE_NONE,
      );
    });
  });

  test.describe('Workflow Reset for server version >=1.24', () => {
    test.beforeEach(async ({ page }) => {
      await mockWorkflowApis(page, mockCompletedWorkflow);
      await mockClusterApi(page, { serverVersion: '1.24.0' });
      await mockWorkflowResetApi(page);
      await page.goto(workflowUrl);
    });

    test('Allows reapplying Signals and Updates after the reset point', async ({
      page,
    }) => {
      const requestPromise = page.waitForRequest(WORKFLOW_RESET_API);

      await page
        .getByTestId('workflow-reset-button')
        .locator('visible=true')
        .click();
      await page
        .getByTestId('workflow-reset-event-id-select-button')
        .locator('visible=true')
        .click();
      await page
        .locator('#reset-event-id-select')
        .locator('[role="option"]')
        .locator('visible=true')
        .first()
        .click();

      await page
        .getByTestId('reset-confirmation-modal')
        .locator('visible=true')
        .getByTestId('confirm-modal-button')
        .click();

      const request = await requestPromise;
      const body = request.postDataJSON();

      expect(body.resetReapplyExcludeTypes).toStrictEqual([
        ResetReapplyExcludeType.RESET_REAPPLY_EXCLUDE_TYPE_UNSPECIFIED,
      ]);

      expect(body.resetReapplyType).toBe(3);
    });

    test('Allows excluding Signals after the reset point', async ({ page }) => {
      const requestPromise = page.waitForRequest(WORKFLOW_RESET_API);

      await page
        .getByTestId('workflow-reset-button')
        .locator('visible=true')
        .click();
      await page
        .getByTestId('workflow-reset-event-id-select-button')
        .locator('visible=true')
        .click();
      await page
        .locator('#reset-event-id-select')
        .locator('[role="option"]')
        .locator('visible=true')
        .first()
        .click();

      await page
        .getByTestId('reset-exclude-signals-checkbox')
        .locator('visible=true')
        .click();

      await page
        .getByTestId('reset-confirmation-modal')
        .locator('visible=true')
        .getByTestId('confirm-modal-button')
        .click();

      const request = await requestPromise;
      const body = request.postDataJSON();

      expect(body.resetReapplyExcludeTypes).toStrictEqual([
        ResetReapplyExcludeType.RESET_REAPPLY_EXCLUDE_TYPE_SIGNAL,
      ]);

      expect(body.resetReapplyType).toBe(3);
    });

    test('Allows excluding Updates after the reset point', async ({ page }) => {
      const requestPromise = page.waitForRequest(WORKFLOW_RESET_API);

      await page
        .getByTestId('workflow-reset-button')
        .locator('visible=true')
        .click();
      await page
        .getByTestId('workflow-reset-event-id-select-button')
        .locator('visible=true')
        .click();
      await page
        .locator('#reset-event-id-select')
        .locator('[role="option"]')
        .locator('visible=true')
        .first()
        .click();

      await page
        .getByTestId('reset-exclude-updates-checkbox')
        .locator('visible=true')
        .click();

      await page
        .getByTestId('reset-confirmation-modal')
        .locator('visible=true')
        .getByTestId('confirm-modal-button')
        .click();

      const request = await requestPromise;
      const body = request.postDataJSON();

      expect(body.resetReapplyExcludeTypes).toStrictEqual([
        ResetReapplyExcludeType.RESET_REAPPLY_EXCLUDE_TYPE_UPDATE,
      ]);

      expect(body.resetReapplyType).toBe(3);
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

    await expect(
      page.locator('#workflow-actions-menu-button').locator('visible=true'),
    ).toBeDisabled();

    await expect(
      page.locator('#workflow-actions-primary-button').locator('visible=true'),
    ).toBeDisabled();
  });

  test.describe('Workflow Cancel', () => {
    test('is disabled when cancel is disabled via Settings API', async ({
      page,
    }) => {
      await mockSettingsApi(page, { WorkflowCancelDisabled: true });

      await expect(
        page
          .locator('#workflow-actions-primary-button')
          .locator('visible=true'),
      ).toBeDisabled();

      await page
        .locator('#workflow-actions-menu-button')
        .locator('visible=true')
        .click();

      await expect(
        page
          .locator('#workflow-actions-menu')
          .locator('visible=true')
          .getByText('Send a Signal'),
      ).toBeEnabled();

      await expect(
        page
          .locator('#workflow-actions-menu')
          .locator('visible=true')
          .getByText('Terminate'),
      ).toBeEnabled();

      await expect(
        page
          .locator('#workflow-actions-menu')
          .locator('visible=true')
          .getByText('Reset'),
      ).toBeEnabled();
    });
  });

  test.describe('Workflow Terminate', () => {
    test('is disabled when teminate is disabled via Settings API', async ({
      page,
    }) => {
      await mockSettingsApi(page, { WorkflowTerminateDisabled: true });

      await expect(
        page
          .locator('#workflow-actions-primary-button')
          .locator('visible=true'),
      ).toBeEnabled();

      await page
        .locator('#workflow-actions-menu-button')
        .locator('visible=true')
        .click();

      await expect(
        page
          .locator('#workflow-actions-menu')
          .locator('visible=true')
          .getByText('Send a Signal'),
      ).toBeEnabled();

      await expect(
        page
          .locator('#workflow-actions-menu')
          .locator('visible=true')
          .getByText('Terminate'),
      ).toBeDisabled();

      await expect(
        page
          .locator('#workflow-actions-menu')
          .locator('visible=true')
          .getByText('Reset'),
      ).toBeEnabled();
    });
  });

  test.describe('Workflow Signal', () => {
    test('is disabled when signal is disabled via Settings API', async ({
      page,
    }) => {
      await mockSettingsApi(page, { WorkflowSignalDisabled: true });

      await expect(
        page
          .locator('#workflow-actions-primary-button')
          .locator('visible=true'),
      ).toBeEnabled();

      await page
        .locator('#workflow-actions-menu-button')
        .locator('visible=true')
        .click();

      await expect(
        page
          .locator('#workflow-actions-menu')
          .locator('visible=true')
          .getByText('Send a Signal'),
      ).toBeDisabled();

      await expect(
        page
          .locator('#workflow-actions-menu')
          .locator('visible=true')
          .getByText('Terminate'),
      ).toBeEnabled();

      await expect(
        page
          .locator('#workflow-actions-menu')
          .locator('visible=true')
          .getByText('Reset'),
      ).toBeEnabled();
    });
  });
});
