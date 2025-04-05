import type { Page } from '@playwright/test';

export const WORKFLOWS_COUNT_API = '**/api/v1/namespaces/*/workflow-count?*';

export const mockWorkflowsCountApi = (page: Page) => {
  return page.route(WORKFLOWS_COUNT_API, (route) => {
    return route.fulfill({ json: { count: '15' } });
  });
};

const groupByCountResponse = {
  count: '31230',
  groups: [
    {
      groupValues: [
        {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'S2V5d29yZA==',
          },
          data: 'IlJ1bm5pbmci',
        },
      ],
      count: '6',
    },
    {
      groupValues: [
        {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'S2V5d29yZA==',
          },
          data: 'IkNvbXBsZXRlZCI=',
        },
      ],
      count: '21652',
    },
    {
      groupValues: [
        {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'S2V5d29yZA==',
          },
          data: 'IkZhaWxlZCI=',
        },
      ],
      count: '1932',
    },
    {
      groupValues: [
        {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'S2V5d29yZA==',
          },
          data: 'IkNhbmNlbGVkIg==',
        },
      ],
      count: '6215',
    },
    {
      groupValues: [
        {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'S2V5d29yZA==',
          },
          data: 'IlRlcm1pbmF0ZWQi',
        },
      ],
      count: '917',
    },
    {
      groupValues: [
        {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'S2V5d29yZA==',
          },
          data: 'IlRpbWVkT3V0Ig==',
        },
      ],
      count: '508',
    },
  ],
};

export const mockWorkflowsGroupByCountApi = (page: Page) => {
  return page.route(WORKFLOWS_COUNT_API, (route) => {
    return route.fulfill({ json: groupByCountResponse });
  });
};
