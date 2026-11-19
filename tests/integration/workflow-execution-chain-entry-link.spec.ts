import { expect, type Page, test } from '@playwright/test';

import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import { WORKFLOW_API } from '~/test-utilities/mocks/workflow';
import {
  deferred,
  linearChain,
  mockChain,
  type MockRun,
  workflowId,
} from '~/test-utilities/mocks/workflow-execution-chain';

const runUrl = (runId: string) =>
  `/namespaces/default/workflows/${workflowId}/${runId}/timeline`;

const isDescribeCurrent = (url: string) =>
  WORKFLOW_API.test(url) && !new URL(url).searchParams.has('execution.runId');

const describeCurrentResponse = (page: Page) =>
  page.waitForResponse((response) => isDescribeCurrent(response.url()));

const countDescribeCurrentRequests = (page: Page) => {
  const counter = { count: 0 };
  page.on('request', (request) => {
    if (isDescribeCurrent(request.url())) {
      counter.count += 1;
    }
  });
  return counter;
};

const historyWithActivity = (page: Page, activity: string) =>
  page.waitForResponse(async (response) => {
    const url = response.url();
    if (!EVENT_HISTORY_API.test(url) && !EVENT_HISTORY_API_REVERSE.test(url)) {
      return false;
    }
    const body = await response.json().catch(() => null);
    return JSON.stringify(body?.history?.events ?? []).includes(activity);
  });

test.describe('Run page current Run', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowApis(page);
  });

  test('the header has no chain link', async ({ page }) => {
    await mockChain(page, {
      runs: linearChain(3),
      current: () => 'run-03',
    });

    const currentDescribed = describeCurrentResponse(page);
    await page.goto(runUrl('run-02'));
    await currentDescribed;

    await expect(page.getByTestId('view-execution-chain')).toHaveCount(0);
  });

  test('is described once for a closed Run in a multi-Run chain', async ({
    page,
  }) => {
    await mockChain(page, {
      runs: linearChain(3),
      current: () => 'run-03',
    });
    const describeCurrent = countDescribeCurrentRequests(page);

    const currentDescribed = describeCurrentResponse(page);
    await page.goto(runUrl('run-02'));
    await currentDescribed;

    await expect(
      page.getByRole('link', { name: 'run-03', exact: true }),
    ).toBeVisible();
    expect(describeCurrent.count).toBe(1);
  });

  test('is not described for a closed single-Run chain', async ({ page }) => {
    await mockChain(page, {
      runs: linearChain(1),
      current: () => 'run-01',
    });
    const describeCurrent = countDescribeCurrentRequests(page);

    const historyLoaded = historyWithActivity(page, 'Work1');
    await page.goto(runUrl('run-01'));
    await historyLoaded;

    expect(describeCurrent.count).toBe(0);
  });

  test('is described once an open Run closes with a successor', async ({
    page,
  }) => {
    const handOff = deferred();
    const runs: MockRun[] = [
      {
        runId: 'run-a',
        firstRunId: 'run-a',
        successorRunId: 'run-b',
        activity: 'WorkA',
        startTime: '2024-01-01T00:00:00.000Z',
        open: true,
        release: handOff.promise,
      },
      {
        runId: 'run-b',
        firstRunId: 'run-a',
        predecessorRunId: 'run-a',
        activity: 'WorkB',
        startTime: '2024-01-01T00:30:00.000Z',
        open: true,
      },
    ];
    await mockChain(page, { runs, current: () => 'run-b' });
    const describeCurrent = countDescribeCurrentRequests(page);

    const historyLoaded = historyWithActivity(page, 'WorkA');
    await page.goto(runUrl('run-a'));
    await historyLoaded;

    expect(describeCurrent.count).toBe(0);

    const currentDescribed = describeCurrentResponse(page);
    handOff.resolve();
    await currentDescribed;

    expect(describeCurrent.count).toBe(1);
  });
});
