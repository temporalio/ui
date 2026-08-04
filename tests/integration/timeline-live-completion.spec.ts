import { expect, test } from '@playwright/test';

import {
  makeActivityCompleted,
  makeActivityScheduled,
  makeActivityStarted,
  makeWorkflowStarted,
} from '$src/lib/services/test-helpers/synthetic-events';
import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

// Regression for: a running group's timeline bar/label stayed "in progress"
// after it completed, until reload. The completion arrives via the live poll,
// which used to extend the group in place — the row pool keys on group identity,
// so a stable reference meant no re-render. The buffer now copy-on-writes the
// group, handing the row a fresh reference. The accessible name
// ("Event <type>: <classification>") is the robust, non-brittle proxy for the
// recolor — with the bug it stays non-Completed.

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const timelineUrl = `/namespaces/default/workflows/${workflowId}/${runId}/timeline`;

// Activity scheduled + started, not yet completed.
const inProgress = [
  makeWorkflowStarted(1),
  makeActivityScheduled(2, 'DeployNetwork'),
  makeActivityStarted(3, 2),
];
const completion = makeActivityCompleted(4, 2, 3);

const historyPage = (events: unknown[]) => ({
  history: { events },
  rawHistory: [],
  nextPageToken: null,
  archived: false,
});

const runningWorkflow = {
  ...mockWorkflow,
  workflowExecutionInfo: {
    ...mockWorkflow.workflowExecutionInfo,
    status: 'Running',
    closeTime: null,
  },
  // Keep the activity out of pendingActivities so its in-progress state comes
  // purely from its classification (Started), isolating the recolor path.
  pendingActivities: [],
  pendingChildren: [],
};

test.describe('Timeline live completion', () => {
  test('recolors/relabels a group to Completed when the completion arrives live', async ({
    page,
  }) => {
    await mockWorkflowApis(page, runningWorkflow);

    // The live poll long-polls the ascending history route with
    // waitNewEvent=true; deliver the completion on the first such request and
    // nothing thereafter. The initial (non-waitNewEvent) fetch stays in-progress.
    let completionDelivered = false;
    await page.route(EVENT_HISTORY_API, async (route) => {
      if (route.request().url().includes('waitNewEvent=true')) {
        if (!completionDelivered) {
          completionDelivered = true;
          // Hold the completion until after the row has rendered in-progress —
          // the stale-color bug only shows once the blue bar is already on
          // screen and the completion then lands on the rendered group.
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return route.fulfill({ json: historyPage([completion]) });
        }
        return route.fulfill({ json: historyPage([]) });
      }
      return route.fulfill({ json: historyPage(inProgress) });
    });
    await page.route(EVENT_HISTORY_API_REVERSE, (route) =>
      route.fulfill({ json: historyPage([...inProgress].reverse()) }),
    );

    await page.goto(timelineUrl);

    // Row renders in progress first (Started, not Completed)...
    const groupButton = page.getByRole('button', {
      name: /^Event DeployNetwork:/,
    });
    await expect(groupButton).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Event DeployNetwork: Completed' }),
    ).toHaveCount(0);

    // ...then flips to Completed once the live completion arrives — no reload.
    await expect(
      page.getByRole('button', { name: 'Event DeployNetwork: Completed' }),
    ).toBeVisible();
  });
});
