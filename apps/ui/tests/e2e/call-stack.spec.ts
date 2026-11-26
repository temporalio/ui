import { expect, test } from '@playwright/test';

import mockQueryApiWithStackTraceError from '~/test-utilities/mocks/query';

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/namespaces/default/workflows`);
});

// eslint-disable-next-line playwright/no-skipped-test
test.skip('Call Stack With Completed Workflow', () => {
  test('should show No Call Stack for completed workflow', async ({ page }) => {
    await page
      .getByText('completed-workflow')
      .click({ position: { x: 0, y: 0 } });

    await page.getByTestId('call-stack-tab').click();

    await expect(page.getByTestId('query-call-stack-empty')).toHaveText(
      'No Call Stack Found',
    );
  });
});

// eslint-disable-next-line playwright/no-skipped-test
test.skip('Call Stack with Running Workflow', () => {
  test('should show call stack for running workflow', async ({ page }) => {
    await page
      .getByText('running-workflow')
      .click({ position: { x: 0, y: 0 } });

    await page.getByTestId('call-stack-tab').click();

    await expect(page.getByTestId('query-call-stack')).toBeVisible();
  });

  test('should handle errors when the call stack is not formatted as we expect', async ({
    page,
  }) => {
    await page
      .getByText('running-workflow')
      .click({ position: { x: 0, y: 0 } });

    await page.getByTestId('call-stack-tab').click();

    await mockQueryApiWithStackTraceError(page);

    await expect(page.getByTestId('query-call-stack')).toBeVisible();
  });
});
