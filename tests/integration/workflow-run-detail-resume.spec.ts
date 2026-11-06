import { setTimeout as delay } from 'node:timers/promises';

import { expect, type Page, test } from '@playwright/test';

import {
  makeActivityCompleted,
  makeActivityScheduled,
  makeActivityStarted,
  makeWorkflowCompleted,
  makeWorkflowStarted,
} from '$src/lib/services/test-helpers/synthetic-events';
import type { HistoryEvent } from '$src/lib/types/events';
import type { WorkflowExecutionAPIResponse } from '$src/lib/types/workflows';
import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import { mockWorkflow, WORKFLOW_API } from '~/test-utilities/mocks/workflow';

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const secondRunId = '61797bf4-0d48-43d6-94aa-1921f7893200';
const runUrl = (id: string) =>
  `/namespaces/default/workflows/${workflowId}/${id}`;

const historyFor = (name: string): HistoryEvent[] => [
  makeWorkflowStarted(1),
  ...Array.from({ length: 3 }, (_, index) => {
    const scheduledId = index * 3 + 2;
    return [
      makeActivityScheduled(scheduledId, `${name}${index + 1}`),
      makeActivityStarted(scheduledId + 1, scheduledId),
      makeActivityCompleted(scheduledId + 2, scheduledId, scheduledId + 1),
    ];
  }).flat(),
  makeWorkflowCompleted(11),
];
const firstEvents = historyFor('ResumeFirstRunActivity');
const secondEvents = historyFor('ResumeSecondRunActivity');
const pageSize = 2;
const fullPageCount = Math.ceil(firstEvents.length / pageSize);

const workflowFor = (id: string): WorkflowExecutionAPIResponse => ({
  ...mockWorkflow,
  workflowExecutionInfo: {
    ...mockWorkflow.workflowExecutionInfo,
    execution: { workflowId, runId: id },
    status: 'Completed',
    startTime: firstEvents[0].eventTime,
    executionTime: firstEvents[0].eventTime,
    closeTime: firstEvents[10].eventTime,
    historyLength: String(firstEvents.length),
  },
  pendingActivities: [],
  pendingChildren: [],
});

async function mockPaginatedRuns(page: Page) {
  const requests = new Map<string, number>();
  await page.addInitScript(() => {
    localStorage.setItem('autoRefreshWorkflow', JSON.stringify('off'));
    localStorage.setItem('eventView', JSON.stringify('feed'));
  });
  await mockWorkflowApis(page, workflowFor(runId));
  await page.route(WORKFLOW_API, (route) => {
    const requestedRun = new URL(route.request().url()).searchParams.get(
      'execution.runId',
    );
    return route.fulfill({
      json: workflowFor(requestedRun === secondRunId ? secondRunId : runId),
    });
  });
  await page.route(EVENT_HISTORY_API_REVERSE, (route) =>
    route.fulfill({ json: { history: { events: [] }, nextPageToken: null } }),
  );
  await page.route(EVENT_HISTORY_API, (route) => {
    const url = new URL(route.request().url());
    const requestedRun = url.searchParams.get('execution.runId') ?? '';
    requests.set(requestedRun, (requests.get(requestedRun) ?? 0) + 1);
    const events = requestedRun === secondRunId ? secondEvents : firstEvents;
    const offset = Number(url.searchParams.get('next_page_token') ?? 0);
    const nextOffset = offset + pageSize;
    return route.fulfill({
      json: {
        history: { events: events.slice(offset, nextOffset) },
        nextPageToken: nextOffset < events.length ? String(nextOffset) : null,
      },
    });
  });
  return requests;
}

async function navigateWithinApp(page: Page, href: string) {
  const timeOrigin = await page.evaluate(() => performance.timeOrigin);
  await page.evaluate((destination) => {
    const link = document.createElement('a');
    link.href = destination;
    link.textContent = 'Switch resume test run';
    link.dataset.testid = 'resume-test-run-link';
    document.body.append(link);
    link.click();
  }, href);
  await expect(page).toHaveURL(href);
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin);
  await page
    .getByTestId('resume-test-run-link')
    .evaluate((link) => link.remove());
}

test.describe('Workflow run detail resume ownership', () => {
  test('does not carry full-history demand into another run on a non-history page, then resumes on history', async ({
    page,
  }) => {
    const requests = await mockPaginatedRuns(page);
    await page.goto(`${runUrl(runId)}/history`);
    await expect(page.getByTestId('event-summary-row')).toHaveCount(11);
    expect(requests.get(runId)).toBe(fullPageCount);

    await navigateWithinApp(page, `${runUrl(secondRunId)}/pending-activities`);
    await expect(page.getByTestId('workflow-id-heading')).toBeVisible();
    await expect.poll(() => requests.get(secondRunId)).toBe(2);
    await delay(500);
    expect(requests.get(secondRunId)).toBe(2);

    await page.getByTestId('history-tab').click();
    await expect(page.getByTestId('event-summary-row')).toHaveCount(11);
    expect(requests.get(secondRunId)).toBe(fullPageCount);
    await expect(page.getByTestId('event-summary-table')).toContainText(
      'ResumeSecondRunActivity3',
    );
    await expect(page.getByTestId('event-summary-table')).not.toContainText(
      'ResumeFirstRunActivity',
    );
  });

  for (const { view, verify } of [
    {
      view: 'history',
      verify: async (page: Page) => {
        await expect(page.getByTestId('event-summary-row')).toHaveCount(11);
        await expect(page.getByTestId('event-summary-table')).toContainText(
          'ResumeSecondRunActivity3',
        );
      },
    },
    {
      view: 'timeline',
      verify: async (page: Page) => {
        const activity = page.getByRole('button', {
          name: 'Event ResumeSecondRunActivity3: Completed',
        });
        await activity.scrollIntoViewIfNeeded();
        await expect(activity).toBeVisible();
      },
    },
    {
      view: 'history/events/8',
      verify: async (page: Page) => {
        await expect(page.getByTestId('event-summary-log')).toContainText(
          'ResumeSecondRunActivity3',
        );
        await expect(
          page.getByTestId('event-summary-row-expanded'),
        ).toBeVisible();
      },
    },
  ]) {
    test(`resumes the replacement history after a same-route run switch on ${view}`, async ({
      page,
    }) => {
      const requests = await mockPaginatedRuns(page);
      await page.goto(`${runUrl(runId)}/${view}`);
      await expect.poll(() => requests.get(runId)).toBe(fullPageCount);
      await expect(page.getByTestId('workflow-id-heading')).toBeVisible();

      await navigateWithinApp(page, `${runUrl(secondRunId)}/${view}`);
      await expect.poll(() => requests.get(secondRunId)).toBe(fullPageCount);
      await verify(page);
      await expect(page.locator('body')).not.toContainText(
        'ResumeFirstRunActivity3',
      );
    });
  }
});
