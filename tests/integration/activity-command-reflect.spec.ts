import { expect, test } from '@playwright/test';

import {
  mockClusterApi,
  mockSettingsApi,
  mockWorkflowApis,
} from '~/test-utilities/mock-apis';
import {
  mockRunningWorkflow,
  WORKFLOW_API,
} from '~/test-utilities/mocks/workflow';

// Regression coverage for: pausing a pending activity from the event view did
// not flip the button to "Unpause" until a full page reload.
//
// The event-group buffer stores long-lived plain EventGroup objects. After a
// pause command, workflow-run-layout refetches the describe and re-runs
// enrichGroups. When a group's pending metadata changes, enrichGroups now hands
// back a FRESH group object (grouped-event-buffer `cloneGroup`) so the
// reference-tracking Svelte views (event-details-full / timeline
// group-details-row) re-derive; previously it mutated `group.pendingActivity`
// in place, leaving the reference stable, and — since pause appends no history
// event — `eventCount` was unchanged so the buffer-backed views never updated.
//
// The Pending Activities tab reads $workflowRun.workflow.pendingActivities
// straight from the store, so it has always reflected the change — it's the
// "control" here.

const { workflowId, runId } =
  mockRunningWorkflow.workflowExecutionInfo.execution;

const historyUrl = `/namespaces/default/workflows/${workflowId}/${runId}/history`;
const pendingActivitiesUrl = `/namespaces/default/workflows/${workflowId}/${runId}/pending-activities`;

// Matches both the primary (activities-deprecated) and fallback (activities) routes.
const ACTIVITY_PAUSE_API = /\/activities(-deprecated)?\/pause/;

test.describe('Activity command reflection after pause', () => {
  test.beforeEach(async ({ page }) => {
    // The describe response flips its pending activity's `paused` flag to true
    // only after the pause command has been received — mirroring the server.
    let paused = false;

    await mockClusterApi(page);
    await mockSettingsApi(page);
    await mockWorkflowApis(page, mockRunningWorkflow);

    // Registered after mockWorkflowApis so this handler wins (Playwright matches
    // the most-recently-registered route first).
    await page.route(WORKFLOW_API, async (route) => {
      const workflow = structuredClone(mockRunningWorkflow);
      const activity = workflow.pendingActivities?.[0] as
        | { paused?: boolean }
        | undefined;
      if (activity) activity.paused = paused;
      await route.fulfill({ json: workflow });
    });

    await page.route(ACTIVITY_PAUSE_API, async (route) => {
      paused = true;
      await route.fulfill({ json: {} });
    });
  });

  test('control: Pending Activities tab flips to Unpause after pausing', async ({
    page,
  }) => {
    await page.goto(pendingActivitiesUrl);

    const pauseButton = page.getByRole('button', {
      name: 'Pause',
      exact: true,
    });
    await expect(pauseButton).toBeVisible();
    await pauseButton.click();

    const modal = page.getByTestId('activity-pause-confirmation-modal');
    const pauseRequest = page.waitForRequest(ACTIVITY_PAUSE_API);
    await modal.getByRole('button', { name: 'Pause', exact: true }).click();
    await pauseRequest;

    // Store-backed view — reflects the new paused state.
    await expect(
      page.getByRole('button', { name: 'Unpause', exact: true }),
    ).toBeVisible();
  });

  test('event history view flips to Unpause after pausing', async ({
    page,
  }) => {
    await page.goto(historyUrl);

    // Expand the pending activity row to reveal the activity command buttons.
    const activityRow = page
      .getByTestId('pending-activity-summary-row')
      .first();
    await expect(activityRow).toBeVisible();
    await activityRow.click();

    const pauseButton = page.getByRole('button', {
      name: 'Pause',
      exact: true,
    });
    await expect(pauseButton).toBeVisible();
    await pauseButton.click();

    const modal = page.getByTestId('activity-pause-confirmation-modal');
    const pauseRequest = page.waitForRequest(ACTIVITY_PAUSE_API);
    await modal.getByRole('button', { name: 'Pause', exact: true }).click();
    await pauseRequest;

    // The buffer-backed view re-derives from the freshly-cloned group and
    // reflects the new paused state without a reload.
    await expect(
      page.getByRole('button', { name: 'Unpause', exact: true }),
    ).toBeVisible();
  });
});
