import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { attachViolations } from '~/test-utilities/attach-violations';
import { mockScheduleApi, mockSchedulesApis } from '~/test-utilities/mock-apis';

test.beforeEach(async ({ page }) => {
  await mockSchedulesApis(page);
  await mockScheduleApi(page);
});

type AccessibilityRoute = {
  title: string;
  url: string;
  ready: (page: Page) => Locator;
};

const pages: AccessibilityRoute[] = [
  {
    title: 'Schedules',
    url: '/namespaces/default/schedules',
    ready: (page) => page.getByRole('table', { name: 'Schedules' }),
  },
  {
    title: 'View Schedule',
    url: '/namespaces/default/schedules/Scheduled%20Workflow',
    ready: (page) => page.getByTestId('schedule-name'),
  },
];

test.describe('Accessibility: With Schedules', () => {
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
