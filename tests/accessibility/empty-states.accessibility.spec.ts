import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setLocalStorage } from '$utilities/mock-local-storage';

test.beforeEach(async ({ page }) => {
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);
});

test.beforeEach(async ({ page }) => {
  await page.routeFromHAR(
    './tests/accessibility/network-requests/empty-states.har',
    {
      updateMode: 'full',
      update: true,
      updateContent: 'embed',
      notFound: 'fallback',
      url: '**/api/v1/**',
    },
  );
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);
});

const pages = [
  { title: 'Namespaces', url: '/namespaces' },
  { title: 'Select Namespace', url: '/select-namespace' },
  { title: 'Namespace', url: '/namespaces/default' },
  { title: 'Workflow List', url: '/namespaces/default/workflows' },
  { title: 'Schedules', url: '/namespaces/default/schedules' },
  { title: 'Create Schedule', url: '/namespaces/default/schedules/new' },
  {
    title: 'Archived Workflows',
    url: '/namespaces/default/archived-workflows',
  },
  { title: 'Event Import', url: 'import/events' },
];

test.describe('Accessibility: Empty States', () => {
  for (const { title, url } of pages) {
    test.fixme(
      `${title} page (${url}) should not have any automatically detectable accessibility issues`,
      async ({ page }) => {
        await page.goto(url, { waitUntil: 'networkidle' });

        const accessibilityScanResults = await new AxeBuilder({
          page,
        }).analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      },
    );
  }
});
