import type { Page } from '@playwright/test';

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

export const workflowId = 'chain-workflow';
export const chainUrl = (firstRunId: string, search = '') =>
  `/namespaces/default/workflows/${workflowId}/chains/${firstRunId}${search}`;

type ContinueAsNewInitiator =
  | 'CONTINUE_AS_NEW_INITIATOR_WORKFLOW'
  | 'CONTINUE_AS_NEW_INITIATOR_RETRY'
  | 'CONTINUE_AS_NEW_INITIATOR_CRON_SCHEDULE';

export type MockRun = {
  runId: string;
  firstRunId: string;
  predecessorRunId?: string;
  successorRunId?: string;
  activity: string;
  startTime: string;
  closeTime?: string;
  currentTime?: string;
  open?: boolean;
  release?: Promise<void>;
  describeRelease?: Promise<void>;
  continueAsNewInitiator?: ContinueAsNewInitiator;
  historyErrorStatus?: number;
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
        continuedExecutionRunId: run.predecessorRunId ?? '',
        ...(run.continueAsNewInitiator && {
          initiator: run.continueAsNewInitiator,
        }),
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
    (run.successorRunId
      ? {
          eventId: '8',
          eventType: 'WorkflowExecutionContinuedAsNew',
          version: '0',
          taskId: '80',
          links: [],
          workflowExecutionContinuedAsNewEventAttributes: {
            newExecutionRunId: run.successorRunId,
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
        ? run.successorRunId
          ? 'ContinuedAsNew'
          : 'Completed'
        : 'Running',
      historyLength: closed ? '8' : '7',
      firstRunId: run.firstRunId,
    },
    pendingActivities: [],
    pendingChildren: [],
    ...(run.currentTime && {
      workflowExtendedInfo: {
        timeSkippingInfo: { currentTime: run.currentTime },
      },
    }),
  } as unknown as WorkflowExecutionAPIResponse;
};

type ChainMock = {
  runs: MockRun[];
  current: () => string;
  holdCurrent?: Promise<void>;
  currentStatus?: number;
};

const notFound = { status: 404, json: { code: 5, message: 'not found' } };

export const mockChain = async (page: Page, chain: ChainMock) => {
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
    if (runId) {
      await run.describeRelease;
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
    if (run.historyErrorStatus) {
      return route.fulfill({
        status: run.historyErrorStatus,
        json: { code: 13, message: 'unavailable' },
      });
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
    if (run.historyErrorStatus) {
      return route.fulfill({
        status: run.historyErrorStatus,
        json: { code: 13, message: 'unavailable' },
      });
    }
    const events = run.open ? openEvents(run) : closedEvents(run);
    return route.fulfill({ json: historyPage([...events].reverse()) });
  });
};

export const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

export const header = (page: Page) => page.getByTestId('chain-header');

export const detailValue = (page: Page, label: string) =>
  header(page)
    .locator('dt', { hasText: label })
    .locator('xpath=./following-sibling::dd[1]');

export const closedChain = (): MockRun[] => [
  {
    runId: 'run-a',
    firstRunId: 'run-a',
    successorRunId: 'run-b',
    activity: 'WorkA',
    startTime: '2024-01-01T00:00:00.000Z',
    closeTime: '2024-01-01T00:30:00.000Z',
  },
  {
    runId: 'run-b',
    firstRunId: 'run-a',
    predecessorRunId: 'run-a',
    activity: 'WorkB',
    startTime: '2024-01-01T00:30:00.000Z',
    closeTime: '2024-01-01T01:00:00.000Z',
  },
];

export const linearChain = (
  count: number,
  { open = false }: { open?: boolean } = {},
): MockRun[] =>
  Array.from({ length: count }, (_, index) => {
    const runId = `run-${String(index + 1).padStart(2, '0')}`;
    const isLatest = index === count - 1;
    return {
      runId,
      firstRunId: 'run-01',
      predecessorRunId:
        index > 0 ? `run-${String(index).padStart(2, '0')}` : undefined,
      successorRunId: isLatest
        ? undefined
        : `run-${String(index + 2).padStart(2, '0')}`,
      activity: `Work${index + 1}`,
      startTime: new Date(Date.UTC(2024, 0, 1, index)).toISOString(),
      closeTime: new Date(Date.UTC(2024, 0, 1, index + 1)).toISOString(),
      open: isLatest && open,
    };
  });
