import { expect, test } from '@playwright/test';

import { ResetReapplyType } from '$src/lib/models/workflow-actions';
import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  mockCompletedWorkflow,
  mockWorkflowResetApi,
  WORKFLOW_RESET_API,
} from '~/test-utilities/mocks/workflow';

const {
  workflowExecutionInfo: {
    execution: { workflowId, runId },
  },
} = mockCompletedWorkflow;

const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}/history`;

test.describe('Workflow reset', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(workflowUrl);

    await mockWorkflowApis(page, mockCompletedWorkflow);
    await mockWorkflowResetApi(page);
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

    expect(body.resetReapplyType).toBe(ResetReapplyType.None);
  });

  test('allows reapplying signals after the reset point', async ({ page }) => {
    const requestPromise = page.waitForRequest(WORKFLOW_RESET_API);

    await page.getByTestId('workflow-reset-button').click();
    await page.locator('#reset-event-5').click();
    await page
      .getByRole('checkbox', {
        name: 'Reapply Signals that happened after the Reset point',
      })
      .first()
      .click();

    await page
      .getByTestId('reset-confirmation-modal')
      .getByTestId('confirm-modal-button')
      .click();

    const request = await requestPromise;
    const body = request.postDataJSON();

    expect(body.resetReapplyType).toBe(ResetReapplyType.Signal);
  });
});
