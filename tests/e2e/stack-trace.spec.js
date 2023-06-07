import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(baseURL);
});

test.describe('Stack Trace With Completed Workflow', () => {
  test('should show No Stack Trace for completed workflow', async ({
    page,
  }) => {
    await page
      .getByText('completed-workflow')
      .click({ position: { x: 0, y: 0 } });

    await page.getByText('Stack Trace').click();

    await expect(page.getByTestId('query-stack-trace-empty')).toHaveText(
      'No Stack Traces Found',
    );
  });
});
