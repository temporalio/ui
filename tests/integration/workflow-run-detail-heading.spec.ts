import { expect, type Page, test } from '@playwright/test';

import {
  makeActivityCompleted,
  makeActivityScheduled,
  makeActivityStarted,
  makeSyntheticEvents,
  makeWorkflowStarted,
} from '$src/lib/services/test-helpers/synthetic-events';
import type { HistoryEvent } from '$src/lib/types/events';
import {
  mockEventHistoryApi,
  mockWorkflowApis,
} from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';
import {
  linearChain,
  mockChain,
  type MockRun,
  workflowId,
} from '~/test-utilities/mocks/workflow-execution-chain';

const runPath = (runId: string, tab = 'timeline') =>
  `/namespaces/default/workflows/${workflowId}/${runId}/${tab}`;

const heading = (page: Page) => page.getByTestId('run-timeline-heading');

const navigation = (page: Page) =>
  heading(page).getByRole('group', { name: 'Run navigation' });

const navigationLinks = (page: Page) => navigation(page).getByRole('link');

const navigationLink = (page: Page, name: string) =>
  navigation(page).getByRole('link', { name });

const timelineOf = (runId: string) => new RegExp(`/${runId}/timeline`);

const historyPage = (events: HistoryEvent[], nextPageToken: string | null) => ({
  history: { events },
  rawHistory: [],
  nextPageToken,
  archived: false,
});

test.describe('Run page timeline heading', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowApis(page);
  });

  test('shows the Run ID as the tab heading', async ({ page }) => {
    await mockChain(page, { runs: linearChain(3), current: () => 'run-03' });

    await page.goto(runPath('run-02'));

    await expect(
      heading(page).getByRole('heading', { level: 2, name: 'Run run-02' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Timeline' })).toHaveCount(
      0,
    );
  });

  test('shows Next and Latest from the first Run', async ({ page }) => {
    await mockChain(page, { runs: linearChain(3), current: () => 'run-03' });

    await page.goto(runPath('run-01'));

    await expect(navigationLinks(page)).toHaveText(['Next', 'Latest']);
    await expect(navigationLink(page, 'Next')).toHaveAttribute(
      'href',
      timelineOf('run-02'),
    );
    await expect(navigationLink(page, 'Latest')).toHaveAttribute(
      'href',
      timelineOf('run-03'),
    );
  });

  test('shows every link from a mid-chain Run', async ({ page }) => {
    await mockChain(page, { runs: linearChain(3), current: () => 'run-03' });

    await page.goto(runPath('run-02'));

    await expect(navigationLinks(page)).toHaveText([
      'Previous',
      'Next',
      'Latest',
    ]);
    await expect(navigationLink(page, 'Previous')).toHaveAttribute(
      'href',
      timelineOf('run-01'),
    );
    await expect(navigationLink(page, 'Next')).toHaveAttribute(
      'href',
      timelineOf('run-03'),
    );
    await expect(navigationLink(page, 'Latest')).toHaveAttribute(
      'href',
      timelineOf('run-03'),
    );
  });

  test('shows only Previous on the open Latest Run', async ({ page }) => {
    await mockChain(page, {
      runs: linearChain(3, { open: true }),
      current: () => 'run-03',
    });

    await page.goto(runPath('run-03'));

    await expect(navigationLinks(page)).toHaveText(['Previous']);
    await expect(navigationLink(page, 'Previous')).toHaveAttribute(
      'href',
      timelineOf('run-02'),
    );
  });

  test('hides Latest when the Workflow ID was reused', async ({ page }) => {
    const runs: MockRun[] = [
      ...linearChain(2),
      {
        runId: 'run-new',
        firstRunId: 'run-new',
        activity: 'WorkNew',
        startTime: '2024-01-02T00:00:00.000Z',
        open: true,
      },
    ];
    await mockChain(page, { runs, current: () => 'run-new' });

    await page.goto(runPath('run-01'));

    await expect(
      heading(page).getByRole('link', { name: 'View Execution Chain' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(navigationLinks(page)).toHaveText(['Next']);
  });

  test('has no Run navigation for a single-Run Workflow', async ({ page }) => {
    await mockChain(page, { runs: linearChain(1), current: () => 'run-01' });

    await page.goto(runPath('run-01'));

    await expect(
      heading(page).getByRole('heading', { name: 'Run run-01' }),
    ).toBeVisible();
    await expect(navigation(page)).toHaveCount(0);
    await expect(
      heading(page).getByRole('link', { name: 'View Execution Chain' }),
    ).toHaveCount(0);
  });

  test('keeps the Timeline tab and filter params when navigating', async ({
    page,
  }) => {
    await mockChain(page, { runs: linearChain(3), current: () => 'run-03' });

    await page.goto(`${runPath('run-02')}?status=pending&sort=ascending`);
    await navigationLink(page, 'Next').click();

    await expect(page).toHaveURL(
      new RegExp('/run-03/timeline\\?.*status=pending'),
    );
    await expect(page).toHaveURL(/sort=ascending/);
    await expect(
      heading(page).getByRole('heading', { name: 'Run run-03' }),
    ).toBeVisible();
  });

  test('wraps the navigation below the title at narrow widths', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockChain(page, { runs: linearChain(3), current: () => 'run-03' });

    await page.goto(runPath('run-02'));

    const title = heading(page).getByRole('heading', { name: 'Run run-02' });
    await expect(navigation(page)).toBeVisible();
    const titleBox = await title.boundingBox();
    const navigationBox = await navigation(page).boundingBox();
    expect(navigationBox!.y).toBeGreaterThanOrEqual(
      titleBox!.y + titleBox!.height,
    );
  });

  test('scrolls away while the controls row stays sticky', async ({ page }) => {
    const { width } = page.viewportSize() ?? { width: 1280 };
    await page.setViewportSize({ width, height: 600 });
    await mockEventHistoryApi(page, {
      history: { events: makeSyntheticEvents(300) },
      nextPageToken: null,
    });
    const { runId } = mockWorkflow.workflowExecutionInfo.execution;
    const { workflowId: mockWorkflowId } =
      mockWorkflow.workflowExecutionInfo.execution;

    await page.goto(
      `/namespaces/default/workflows/${mockWorkflowId}/${runId}/timeline`,
    );
    await expect(heading(page)).toBeVisible();

    const filter = page.locator('button[aria-controls="event-type-filter"]');
    await filter.evaluate((element) => {
      const scrolls = (candidate: HTMLElement) =>
        candidate.scrollHeight > candidate.clientHeight &&
        /auto|scroll/.test(getComputedStyle(candidate).overflowY);
      let container = element.parentElement;
      while (container && !scrolls(container)) {
        container = container.parentElement;
      }
      (container ?? document.scrollingElement)?.scrollBy(0, 3000);
    });

    await expect(heading(page)).not.toBeInViewport();
    await expect(filter).toBeInViewport();
  });

  test('marks counts as partial while history pages load', async ({ page }) => {
    const run = linearChain(1)[0];
    await mockChain(page, { runs: [run], current: () => run.runId });
    const started = {
      ...makeWorkflowStarted(1),
      eventTime: run.startTime,
    } as HistoryEvent;
    const never = new Promise<void>(() => {});
    await page.route(EVENT_HISTORY_API, async (route) => {
      const url = new URL(route.request().url());
      if (url.searchParams.get('nextPageToken')) {
        await never;
      }
      return route.fulfill({
        json: historyPage(
          [
            started,
            makeActivityScheduled(2, 'FirstActivity'),
            makeActivityStarted(3, 2),
            makeActivityCompleted(4, 2, 3),
          ],
          'ascending-page-2',
        ),
      });
    });
    await page.route(EVENT_HISTORY_API_REVERSE, async (route) => {
      const url = new URL(route.request().url());
      if (url.searchParams.get('nextPageToken')) {
        await never;
      }
      return route.fulfill({
        json: historyPage(
          [makeActivityCompleted(9, 7, 8)],
          'descending-page-2',
        ),
      });
    });

    await page.goto(runPath(run.runId));

    await expect(heading(page)).toContainText('1+ succeeded');
  });
});
