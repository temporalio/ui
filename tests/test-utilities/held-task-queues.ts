import type { Page } from '@playwright/test';

import { TASK_QUEUES_API } from './mock-apis';

const SLOW_QUEUE = '/task-queues/slow-queue';

// Holds every response for slow-queue until release() is called, so a test
// can make an earlier check finish after a later one. A held request that the
// page aborts cannot be fulfilled, so that failure is ignored.
export const heldTaskQueues = async (page: Page) => {
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route(TASK_QUEUES_API, async (route) => {
    if (route.request().url().includes(SLOW_QUEUE)) {
      await released;
      return route
        .fulfill({
          json: { pollers: [{ identity: 'worker' }], taskQueueStatus: null },
        })
        .catch(() => {});
    }
    return route.fulfill({ json: { pollers: [], taskQueueStatus: null } });
  });

  return release;
};

export const slowQueueAborted = (page: Page) =>
  page.waitForEvent('requestfailed', (request) =>
    request.url().includes(SLOW_QUEUE),
  );

export const nextFrames = (page: Page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
