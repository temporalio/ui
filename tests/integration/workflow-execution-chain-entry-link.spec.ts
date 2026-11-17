import { expect, type Page, test } from '@playwright/test';

import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import {
  chainUrl,
  deferred,
  linearChain,
  mockChain,
  type MockRun,
  workflowId,
} from '~/test-utilities/mocks/workflow-execution-chain';

const runUrl = (runId: string) =>
  `/namespaces/default/workflows/${workflowId}/${runId}/timeline`;

const chainLink = (page: Page) =>
  page.getByRole('link', { name: 'View execution chain' });

const historyWithActivity = (page: Page, activity: string) =>
  page.waitForResponse(async (response) => {
    const url = response.url();
    if (!EVENT_HISTORY_API.test(url) && !EVENT_HISTORY_API_REVERSE.test(url)) {
      return false;
    }
    const body = await response.json().catch(() => null);
    return JSON.stringify(body?.history?.events ?? []).includes(activity);
  });

test.describe('Run page link to the execution chain', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowApis(page);
  });

  test('is hidden for a single open first Run', async ({ page }) => {
    const runs: MockRun[] = [
      {
        runId: 'run-a',
        firstRunId: 'run-a',
        activity: 'WorkA',
        startTime: '2024-01-01T00:00:00.000Z',
        open: true,
      },
    ];
    await mockChain(page, { runs, current: () => 'run-a' });

    const historyLoaded = historyWithActivity(page, 'WorkA');
    await page.goto(runUrl('run-a'));

    await historyLoaded;
    await expect(chainLink(page)).toHaveCount(0);
  });

  test('is shown with a predecessor and links to the first Run', async ({
    page,
  }) => {
    await mockChain(page, {
      runs: linearChain(3),
      current: () => 'run-03',
    });

    await page.goto(runUrl('run-03'));

    await expect(chainLink(page)).toHaveAttribute('href', chainUrl('run-01'));
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
    await mockChain(page, { runs, current: () => 'run-a' });

    const historyLoaded = historyWithActivity(page, 'WorkA');
    await page.goto(runUrl('run-a'));

    await historyLoaded;
    await expect(chainLink(page)).toHaveCount(0);

    handOff.resolve();

    await expect(chainLink(page)).toHaveAttribute('href', chainUrl('run-a'));
  });
});
