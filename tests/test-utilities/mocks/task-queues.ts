import type { Page } from '@playwright/test';

export const TASK_QUEUES_API =
  /\/api\/v1\/namespaces\/[^/]+\/task-queues\/[^/]+\?.*$/;

const mockTaskQueues = {
  pollers: [
    {
      lastAccessTime: '2022-05-05T21:42:46.576609378Z',
      identity: '@poller',
      ratePerSecond: 100000,
    },
  ],
  taskQueueStatus: null,
};

export const mockTaskQueuesApi = (page: Page) => {
  return page.route(TASK_QUEUES_API, (route) => {
    return route.fulfill({ json: mockTaskQueues });
  });
};
