import type { Page } from '@playwright/test';

export const mockWorkflowsApi = (page: Page) => {
  return page.route('**/api/v1/namespaces/*/workflows*', (route) => {
    return route.fulfill({ json: { workflows: [] } });
  });
};
