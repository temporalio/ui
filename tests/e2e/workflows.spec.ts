import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(baseURL);
});

test.describe('Workflow Execution Page', () => {
  test('should render decoded Payloads', async ({ page }) => {
    test.slow();
    await page
      .getByRole('link', { name: 'e2e-workflow-1' })
      .click({ force: true });

    const inputAndResult = page.getByTestId('input-and-result');
    await expect(inputAndResult).toContainText('Mock decoded payload');
  });

  test('should render decoded call stack', async ({ page }) => {
    await page
      .getByRole('link', { name: 'e2e-workflow-2' })
      .click({ force: true });

    await page.getByText('Call Stack').click();

    const tab = page.getByTestId('call-stack-tab');
    await tab.click();

    const codeBlock = page.getByRole('textbox');
    await expect(codeBlock).toContainText('Mock decoded payload');
  });

  test('should render decoded query results', async ({ page }) => {
    await page
      .getByRole('link', { name: 'e2e-workflow-2' })
      .click({ force: true });

    const tab = page.getByTestId('queries-tab');
    await tab.click();

    await page.getByTestId('query-select-button').click();
    await page.getByRole('option', { name: 'is-blocked' }).click();
    await page.getByRole('button', { name: 'Query' }).click();

    const codeBlock = page.getByTestId('query-result').getByRole('textbox');
    await expect(codeBlock).toContainText('Mock decoded payload');
  });
});
