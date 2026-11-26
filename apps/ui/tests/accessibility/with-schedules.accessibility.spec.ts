import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { attachViolations } from '~/test-utilities/attach-violations';

test.beforeEach(async ({ page }) => {
  await page.routeFromHAR(
    './tests/accessibility/network-requests/with-schedules.har',
    {
      updateMode: 'minimal',
      update: false,
      updateContent: 'embed',
      notFound: 'fallback',
      url: '**/api/v1/**',
    },
  );
});

const pages = [
  { title: 'Schedules', url: '/namespaces/default/schedules' },
  {
    title: 'View Schedule',
    url: '/namespaces/default/schedules/Scheduled%20Workflow',
  },
];

test.describe('Accessibility: With Schedules', () => {
  for (const { title, url } of pages) {
    test(`${title} page (${url}) should not have any automatically detectable accessibility issues`, async ({
      page,
    }, testInfo) => {
      await page.goto(url);
      await page.waitForRequest('**/api/v1/**');
      await page.locator('#content').waitFor({ state: 'visible' });

      const accessibilityScanResults = await new AxeBuilder({
        page,
      }).analyze();

      await attachViolations(testInfo, accessibilityScanResults, page);

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
