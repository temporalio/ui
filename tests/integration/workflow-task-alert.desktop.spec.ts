import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

import type { GetWorkflowExecutionHistoryResponse } from '$src/lib/types/events';
import type { WorkflowExecutionAPIResponse } from '$src/lib/types/workflows';
import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const workflowBaseUrl = `/namespaces/default/workflows/${workflowId}/${runId}`;

const eventTime = '2026-08-17T01:20:45.560Z';
const longFrame = `at VisibilityStore.validate (visibility-store://${'x'.repeat(
  240,
)}:1:1)`;

const messages = [
  'Workflow task failed while applying search attributes',
  'UpdateWorkflow failed validation',
  'CustomDatetimeField has no mapping',
] as const;
const sources = [
  'TypeScriptSDK',
  'WorkflowRuntime',
  'VisibilityStore',
] as const;
const traces = [
  'at applySearchAttributes (workflow.ts:48:12)',
  'at validateUpdate (commands.ts:92:7)',
  longFrame,
] as const;

const failedEvents = [
  {
    eventId: '1',
    eventTime: '2026-08-17T01:20:44.000Z',
    eventType: 'WorkflowExecutionStarted',
    workflowExecutionStartedEventAttributes: {
      workflowType: { name: 'SearchAttributeWorkflow' },
      taskQueue: { name: 'diagnostics', kind: 'Normal' },
      input: null,
      workflowExecutionTimeout: '0s',
      workflowRunTimeout: '0s',
      workflowTaskTimeout: '10s',
      identity: 'test-worker',
    },
  },
  {
    eventId: '2',
    eventTime: '2026-08-17T01:20:45.000Z',
    eventType: 'WorkflowTaskScheduled',
    workflowTaskScheduledEventAttributes: {
      taskQueue: { name: 'diagnostics', kind: 'Normal' },
      startToCloseTimeout: '10s',
      attempt: 3,
    },
  },
  {
    eventId: '3',
    eventTime: '2026-08-17T01:20:45.250Z',
    eventType: 'WorkflowTaskStarted',
    workflowTaskStartedEventAttributes: {
      scheduledEventId: '2',
      identity: 'test-worker',
      requestId: 'diagnostic-request',
    },
  },
  {
    eventId: '4',
    eventTime,
    eventType: 'WorkflowTaskFailed',
    workflowTaskFailedEventAttributes: {
      scheduledEventId: '2',
      startedEventId: '3',
      cause: 'BadSearchAttributes',
      identity: 'test-worker',
      failure: {
        message: messages[0],
        source: sources[0],
        stackTrace: traces[0],
        cause: {
          message: messages[1],
          source: sources[1],
          stackTrace: traces[1],
          cause: {
            message: messages[2],
            source: sources[2],
            stackTrace: traces[2],
          },
        },
      },
    },
  },
] satisfies NonNullable<
  GetWorkflowExecutionHistoryResponse['history']
>['events'];

const timedOutEvents = [
  ...failedEvents.slice(0, -1),
  {
    eventId: '4',
    eventTime,
    eventType: 'WorkflowTaskTimedOut',
    workflowTaskTimedOutEventAttributes: {
      scheduledEventId: '2',
      startedEventId: '3',
      timeoutType: 'StartToClose',
    },
  },
] satisfies NonNullable<
  GetWorkflowExecutionHistoryResponse['history']
>['events'];

const workflowWithPendingTask = {
  ...mockWorkflow,
  pendingActivities: [],
  pendingChildren: [],
  pendingWorkflowTask: {
    state: 'PENDING_WORKFLOW_TASK_STATE_STARTED',
    attempt: 3,
    originalScheduledTime: '2026-08-17T01:20:44.500Z',
    scheduledTime: '2026-08-17T01:20:45.000Z',
    startedTime: '2026-08-17T01:20:45.250Z',
  },
} as unknown as WorkflowExecutionAPIResponse;

const historyPage = (
  events: NonNullable<GetWorkflowExecutionHistoryResponse['history']>['events'],
): GetWorkflowExecutionHistoryResponse => ({
  history: { events },
  rawHistory: [],
  nextPageToken: null,
  archived: false,
});

const mockWorkflowTaskAlert = async (page: Page, events = failedEvents) => {
  await mockWorkflowApis(page, workflowWithPendingTask);
  await page.route(EVENT_HISTORY_API, (route) => {
    if (route.request().url().includes('waitNewEvent=true')) {
      return route.fulfill({ json: historyPage([]) });
    }
    return route.fulfill({ json: historyPage(events) });
  });
  await page.route(EVENT_HISTORY_API_REVERSE, (route) =>
    route.fulfill({ json: historyPage([...events].reverse()) }),
  );
};

const expectLabelAndValue = async (
  details: ReturnType<Page['locator']>,
  label: string,
  value?: string,
) => {
  const term = details.locator('dt').getByText(label, { exact: true });
  await expect(term).toHaveCount(1);
  const description = term.locator('..').locator('dd');
  await expect(description).toHaveCount(1);
  if (value) await expect(description).toContainText(value);
  else await expect(description).not.toBeEmpty();
};

const routes = [
  { label: 'History', url: `${workflowBaseUrl}/history` },
  { label: 'Timeline', url: `${workflowBaseUrl}/timeline` },
] as const;

for (const route of routes) {
  test.describe(`${route.label} Workflow Task alert`, () => {
    test.beforeEach(async ({ page }) => {
      await mockWorkflowTaskAlert(page);
    });

    test('shows one cause-first diagnostic without nested disclosure UI', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route.url);

      const alert = page.getByTestId('workflow-task-alert');
      await expect(alert).toHaveCount(1);
      await expect(
        alert.getByRole('heading', { name: 'Bad Search Attributes' }),
      ).toBeVisible();
      await expect(alert).toContainText('Workflow Task Failed');
      await expect(alert).toContainText('Event 4');
      await expect(alert).toContainText('Aug 16, 2026');

      const liveSummary = alert.getByRole('status');
      await expect(liveSummary).toContainText('Bad Search Attributes');
      await expect(liveSummary).not.toContainText(messages[0]);

      const diagnostic = alert.getByLabel('Failure diagnostic', {
        exact: true,
      });
      await expect(diagnostic).toBeVisible();
      await expect(diagnostic).toHaveCount(1);

      const diagnosticText = (await diagnostic.textContent()) ?? '';
      for (const content of [...messages, ...traces]) {
        await expect(
          diagnostic.locator('.cm-line').getByText(content, { exact: true }),
        ).toHaveCount(1);
      }
      for (const source of sources) {
        await expect(
          diagnostic
            .locator('.cm-line')
            .getByText(`Source: ${source}`, { exact: true }),
        ).toHaveCount(1);
      }

      for (const orderedContent of [messages, sources, traces]) {
        for (let index = 1; index < orderedContent.length; index += 1) {
          expect(diagnosticText.indexOf(orderedContent[index])).toBeGreaterThan(
            diagnosticText.indexOf(orderedContent[index - 1]),
          );
        }
      }

      await expect(alert.locator('[aria-expanded]')).toHaveCount(0);
      await expect(
        alert.getByRole('button', { name: 'Failure', exact: true }),
      ).toHaveCount(0);
      await expect(
        alert.getByRole('button', {
          name: 'Pending Workflow Task',
          exact: true,
        }),
      ).toHaveCount(0);

      const details = alert.locator(
        'dl[aria-label="Workflow task failure details"]',
      );
      await expect(details).toHaveCount(1);
      await expectLabelAndValue(details, 'State', 'Started');
      await expectLabelAndValue(details, 'Attempt', '3');
      await expectLabelAndValue(details, 'Original Scheduled Time');
      await expectLabelAndValue(details, 'Scheduled Time');
      await expectLabelAndValue(details, 'Started Time');
      await expect(
        details.locator(
          '[class~="rounded-control"][class~="px-1.5"][class~="py-0.5"]',
        ),
      ).toHaveCount(0);

      const accessibilityScan = await new AxeBuilder({ page })
        .include('[data-testid="workflow-task-alert"]')
        .analyze();
      expect(accessibilityScan.violations).toEqual([]);
    });

    for (const width of [375, 768, 1440]) {
      test(`contains long diagnostic frames at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route.url);

        const alert = page.getByTestId('workflow-task-alert');
        await expect(alert).toBeVisible();
        await expect(alert.getByLabel('Failure diagnostic')).toContainText(
          longFrame,
        );

        const bounds = await alert.evaluate((element) => {
          const box = element.getBoundingClientRect();
          return {
            left: box.left,
            right: box.right,
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
            viewportWidth: document.documentElement.clientWidth,
          };
        });

        expect(bounds.left).toBeGreaterThanOrEqual(-1);
        expect(bounds.right).toBeLessThanOrEqual(bounds.viewportWidth + 1);
        expect(bounds.scrollWidth - bounds.clientWidth).toBeLessThanOrEqual(1);
      });
    }
  });
}

test('timed-out tasks show timeout details without an empty diagnostic', async ({
  page,
}) => {
  await mockWorkflowTaskAlert(page, timedOutEvents);
  await page.goto(`${workflowBaseUrl}/history`);

  const alert = page.getByTestId('workflow-task-alert');
  await expect(
    alert.getByRole('heading', { name: 'Workflow Task Timed Out' }),
  ).toBeVisible();
  await expect(alert.getByLabel('Failure diagnostic')).toHaveCount(0);

  const timeoutDetails = alert
    .locator('dl')
    .filter({ hasText: 'Timeout Type' });
  await expectLabelAndValue(timeoutDetails, 'Timeout Type', 'StartToClose');
});
