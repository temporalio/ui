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

// Regression: a compact row renders a materialized group, but the {#each} item
// is the lazy group, whose identity is stable as it gains events. Keyed on id
// alone the block was reused, the {@const} never re-ran, and the row kept its
// stale group until the view remounted. The row lists its event ids, so a
// missing id is the visible symptom.

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const historyUrl = `/namespaces/default/workflows/${workflowId}/${runId}/history`;

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
  pendingActivities: [],
  pendingChildren: [],
};

test.describe('Workflow History compact view, live updates', () => {
  test('re-renders a grouped row when the completion arrives live', async ({
    page,
  }) => {
    let releaseCompletion: () => void;
    const completionHeld = new Promise<void>((resolve) => {
      releaseCompletion = resolve;
    });

    await mockWorkflowApis(page, runningWorkflow);
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

    await page.goto(historyUrl);
    await expect(page.getByTestId('event-summary-table')).toBeVisible();
    await page.getByTestId('compact').click();

    const row = page.getByTestId('event-summary-row').first();
    await expect(row).toContainText('DeployNetwork');

    // The row opens with its event ids. textContent runs them together, so read
    // innerText, which keeps the layout whitespace.
    const ids = () =>
      row.evaluate((el) =>
        (el as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
      );

    // Scheduled + Started only.
    await expect.poll(ids).toMatch(/^2 3 /);

    releaseCompletion();

    // The completion joins the same group — no reload, no remount.
    await expect.poll(ids).toMatch(/^2 3 4 /);
  });
});
