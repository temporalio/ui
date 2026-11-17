import { expect, type Page, test } from '@playwright/test';

import {
  makeActivityCompleted,
  makeActivityScheduled,
  makeActivityStarted,
  makeWorkflowStarted,
  makeWorkflowTaskCompleted,
  makeWorkflowTaskScheduled,
  makeWorkflowTaskStarted,
} from '$src/lib/services/test-helpers/synthetic-events';
import type { HistoryEvent } from '$src/lib/types/events';
import type { WorkflowExecutionAPIResponse } from '$src/lib/types/workflows';
import { mockNamespaceApis } from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import { mockWorkflow, WORKFLOW_API } from '~/test-utilities/mocks/workflow';

const workflowId = 'chain-workflow';
const chainUrl = (firstRunId: string, search = '') =>
  `/namespaces/default/workflows/${workflowId}/chains/${firstRunId}${search}`;

type MockRun = {
  runId: string;
  firstRunId: string;
  predecessor?: string;
  successor?: string;
  activity: string;
  startTime: string;
  closeTime?: string;
  open?: boolean;
  release?: Promise<void>;
};

const never = new Promise<void>(() => {});

const historyPage = (events: HistoryEvent[]) => ({
  history: { events },
  rawHistory: [],
  nextPageToken: null,
  archived: false,
});

const atTime = (event: HistoryEvent, eventTime: string): HistoryEvent => ({
  ...event,
  eventTime,
});

const startedEvent = (run: MockRun): HistoryEvent => {
  const event = makeWorkflowStarted(1);
  return atTime(
    {
      ...event,
      workflowExecutionStartedEventAttributes: {
        ...event.workflowExecutionStartedEventAttributes,
        firstExecutionRunId: run.firstRunId,
        originalExecutionRunId: run.runId,
        continuedExecutionRunId: run.predecessor ?? '',
      },
    } as HistoryEvent,
    run.startTime,
  );
};

const workflowTaskCompleted = (): HistoryEvent => {
  const event = makeWorkflowTaskCompleted(4, 2);
  return {
    ...event,
    workflowTaskCompletedEventAttributes: {
      ...event.workflowTaskCompletedEventAttributes,
      sdkMetadata: { sdkName: 'temporal-go', sdkVersion: '1.35.0' },
    },
  } as HistoryEvent;
};

const closeEvent = (run: MockRun): HistoryEvent =>
  atTime(
    (run.successor
      ? {
          eventId: '8',
          eventType: 'WorkflowExecutionContinuedAsNew',
          version: '0',
          taskId: '80',
          links: [],
          workflowExecutionContinuedAsNewEventAttributes: {
            newExecutionRunId: run.successor,
            workflowType: { name: 'TestWorkflow' },
            taskQueue: { name: 'default', kind: 'Normal' },
          },
        }
      : {
          eventId: '8',
          eventType: 'WorkflowExecutionCompleted',
          version: '0',
          taskId: '80',
          links: [],
          workflowExecutionCompletedEventAttributes: { result: null },
        }) as unknown as HistoryEvent,
    run.closeTime ?? run.startTime,
  );

const openEvents = (run: MockRun): HistoryEvent[] => [
  startedEvent(run),
  atTime(makeWorkflowTaskScheduled(2), run.startTime),
  atTime(makeWorkflowTaskStarted(3, 2), run.startTime),
  atTime(workflowTaskCompleted(), run.startTime),
  atTime(makeActivityScheduled(5, run.activity), run.startTime),
  atTime(makeActivityStarted(6, 5), run.startTime),
  atTime(makeActivityCompleted(7, 5, 6), run.startTime),
];

const closedEvents = (run: MockRun): HistoryEvent[] => [
  ...openEvents(run),
  closeEvent(run),
];

const describeResponse = (run: MockRun): WorkflowExecutionAPIResponse => {
  const closed = !run.open;
  return {
    ...mockWorkflow,
    workflowExecutionInfo: {
      ...mockWorkflow.workflowExecutionInfo,
      execution: { workflowId, runId: run.runId },
      startTime: run.startTime,
      closeTime: closed ? (run.closeTime ?? run.startTime) : '',
      status: closed
        ? run.successor
          ? 'ContinuedAsNew'
          : 'Completed'
        : 'Running',
      historyLength: closed ? '8' : '7',
      firstRunId: run.firstRunId,
    },
    pendingActivities: [],
    pendingChildren: [],
  } as unknown as WorkflowExecutionAPIResponse;
};

type ChainMock = {
  runs: MockRun[];
  current: () => string;
  holdCurrent?: Promise<void>;
  currentStatus?: number;
};

const notFound = { status: 404, json: { code: 5, message: 'not found' } };

const mockChain = async (page: Page, chain: ChainMock) => {
  const findRun = (runId: string | null) =>
    chain.runs.find((run) => run.runId === runId);
  const livePolls = new Map<string, number>();

  await mockNamespaceApis(page);

  await page.route(WORKFLOW_API, async (route) => {
    const url = new URL(route.request().url());
    const runId = url.searchParams.get('execution.runId');
    if (!runId) {
      await chain.holdCurrent;
      if (chain.currentStatus) {
        return route.fulfill({
          status: chain.currentStatus,
          json: { code: 13, message: 'unavailable' },
        });
      }
    }
    const run = findRun(runId ?? chain.current());
    if (!run) {
      return route.fulfill(notFound);
    }
    return route.fulfill({ json: describeResponse(run) });
  });

  await page.route(EVENT_HISTORY_API, async (route) => {
    const url = new URL(route.request().url());
    const run = findRun(url.searchParams.get('execution.runId'));
    if (!run) {
      return route.fulfill(notFound);
    }
    if (url.searchParams.get('maximumPageSize') === '1') {
      return route.fulfill({ json: historyPage([startedEvent(run)]) });
    }
    if (url.searchParams.get('waitNewEvent') !== 'true' || !run.open) {
      return route.fulfill({ json: historyPage(closedEvents(run)) });
    }
    const polls = livePolls.get(run.runId) ?? 0;
    livePolls.set(run.runId, polls + 1);
    if (polls === 0) {
      return route.fulfill({ json: historyPage(openEvents(run)) });
    }
    if (polls > 1 || !run.release) {
      await never;
    }
    await run.release;
    run.open = false;
    return route.fulfill({ json: historyPage([closeEvent(run)]) });
  });

  await page.route(EVENT_HISTORY_API_REVERSE, (route) => {
    const url = new URL(route.request().url());
    const run = findRun(url.searchParams.get('execution.runId'));
    if (!run) {
      return route.fulfill(notFound);
    }
    const events = run.open ? openEvents(run) : closedEvents(run);
    return route.fulfill({ json: historyPage([...events].reverse()) });
  });
};

const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

const header = (page: Page) => page.getByTestId('chain-header');

const detailValue = (page: Page, label: string) =>
  header(page)
    .locator('dt', { hasText: label })
    .locator('xpath=./following-sibling::dd[1]');

const closedChain = (): MockRun[] => [
  {
    runId: 'run-a',
    firstRunId: 'run-a',
    successor: 'run-b',
    activity: 'WorkA',
    startTime: '2024-01-01T00:00:00.000Z',
    closeTime: '2024-01-01T00:30:00.000Z',
  },
  {
    runId: 'run-b',
    firstRunId: 'run-a',
    predecessor: 'run-a',
    activity: 'WorkB',
    startTime: '2024-01-01T00:30:00.000Z',
    closeTime: '2024-01-01T01:00:00.000Z',
  },
];

test.describe('Workflow execution chain page', () => {
  test('shows the skeleton, then the header fields', async ({ page }) => {
    const current = deferred();
    await mockChain(page, {
      runs: closedChain(),
      current: () => 'run-b',
      holdCurrent: current.promise,
    });

    await page.goto(chainUrl('run-a'));

    await expect(page.getByTestId('chain-skeleton')).toBeVisible();
    await expect(page.getByTestId('workflow-id-heading')).toHaveText(
      workflowId,
    );
    await expect(page.getByText('Chain of Executions')).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Breadcrumbs' })
        .getByRole('link', { name: 'Chain', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(
      page.getByRole('link', { name: workflowId, exact: true }),
    ).toHaveAttribute('href', /WorkflowId/);

    current.resolve();

    await expect(page.getByTestId('chain-skeleton')).toHaveCount(0);
    await expect(detailValue(page, 'Chain Start')).not.toHaveText(/Unknown/);
    await expect(detailValue(page, 'Chain Duration')).toHaveText('1 hour');
    await expect(
      header(page).getByRole('link', { name: 'run-b' }),
    ).toBeVisible();
    await expect(detailValue(page, 'Workflow SDK')).toContainText(
      /Go\s+1\.35\.0/,
    );
    await expect(
      page.getByRole('button', { name: /^Event WorkB:/ }),
    ).toBeVisible();
  });

  test('links the first run once it is found', async ({ page }) => {
    await mockChain(page, { runs: closedChain(), current: () => 'run-b' });

    await page.goto(chainUrl('run-a'));

    await expect(
      header(page).getByRole('link', { name: 'run-a' }),
    ).toHaveAttribute('href', /\/workflows\/chain-workflow\/run-a/);
  });

  test('shows the first run as past retention when it is not found', async ({
    page,
  }) => {
    const [, latest] = closedChain();
    await mockChain(page, { runs: [latest], current: () => 'run-b' });

    await page.goto(chainUrl('run-a'));

    await expect(detailValue(page, 'First run')).toHaveText(
      'run-a (past retention)',
    );
    await expect(header(page).getByRole('link', { name: 'run-a' })).toHaveCount(
      0,
    );
    await expect(detailValue(page, 'Chain Start')).toHaveText(
      'Unknown (past retention)',
    );
    await expect(detailValue(page, 'Chain Duration')).toHaveText('Unknown');
  });

  test('ticks the chain duration while the chain is open', async ({ page }) => {
    const [first] = closedChain();
    const open: MockRun = {
      runId: 'run-b',
      firstRunId: 'run-a',
      predecessor: 'run-a',
      activity: 'WorkB',
      startTime: '2024-01-01T00:30:00.000Z',
      open: true,
    };
    await mockChain(page, { runs: [first, open], current: () => 'run-b' });

    await page.goto(chainUrl('run-a'));

    const duration = detailValue(page, 'Chain Duration');
    await expect(duration).toHaveText(/second/);
    const initial = await duration.textContent();
    await expect(duration).not.toHaveText(initial ?? '');
  });

  test('follows a continue-as-new hand-off and keeps filters in the URL', async ({
    page,
  }) => {
    const handOff = deferred();
    const runs: MockRun[] = [
      {
        runId: 'run-a',
        firstRunId: 'run-a',
        successor: 'run-b',
        activity: 'WorkA',
        startTime: '2024-01-01T00:00:00.000Z',
        open: true,
        release: handOff.promise,
      },
      {
        runId: 'run-b',
        firstRunId: 'run-a',
        predecessor: 'run-a',
        activity: 'WorkB',
        startTime: '2024-01-01T00:30:00.000Z',
        open: true,
      },
    ];
    let currentRunId = 'run-a';
    await mockChain(page, { runs, current: () => currentRunId });

    await page.goto(chainUrl('run-a', '?sort=ascending&category=activity'));

    await expect(header(page).getByRole('link', { name: 'run-a' })).toHaveCount(
      2,
    );
    await expect(
      page.getByRole('button', { name: /^Event WorkA:/ }),
    ).toBeVisible();
    await expect(page.getByTestId('zoom-in')).toHaveText(/Ascending/);

    currentRunId = 'run-b';
    handOff.resolve();

    await expect(
      detailValue(page, 'Latest run').getByRole('link', { name: 'run-b' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^Event WorkB:/ }),
    ).toBeVisible();
    await expect(page.getByTestId('zoom-in')).toHaveText(/Ascending/);
    const url = new URL(page.url());
    expect(url.searchParams.get('sort')).toBe('ascending');
    expect(url.searchParams.get('category')).toBe('activity');
    expect(url.searchParams.has('run')).toBe(false);
  });

  test('stops at a closed chain', async ({ page }) => {
    await page.clock.install();
    await mockChain(page, { runs: closedChain(), current: () => 'run-b' });

    await page.goto(chainUrl('run-a'));

    await expect(detailValue(page, 'Chain Duration')).toHaveText('1 hour');
    await page.clock.runFor(5000);
    await expect(detailValue(page, 'Chain Duration')).toHaveText('1 hour');
    await expect(
      detailValue(page, 'Latest run').getByRole('link', { name: 'run-b' }),
    ).toBeVisible();
  });

  test('shows the chain error with a filtered back link on a 404', async ({
    page,
  }) => {
    await mockChain(page, { runs: [], current: () => 'missing' });

    await page.goto(chainUrl('run-a'));

    const error = page.getByTestId('workflow-chain-error');
    await expect(error).toContainText('404');
    await expect(error).toContainText(
      'This is not the workflow execution chain you are looking for',
    );
    const backLink = page.getByTestId('back-to-workflows');
    await expect(backLink).toHaveAttribute('href', /WorkflowId/);
    await expect(backLink).toHaveAttribute('href', /chain-workflow/);
  });

  test('shows the chain error after retrying a 5xx', async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0;
    });
    await mockChain(page, {
      runs: closedChain(),
      current: () => 'run-b',
      currentStatus: 503,
    });

    await page.goto(chainUrl('run-a'));

    const error = page.getByTestId('workflow-chain-error');
    await expect(error).toContainText('503');
    await expect(error).toContainText(
      'We are having technical difficulties retrieving this workflow execution chain',
    );
    await expect(page.getByTestId('back-to-workflows')).toHaveAttribute(
      'href',
      /WorkflowId/,
    );
  });

  test('warns that the chain is older when the Workflow ID was reused', async ({
    page,
  }) => {
    await mockChain(page, {
      runs: [
        {
          runId: 'old-a',
          firstRunId: 'old-a',
          activity: 'OldWork',
          startTime: '2023-01-01T00:00:00.000Z',
        },
        ...closedChain(),
      ],
      current: () => 'run-b',
    });

    await page.goto(chainUrl('old-a'));

    const warning = page.getByTestId('chain-mismatch-warning');
    await expect(warning).toContainText('Workflow ID was reused');
    await expect(
      warning.getByRole('link', { name: 'View the newer chain' }),
    ).toHaveAttribute('href', chainUrl('run-a'));
    await expect(page.getByTestId('chain-header')).toHaveCount(0);
  });

  test('redirects a mid-chain Run ID to its chain and keeps ?run=', async ({
    page,
  }) => {
    await mockChain(page, { runs: closedChain(), current: () => 'run-b' });

    await page.goto(chainUrl('run-b', '?run=run-a&sort=ascending'));

    await expect(page).toHaveURL(/\/chains\/run-a\?run=run-a&sort=ascending$/);
    await expect(page.getByTestId('workflow-id-heading')).toBeVisible();
  });

  test('shows a neutral warning when the route chain is not visible', async ({
    page,
  }) => {
    await mockChain(page, { runs: closedChain(), current: () => 'run-b' });

    await page.goto(chainUrl('gone'));

    const warning = page.getByTestId('chain-mismatch-warning');
    await expect(warning).toContainText(
      'No workflow execution chain starting at gone is visible for this Workflow ID; it may be past retention',
    );
    await expect(
      warning.getByRole('link', { name: 'View the current chain' }),
    ).toHaveAttribute('href', chainUrl('run-a'));
  });
});
