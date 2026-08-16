import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { attachViolations } from '~/test-utilities/attach-violations';
import {
  mockWorkersApi,
  mockWorkflowApis,
  mockWorkflowsApis,
} from '~/test-utilities/mock-apis';

test.beforeEach(async ({ page }) => {
  await mockWorkflowsApis(page);
  await mockWorkflowApis(page);
  await mockWorkersApi(page);
  await page.route(
    /\/api\/v1\/namespaces\/[^/]+\/workflows\/[^/]+\/query\/[^/?]+/,
    (route) => {
      const queryType = decodeURIComponent(
        new URL(route.request().url()).pathname.split('/').at(-1) ?? '',
      );
      const data =
        queryType === '__stack_trace'
          ? 'Im1vY2sgc3RhY2sgdHJhY2Ui'
          : 'eyJjdXJyZW50RGV0YWlscyI6IlJlYWR5IiwiZGVmaW5pdGlvbiI6eyJxdWVyeURlZmluaXRpb25zIjpbeyJuYW1lIjoic3RhdHVzIiwiZGVzY3JpcHRpb24iOiJDdXJyZW50IHdvcmtmbG93IHN0YXR1cyJ9XX19';

      return route.fulfill({
        json: {
          queryRejected: null,
          queryResult: {
            payloads: [
              {
                data,
                metadata: { encoding: 'anNvbi9wbGFpbg==' },
              },
            ],
          },
        },
      });
    },
  );
});

const workflowId =
  '/namespaces/default/workflows/Running-PGlmzINUdHKb_MRK9uhf5/bab2d175-4dc5-476e-b6c7-aa3d98ae73d5';

type AccessibilityRoute = {
  title: string;
  url: string;
  ready: (page: Page) => Locator;
};

const pages: AccessibilityRoute[] = [
  {
    title: 'Workflow List',
    url: '/namespaces/default/workflows',
    ready: (page) =>
      page.getByTestId('workflows-summary-configurable-table-row').first(),
  },
  {
    title: 'Workflow Details',
    url: workflowId + '/history',
    ready: (page) => page.getByTestId('event-summary-row').first(),
  },
  {
    title: 'Pending Activities',
    url: workflowId + '/pending-activities',
    ready: (page) => page.getByText('No Pending Activities', { exact: true }),
  },
  {
    title: 'Call Stack',
    url: workflowId + '/call-stack',
    ready: (page) => page.getByTestId('query-call-stack'),
  },
  {
    title: 'Query',
    url: workflowId + '/query',
    ready: (page) => page.getByTestId('query-select'),
  },
  {
    title: 'Workers',
    url: workflowId + '/workers',
    ready: (page) => page.getByRole('table', { name: 'Workers' }),
  },
];

test.describe('Accessibility: With Workflows', () => {
  for (const { title, url, ready } of pages) {
    test(`${title} page (${url}) should not have any automatically detectable accessibility issues`, async ({
      page,
    }, testInfo) => {
      await page.goto(url);
      await ready(page).waitFor({ state: 'visible' });
      await page.evaluate(() => document.fonts.ready);

      const accessibilityScanResults = await new AxeBuilder({
        page,
      }).analyze();

      await attachViolations(testInfo, accessibilityScanResults, page);

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
