import { expect, test } from '@playwright/test';

import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const timelineUrl = `/namespaces/default/workflows/${workflowId}/${runId}/timeline`;

// The timeline graph labels its nodes for screen readers. The workflow bar is
// informational (role="img"); event nodes are interactive (role="button").
// These assertions fail if those accessible names regress.
test.describe('Timeline graph node accessible names', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowApis(page);
    await page.goto(timelineUrl);
  });

  test('workflow node announces its id and status', async ({ page }) => {
    await expect(
      page.getByRole('img', { name: `Workflow ${workflowId}: Running` }),
    ).toBeVisible();
  });

  test('event nodes announce their type and classification', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: 'Event LongActivity: Scheduled' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Event customSignal: Signaled' }),
    ).toBeVisible();
  });
});
