import { expect, test } from '@playwright/test';

import { WorkflowPausePage } from '~/pages/workflow-pause';
import {
  mockClusterApi,
  mockEventHistoryApi,
  mockNamespaceApi,
  mockNamespaceWithPauseCapability,
  mockSettingsApi,
  mockWorkflowApis,
  mockWorkflowPauseApi,
  mockWorkflowUnpauseApi,
  WORKFLOW_PAUSE_API,
  WORKFLOW_UNPAUSE_API,
} from '~/test-utilities/mock-apis';
import {
  mockDelayedWorkflow,
  mockPausedWorkflow,
  mockRunningWorkflow,
} from '~/test-utilities/mocks/workflow';

test.describe('Workflow Pause', () => {
  const {
    workflowExecutionInfo: {
      execution: { workflowId, runId },
    },
  } = mockRunningWorkflow;

  test.describe('When workflowPause capability is enabled', () => {
    let workflowPausePage: WorkflowPausePage;

    test.beforeEach(async ({ page }) => {
      workflowPausePage = new WorkflowPausePage(page);
      await workflowPausePage.goto({ workflowId, runId });
      await mockClusterApi(page);
      await mockSettingsApi(page);
      await mockEventHistoryApi(page);
    });

    test('should show pause button for running workflow', async () => {
      await mockWorkflowApis(workflowPausePage.page, mockRunningWorkflow);
      await mockNamespaceWithPauseCapability(workflowPausePage.page);

      await expect(workflowPausePage.pauseButton).toBeVisible();
      await expect(workflowPausePage.pauseButton).toBeEnabled();
    });

    test('should disable the pause button when workflow is delayed', async () => {
      await mockWorkflowApis(workflowPausePage.page, mockDelayedWorkflow);
      await mockNamespaceWithPauseCapability(workflowPausePage.page);

      await expect(workflowPausePage.pauseButton).toBeDisabled();
    });

    test('should allow pausing a running workflow with a reason', async () => {
      await mockWorkflowApis(workflowPausePage.page, mockRunningWorkflow);
      await mockNamespaceWithPauseCapability(workflowPausePage.page);
      await mockWorkflowPauseApi(workflowPausePage.page);

      const pauseRequestPromise =
        workflowPausePage.page.waitForRequest(WORKFLOW_PAUSE_API);

      await workflowPausePage.openPauseModal();

      await expect(workflowPausePage.pauseModal).toBeVisible();
      await expect(workflowPausePage.pauseReasonInput).toBeVisible();

      await workflowPausePage.pauseReasonInput.fill(
        'Testing pause functionality',
      );
      await workflowPausePage.pauseConfirmButton.click();

      const request = await pauseRequestPromise;
      const body = request.postDataJSON();

      expect(body.namespace).toBe('default');
      expect(body.workflowId).toBe(workflowId);
      expect(body.runId).toBe(runId);
      expect(body.reason).toContain('Testing pause functionality');
    });

    test('should show alert when workflow is paused', async () => {
      await mockWorkflowApis(workflowPausePage.page, mockPausedWorkflow);
      await mockNamespaceWithPauseCapability(workflowPausePage.page);

      await expect(workflowPausePage.pausedAlert).toBeVisible();
      await expect(workflowPausePage.pausedAlertReason).toBeVisible();
      await expect(
        workflowPausePage.page.getByText('Testing pause functionality'),
      ).toBeVisible();
    });

    test('should display paused status', async () => {
      await mockWorkflowApis(workflowPausePage.page, mockPausedWorkflow);
      await mockNamespaceWithPauseCapability(workflowPausePage.page);

      await expect(workflowPausePage.pausedStatus).toBeVisible();
      await expect(workflowPausePage.pausedStatus).toContainText('Paused');
    });

    test('should show unpause button when workflow is paused', async () => {
      await mockWorkflowApis(workflowPausePage.page, mockPausedWorkflow);
      await mockNamespaceWithPauseCapability(workflowPausePage.page);

      await expect(workflowPausePage.unpauseButton).toBeVisible();
      await expect(workflowPausePage.unpauseButton).toBeEnabled();
    });

    test('should allow unpausing a paused workflow with a reason', async () => {
      await mockWorkflowApis(workflowPausePage.page, mockPausedWorkflow);
      await mockNamespaceWithPauseCapability(workflowPausePage.page);
      await mockWorkflowUnpauseApi(workflowPausePage.page);

      const unpauseRequestPromise =
        workflowPausePage.page.waitForRequest(WORKFLOW_UNPAUSE_API);

      await workflowPausePage.openUnpauseModal();

      await expect(workflowPausePage.unpauseModal).toBeVisible();
      await expect(workflowPausePage.unpauseReasonInput).toBeVisible();

      await workflowPausePage.unpauseReasonInput.fill(
        'Testing unpause functionality',
      );
      await workflowPausePage.unpauseConfirmButton.click();

      const request = await unpauseRequestPromise;
      const body = request.postDataJSON();

      expect(body.namespace).toBe('default');
      expect(body.workflowId).toBe(workflowId);
      expect(body.runId).toBe(runId);
      expect(body.reason).toContain('Testing unpause functionality');
    });

    test('should disable update action when workflow is paused', async () => {
      await mockWorkflowApis(workflowPausePage.page, mockPausedWorkflow);
      await mockNamespaceWithPauseCapability(workflowPausePage.page);

      await workflowPausePage.openMoreActionsMenu();

      await expect(workflowPausePage.updateMenuItem).toBeVisible();
      await expect(workflowPausePage.updateMenuItem).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    test('should keep other actions enabled when workflow is paused', async () => {
      await mockWorkflowApis(workflowPausePage.page, mockPausedWorkflow);
      await mockNamespaceWithPauseCapability(workflowPausePage.page);

      await workflowPausePage.openMoreActionsMenu();

      await expect(workflowPausePage.resetMenuItem).toBeEnabled();
      await expect(workflowPausePage.signalMenuItem).toBeEnabled();
      await expect(workflowPausePage.terminateMenuItem).toBeEnabled();
    });
  });

  test.describe('When workflowPause capability is disabled', () => {
    let workflowPausePage: WorkflowPausePage;

    test.beforeEach(async ({ page }) => {
      workflowPausePage = new WorkflowPausePage(page);
      await workflowPausePage.goto({ workflowId, runId });
      await mockWorkflowApis(page, mockRunningWorkflow);
    });

    test('should not show pause button', async () => {
      await mockNamespaceApi(workflowPausePage.page);

      await expect(workflowPausePage.pauseButton).toBeHidden();
      await expect(workflowPausePage.requestCancellationButton).toBeVisible();
    });
  });

  test.describe('When global write actions are disabled', () => {
    let workflowPausePage: WorkflowPausePage;

    test.beforeEach(async ({ page }) => {
      workflowPausePage = new WorkflowPausePage(page);
      await workflowPausePage.goto({ workflowId, runId });
      await mockWorkflowApis(page, mockRunningWorkflow);
      await mockNamespaceWithPauseCapability(page);
      await mockSettingsApi(page, { DisableWriteActions: true });
    });

    test('should disabled the pause button', async () => {
      await expect(workflowPausePage.pauseButton).toBeDisabled();
    });
  });
});
