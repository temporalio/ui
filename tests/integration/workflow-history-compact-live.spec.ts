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

    // innerText, not textContent — the latter runs the ids together.
    const ids = () =>
      row.evaluate((el) =>
        (el as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
      );

    // Scheduled + Started only.
    await expect.poll(ids).toMatch(/^2 3 /);

    releaseCompletion();

    // Same group, no reload, no remount.
    await expect.poll(ids).toMatch(/^2 3 4 /);
  });

  test('keeps a row expanded when its group gains an event', async ({
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

    await row
      .getByRole('button', { name: /expand|collapse/i })
      .first()
      .click();
    const details = page.getByTestId('event-summary-row-expanded').first();
    await expect(details).toBeVisible();

    releaseCompletion();

    // The completion lands, so the row must re-render — without remounting and
    // dropping the expansion the user opened.
    await expect
      .poll(() =>
        row.evaluate((el) =>
          (el as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
        ),
      )
      .toMatch(/^2 3 4 /);
    await expect(details).toBeVisible();
  });
});
