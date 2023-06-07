import type { Page } from '@playwright/test';

export const WORKFLOWS_API =
  'http://localhost:8233/api/v1/namespaces/*/workflows?query=';

export const mockWorkflowsApi = (page: Page) => {
  return page.route(WORKFLOWS_API, (route) => {
    return route.fulfill({ json: { workflows: [] } });
  });
};
