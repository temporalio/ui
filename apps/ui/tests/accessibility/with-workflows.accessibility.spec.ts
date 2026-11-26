import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { attachViolations } from '~/test-utilities/attach-violations';

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
    title: 'Call Stack',
    url: workflowId + '/call-stack',
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
