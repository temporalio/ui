import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { attachViolations } from '~/test-utilities/attach-violations';
import {
  mockGlobalApis,
  mockNamespaceApi,
  mockSchedulesCountApi,
  mockSearchAttributesApi,
  mockWorkflowsCountApi,
  WORKFLOWS_API,
} from '~/test-utilities/mock-apis';
import { mockSchedulesApi } from '~/test-utilities/mocks/schedules';

test.beforeEach(async ({ page }) => {
  await Promise.all([
    mockGlobalApis(page),
    mockNamespaceApi(page),
    mockSchedulesApi(page, true),
    mockSchedulesCountApi(page, true),
    mockSearchAttributesApi(page),
    mockWorkflowsCountApi(page, true),
  ]);
  await page.route(WORKFLOWS_API, (route) =>
    route.fulfill({
      json: { executions: [], nextPageToken: null },
    }),
  );
  await page.route(
    /\/api\/v1\/namespaces\/[^/]+\/archived-workflows/,
    (route) =>
      route.fulfill({
        json: { executions: [], nextPageToken: null },
      }),
  );
});

type AccessibilityRoute = {
  title: string;
  url: string;
  ready: (page: Page) => Locator;
};

const pages: AccessibilityRoute[] = [
  {
    title: 'Namespaces',
    url: '/namespaces',
    ready: (page) => page.getByRole('table', { name: 'Namespaces' }),
  },
  {
    title: 'Select Namespace',
    url: '/select-namespace',
    ready: (page) => page.locator('#namespace-switcher'),
  },
  {
    title: 'Namespace',
    url: '/namespaces/default',
    ready: (page) => page.getByTestId('namespace-retention'),
  },
  {
    title: 'Workflow List',
    url: '/namespaces/default/workflows',
    ready: (page) => page.getByRole('table', { name: 'Workflows' }),
  },
  {
    title: 'Schedules',
    url: '/namespaces/default/schedules',
    ready: (page) => page.getByRole('table', { name: 'Schedules' }),
  },
  {
    title: 'Create Schedule',
    url: '/namespaces/default/schedules/create',
    ready: (page) => page.getByTestId('schedule-name-input'),
  },
  {
    title: 'Archived Workflows',
    url: '/namespaces/default/archival',
    ready: (page) => page.getByTestId('archived-disabled-title'),
  },
  {
    title: 'Event Import',
    url: '/import/events',
    ready: (page) => page.getByTestId('import-event-history'),
  },
];

test.describe('Accessibility: Empty States', () => {
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
