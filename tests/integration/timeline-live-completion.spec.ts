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

// Activity scheduled + started on a retry, not yet completed.
const retriedStart = makeActivityStarted(3, 2);
if (retriedStart.activityTaskStartedEventAttributes) {
  retriedStart.activityTaskStartedEventAttributes.attempt = 2;
}
const inProgress = [
  makeWorkflowStarted(1),
  makeActivityScheduled(2, 'DeployNetwork'),
  retriedStart,
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

    // The stale-color bug only shows once the in-progress bar is already on
    // screen and the completion then lands on the rendered group. The live poll
    // starts before the initial fetch, so the completion is held until the test
    // has observed that state — a fixed delay would race initial render.
    let releaseCompletion: () => void;
    const completionHeld = new Promise<void>((resolve) => {
      releaseCompletion = resolve;
    });

    // The live poll long-polls the ascending history route with
    // waitNewEvent=true; deliver the completion on the first such request and
    // nothing thereafter. The initial (non-waitNewEvent) fetch stays in-progress.
    let completionDelivered = false;
    await page.route(EVENT_HISTORY_API, async (route) => {
      if (route.request().url().includes('waitNewEvent=true')) {
        if (!completionDelivered) {
          completionDelivered = true;
          await completionHeld;
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
    const completedButton = page.getByRole('button', {
      name: 'Event DeployNetwork: Completed',
    });
    await expect(
      page.getByRole('button', { name: /^Event DeployNetwork:/ }),
    ).toBeVisible();
    await expect(completedButton).toHaveCount(0);

    // ...then flips to Completed once the live completion arrives — no reload.
    releaseCompletion();
    await expect(completedButton).toBeVisible();

    const attemptBadge = completedButton.getByTestId('timeline-attempt-badge');
    const retryIcon = 'use[href="#ti-retry"]';
    await expect(attemptBadge).toContainText('2');
    await expect(completedButton.locator(retryIcon)).toHaveCount(1);
    await expect(attemptBadge.locator(retryIcon)).toHaveCount(1);
  });
});
