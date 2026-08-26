import { expect, test } from '@playwright/test';

import {
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
const timelineUrl = `/namespaces/default/workflows/${workflowId}/${runId}/timeline`;

const summary = {
  metadata: {
    encoding: 'anNvbi9wbGFpbg==',
    type: 'VGV4dA==',
  },
  data: 'IlRpbWVsaW5lIHN1bW1hcnki',
};
const activityScheduled = {
  ...makeActivityScheduled(2, 'SummarizedActivity'),
  userMetadata: { summary },
};
const events = [
  makeWorkflowStarted(1),
  activityScheduled,
  makeActivityStarted(3, 2),
];
const historyPage = (historyEvents: typeof events) => ({
  history: { events: historyEvents },
  rawHistory: [],
  nextPageToken: null,
  archived: false,
});
const runningWorkflow = {
  ...mockWorkflow,
  pendingActivities: [],
  pendingChildren: [],
};

test('keeps a timeline summary iframe hidden and zero-sized until it loads', async ({
  page,
}) => {
  await mockWorkflowApis(page, runningWorkflow);
  await page.route(EVENT_HISTORY_API, (route) =>
    route.fulfill({ json: historyPage(events) }),
  );
  await page.route(EVENT_HISTORY_API_REVERSE, (route) =>
    route.fulfill({ json: historyPage([...events].reverse()) }),
  );

  let releaseRender!: () => void;
  const renderHeld = new Promise<void>((resolve) => {
    releaseRender = resolve;
  });
  await page.route('**/render?**', async (route) => {
    await renderHeld;
    await route.fulfill({
      contentType: 'text/html',
      body: '<html><body><main>Timeline summary</main></body></html>',
    });
  });

  await page.goto(timelineUrl, { waitUntil: 'domcontentloaded' });

  const iframe = page.locator('iframe[src*="inline=true"]').first();
  await expect(iframe).toBeAttached();
  await expect(iframe).toHaveCSS('visibility', 'hidden');
  await expect
    .poll(() =>
      iframe.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { height: rect.height, width: rect.width };
      }),
    )
    .toEqual({ height: 0, width: 0 });

  releaseRender();

  await expect(iframe).toBeVisible();
  await expect
    .poll(() =>
      iframe.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.height > 0 && rect.width > 0;
      }),
    )
    .toBe(true);
});
