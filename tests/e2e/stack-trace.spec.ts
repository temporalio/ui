import { expect, test } from '@playwright/test';

import mockQueryApiWithStackTraceError from '~/test-utilities/mocks/query';

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/namespaces/default/workflows`);
});

test.skip('Stack Trace With Completed Workflow', () => {
  test('should show No Stack Trace for completed workflow', async ({
    page,
  }) => {
    await page
      .getByText('completed-workflow')
      .click({ position: { x: 0, y: 0 } });

    await page.getByTestId('stack-trace-tab').click();

    await expect(page.getByTestId('query-stack-trace-empty')).toHaveText(
      'No Stack Traces Found',
    );
  });
});

test.skip('Stack Trace with Running Workflow', () => {
  test('should show stack trace for running workflow', async ({ page }) => {
    await page
      .getByText('running-workflow')
      .click({ position: { x: 0, y: 0 } });

    await page.getByTestId('stack-trace-tab').click();

    await expect(page.getByTestId('query-stack-trace')).toBeVisible();
  });

  test('should handle errors when the stack trace is not formatted as we expect', async ({
    page,
  }) => {
    await page
      .getByText('running-workflow')
      .click({ position: { x: 0, y: 0 } });

    await page.getByTestId('stack-trace-tab').click();

    await mockQueryApiWithStackTraceError(page);

    await expect(page.getByTestId('query-stack-trace')).toBeVisible();
  });
});
