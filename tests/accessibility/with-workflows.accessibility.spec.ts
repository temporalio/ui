import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setLocalStorage } from '$utilities/mock-local-storage';

test.beforeEach(async ({ page }) => {
  await page.routeFromHAR(
    './tests/accessibility/network-requests/with-workflows.har',
    {
      updateMode: 'minimal',
      update: false,
      updateContent: 'embed',
      notFound: 'fallback',
      url: '**/api/v1/**',
    },
  );
});

const workflowId =
  '/namespaces/default/workflows/Running-PGlmzINUdHKb_MRK9uhf5/bab2d175-4dc5-476e-b6c7-aa3d98ae73d5';

const pages = [
  { title: 'Workflow List', url: '/namespaces/default/workflows' },
  {
    title: 'Workflow Details',
    url: workflowId + '/history',
  },
  {
    title: 'Pending Activities',
    url: workflowId + '/pending-activities',
  },
  {
    title: 'Stack Trace',
    url: workflowId + '/stack-trace',
  },
  {
    title: 'Query',
    url: workflowId + '/query',
  },
  {
    title: 'Workers',
    url: workflowId + '/workers',
  },
];

test.describe('Accessibility: With Workflows', () => {
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
