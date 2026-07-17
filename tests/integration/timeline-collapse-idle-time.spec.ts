import { expect, type Page, test } from '@playwright/test';

import completedEvents from '~/fixtures/completed-event-history.json' with { type: 'json' };
import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const timelineUrl = `/namespaces/default/workflows/${workflowId}/${runId}/timeline`;

// A running workflow whose work finished long before "now" leaves large idle
// gaps around its single short activity, which the timeline can collapse. The
// default mock keeps an activity pending so its span fills the timeline and
// nothing is collapsible — that drives the disabled-state test.
const events = Object.values(completedEvents);
const idleHistory = {
  history: { events },
  rawHistory: [],
  nextPageToken: null,
  archived: false,
};
const runningWorkflow = {
  ...mockWorkflow,
  pendingActivities: [],
  pendingChildren: [],
};

const mockIdleTimeline = async (page: Page) => {
  await mockWorkflowApis(page, runningWorkflow);
  await page.route(EVENT_HISTORY_API, (route) =>
    route.fulfill({ json: idleHistory }),
  );
  await page.route(EVENT_HISTORY_API_REVERSE, (route) =>
    route.fulfill({
      json: { ...idleHistory, history: { events: [...events].reverse() } },
    }),
  );
};

test.describe('Timeline collapse idle time', () => {
  test.describe('with collapsible idle gaps', () => {
    test.beforeEach(async ({ page }) => {
      await mockIdleTimeline(page);
      await page.goto(timelineUrl);
    });

    test('collapses idle time by default and offers to expand it', async ({
      page,
    }) => {
      const toggle = page.getByTestId('toggle-idle-time');
      await expect(toggle).toBeEnabled();
      await expect(toggle).toContainText('Show idle time');
    });

    test('expands and re-collapses idle time from the header toggle', async ({
      page,
    }) => {
      const toggle = page.getByTestId('toggle-idle-time');

      await toggle.click();
      await expect(toggle).toContainText('Hide idle time');

      await toggle.click();
      await expect(toggle).toContainText('Show idle time');
    });

    test('exposes an accessible per-segment toggle reflecting pressed state', async ({
      page,
    }) => {
      const handle = page.getByRole('button', { name: /time segment/ }).first();

      // Collapsed by default -> pressed.
      await expect(handle).toHaveAttribute('aria-pressed', 'true');

      await handle.click();
      await expect(handle).toHaveAttribute('aria-pressed', 'false');

      await handle.click();
      await expect(handle).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test.describe('without collapsible idle gaps', () => {
    test.beforeEach(async ({ page }) => {
      await mockWorkflowApis(page);
      await page.goto(timelineUrl);
    });

    test('disables the idle-time toggle when nothing is collapsible', async ({
      page,
    }) => {
      await expect(page.getByTestId('toggle-idle-time')).toBeDisabled();
    });
  });
});
