import type { Page } from '@playwright/test';

export const SCHEDULES_COUNT_API =
  /\/api\/v1\/namespaces\/[^/]+\/schedule-count(\?.*)?$/;

export const mockSchedulesCountApi = (page: Page, empty = false) => {
  return page.route(SCHEDULES_COUNT_API, (route) => {
    return route.fulfill({ json: { count: empty ? '0' : '15' } });
  });
};
