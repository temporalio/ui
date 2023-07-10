import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.routeFromHAR(
    './tests/accessibility/network-requests/empty-states.har',
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
  { title: 'Namespaces', url: '/namespaces' },
  { title: 'Select Namespace', url: '/select-namespace' },
  { title: 'Namespace', url: '/namespaces/default' },
  { title: 'Workflow List', url: '/namespaces/default/workflows' },
  { title: 'Schedules', url: '/namespaces/default/schedules' },
  { title: 'Create Schedule', url: '/namespaces/default/schedules/create' },
  {
    title: 'Archived Workflows',
    url: 'namespaces/default/archival',
  },
  { title: 'Event Import', url: 'import/events' },
];

test.describe('Accessibility: Empty States', () => {
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
