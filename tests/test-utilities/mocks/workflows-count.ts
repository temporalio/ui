import type { Page } from '@playwright/test';

export const WORKFLOWS_COUNT_API = '**/api/v1/namespaces/*/workflows/count?*';

export const mockWorkflowsCountApi = (page: Page) => {
  return page.route(WORKFLOWS_COUNT_API, (route) => {
    return route.fulfill({ json: { count: '10' } });
  });
};
