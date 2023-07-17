import { expect, Locator, test } from '@playwright/test';

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(baseURL);
});

test.describe('Workflows list', () => {
  test('should render decoded Payloads', async ({ page }) => {
    test.slow();
    await page.getByText('e2e-workflow-1').click({ position: { x: 0, y: 0 } });

    let region: Locator;
    let toggle: Locator;

    region = page.getByTestId('input-and-results');

    toggle = region.getByRole('heading', { name: 'Input and Results' });
    await toggle.click();
    const input = page.getByTestId('workflow-input');
    await expect(input).toContainText('"Mock decoded payload"');
    await toggle.click();

    region = page.locator('.expanded-cell >> code.language-json');

    toggle = page.getByRole('cell', { name: 'WorkflowExecutionStarted' });
    await toggle.click();
    await expect(region.getByText('"Mock decoded payload"')).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: 'MarkerRecorded' }).first();
    await toggle.click();
    await expect(region.getByText('"Mock decoded payload"')).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: 'ActivityTaskScheduled' }).first();
    await toggle.click();
    await expect(region.getByText('"Mock decoded payload"')).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: 'ActivityTaskCompleted' }).first();
    await toggle.click();
    await expect(region.getByText('"Mock decoded payload"')).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: 'WorkflowExecutionCompleted' });
    await toggle.click();
    await expect(region.getByText('"Mock decoded payload"')).toBeVisible();
    await toggle.click();
  });

  test('should render decoded stack trace', async ({ page }) => {
    await page.getByText('e2e-workflow-2').click({ position: { x: 0, y: 0 } });

    await page.getByText('Stack Trace').click();

    await expect(page.getByRole('code')).toContainText(
      '"Mock decoded payload"',
    );
  });

  test('should render decoded query results', async ({ page }) => {
    await page.getByText('e2e-workflow-2').click({ position: { x: 0, y: 0 } });

    await page.getByText('Queries').click();
    await page.getByLabel('Query Type').selectOption('is-blocked');

    await expect(page.getByRole('code')).toContainText(
      '"Mock decoded payload"',
    );
  });
});
