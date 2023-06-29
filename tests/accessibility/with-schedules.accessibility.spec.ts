import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setLocalStorage } from '$utilities/mock-local-storage';

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
    test.fixme(
      `${title} page (${url}) should not have any automatically detectable accessibility issues`,
      async ({ page }) => {
        await page.goto(url);
        await page.waitForRequest('**/api/v1/**');

        const accessibilityScanResults = await new AxeBuilder({
          page,
        }).analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      },
    );
  }
});
