import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(baseURL);
});

test.describe('Workflows list', () => {
  test('should render decoded Payloads', async ({ page }) => {
    test.slow();
    await page
      .getByRole('link', { name: 'e2e-workflow-1' })
      .click({ force: true });

    const codeBlock = page.getByTestId('input-and-results');
    const toggle = codeBlock.getByRole('heading', {
      name: 'Input and Results',
    });
    await toggle.click();
    const input = page.getByTestId('workflow-input');
    await expect(input).toContainText(
      'Input ›"Plain text input 1" Click to copy content',
    );
  });

  test('should render decoded call stack', async ({ page }) => {
    await page
      .getByRole('link', { name: 'e2e-workflow-2' })
      .click({ force: true });

    await page.getByText('Call Stack').click();

    const tab = page.getByTestId('call-stack-tab');
    await tab.click();

    const codeBlock = page.getByRole('textbox');
    await expect(codeBlock).toContainText('at workflow');
  });

  test('should render decoded query results', async ({ page }) => {
    await page
      .getByRole('link', { name: 'e2e-workflow-2' })
      .click({ force: true });

    const tab = page.getByTestId('queries-tab');
    await tab.click();

    await page.getByLabel('Query Type').selectOption('is-blocked');

    const codeBlock = page.getByRole('textbox');
    await expect(codeBlock).toContainText('true');
  });
});
