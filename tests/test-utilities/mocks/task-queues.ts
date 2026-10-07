import type { Page } from '@playwright/test';

export const TASK_QUEUES_API =
  /\/api\/v1\/namespaces\/[^/]+\/task-queues\/[^/]+\?.*$/;

// Pollers older than ACTIVE_POLLER_WINDOW_MS count as gone, so the mock
// stamps its poller at response time to stay live.
const mockTaskQueues = () => ({
  pollers: [
    {
      lastAccessTime: new Date().toISOString(),
      identity: '@poller',
      ratePerSecond: 100000,
    },
  ],
  taskQueueStatus: null,
});

const mockEmptyTaskQueues = {
  pollers: [],
  taskQueueStatus: null,
};

export const mockTaskQueuesApi = (page: Page, empty = false) => {
  return page.route(TASK_QUEUES_API, (route) => {
    return route.fulfill({
      json: empty ? mockEmptyTaskQueues : mockTaskQueues(),
    });
  });
};
