import { expect, type Page, test } from '@playwright/test';

import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import { WORKFLOW_API } from '~/test-utilities/mocks/workflow';
import {
  chainUrl,
  deferred,
  linearChain,
  mockChain,
  type MockRun,
  workflowId,
} from '~/test-utilities/mocks/workflow-execution-chain';

const runUrl = (runId: string, tab = 'timeline') =>
  `/namespaces/default/workflows/${workflowId}/${runId}/${tab}`;

const chainButton = (page: Page) =>
  page
    .getByTestId('run-timeline-heading')
    .getByRole('link', { name: 'View Execution Chain' });

const reusedWorkflowId = (): MockRun[] => [
  ...linearChain(2),
  {
    runId: 'run-new',
    firstRunId: 'run-new',
    activity: 'WorkNew',
    startTime: '2024-01-02T00:00:00.000Z',
    open: true,
  },
];

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

  test('the header has no chain link on other tabs', async ({ page }) => {
    await mockChain(page, {
      runs: linearChain(3),
      current: () => 'run-03',
    });

    const currentDescribed = describeCurrentResponse(page);
    await page.goto(runUrl('run-02', 'history'));
    await currentDescribed;

    await expect(page.getByTestId('event-summary-table')).toBeVisible();
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

test.describe('Timeline tab View Execution Chain button', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowApis(page);
  });

  test('is hidden for a single open first Run', async ({ page }) => {
    await mockChain(page, {
      runs: linearChain(1, { open: true }),
      current: () => 'run-01',
    });

    const historyLoaded = historyWithActivity(page, 'Work1');
    await page.goto(runUrl('run-01'));
    await historyLoaded;

    await expect(page.getByTestId('run-timeline-heading')).toBeVisible();
    await expect(chainButton(page)).toHaveCount(0);
  });

  test('links to the first Run from a Run with a predecessor', async ({
    page,
  }) => {
    await mockChain(page, {
      runs: linearChain(3),
      current: () => 'run-03',
    });

    await page.goto(runUrl('run-03'));

    await expect(chainButton(page)).toHaveAttribute('href', chainUrl('run-01'));
  });

  test('appears once the first Run closes with a successor', async ({
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

    const historyLoaded = historyWithActivity(page, 'WorkA');
    await page.goto(runUrl('run-a'));
    await historyLoaded;
    await expect(chainButton(page)).toHaveCount(0);

    handOff.resolve();

    await expect(chainButton(page)).toHaveAttribute('href', chainUrl('run-a'));
  });

  test('is disabled with a tooltip when the Workflow ID was reused', async ({
    page,
  }) => {
    await mockChain(page, {
      runs: reusedWorkflowId(),
      current: () => 'run-new',
    });

    await page.goto(runUrl('run-02'));

    await expect(chainButton(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(chainButton(page)).not.toHaveAttribute('href');
    await chainButton(page).focus();
    await expect(
      page.getByRole('tooltip', {
        name: 'This Workflow ID now has a newer chain',
      }),
    ).toBeVisible();
  });

  test('stays enabled when describing the current Run fails', async ({
    page,
  }) => {
    await mockChain(page, {
      runs: reusedWorkflowId(),
      current: () => 'run-new',
      currentStatus: 503,
    });

    const currentDescribed = describeCurrentResponse(page);
    await page.goto(runUrl('run-02'));
    await currentDescribed;

    await expect(chainButton(page)).toHaveAttribute('href', chainUrl('run-01'));
    await expect(chainButton(page)).not.toHaveAttribute('aria-disabled');
  });
});
