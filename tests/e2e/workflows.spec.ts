import { expect, Locator, test } from '@playwright/test';

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(baseURL);
});

test.describe('Workflows list', () => {
  test('should render decoded Payloads', async ({ page }) => {
    test.slow();
    await page
      .getByRole('link', { name: 'e2e-workflow-1' })
      .click({ force: true });

    let codeBlock: Locator;
    let toggle: Locator;

    codeBlock = page.getByTestId('input-and-results');

    toggle = codeBlock.getByRole('heading', { name: 'Input and Results' });
    await toggle.click();
    const input = page.getByTestId('workflow-input');
    await expect(input).toContainText('"Mock decoded payload"');
    await toggle.click();

    codeBlock = page.locator('.expanded-cell >> .cm-editor');

    toggle = page.getByRole('cell', { name: 'WorkflowExecutionStarted' });
    await toggle.click();
    await expect(
      codeBlock.getByText('"Mock decoded payload"').first(),
    ).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: 'MarkerRecorded' }).first();
    await toggle.click();
    await expect(
      codeBlock.getByText('"Mock decoded payload"').first(),
    ).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: 'ActivityTaskScheduled' }).first();
    await toggle.click();
    await expect(
      codeBlock.getByText('"Mock decoded payload"').first(),
    ).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: 'ActivityTaskCompleted' }).first();
    await toggle.click();
    await expect(
      codeBlock.getByText('"Mock decoded payload"').first(),
    ).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: 'WorkflowExecutionCompleted' });
    await toggle.click();
    await expect(
      codeBlock.getByText('"Mock decoded payload"').first(),
    ).toBeVisible();
    await toggle.click();
  });

  test('should render decoded stack trace', async ({ page }) => {
    await page
      .getByRole('link', { name: 'e2e-workflow-2' })
      .click({ force: true });

    await page.getByText('Stack Trace').click();

    const tab = page.getByTestId('stack-trace-tab');
    await tab.click();

    const codeBlock = page.locator('.readOnly .cm-editor');
    await expect(codeBlock).toContainText('"Mock decoded payload"');
  });

  test('should render decoded query results', async ({ page }) => {
    await page
      .getByRole('link', { name: 'e2e-workflow-2' })
      .click({ force: true });

    const tab = page.getByTestId('queries-tab');
    await tab.click();

    await page.getByLabel('Query Type').selectOption('is-blocked');

    const codeBlock = page.locator('.readOnly .cm-editor');
    await expect(codeBlock).toContainText('"Mock decoded payload"');
  });
});
