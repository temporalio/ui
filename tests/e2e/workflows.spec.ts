import { test, expect, Locator } from '@playwright/test';

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(baseURL);
});

test.describe('Workflows list', () => {
  test('should render decoded Payloads', async ({ page }) => {
    await page.getByText('e2e-workflow-1').click({ position: { x: 0, y: 0 } });

    let region: Locator;
    let toggle: Locator;

    region = page.getByTestId('input-and-results');

    toggle = region.getByRole('heading', { name: 'Input and Results' });
    await toggle.click();
    await expect(region.getByText('"Plain text input 1"')).toBeVisible();
    await toggle.click();

    region = page.locator('.expanded-cell');

    toggle = page.getByRole('cell', { name: 'WorkflowExecutionStarted' });
    await toggle.click();
    await expect(region.getByText('"Plain text input 1"')).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: 'MarkerRecorded' }).first();
    await toggle.click();
    await expect(
      region.getByText('"Received Plain text input 1"'),
    ).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: 'ActivityTaskScheduled' }).first();
    await toggle.click();
    await expect(region.getByText('"Plain text input 1"')).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: 'ActivityTaskCompleted' }).first();
    await toggle.click();
    await expect(
      region.getByText('"Received Plain text input 1"'),
    ).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: 'WorkflowExecutionCompleted' });
    await toggle.click();
    await expect(
      region.getByText('"Received Plain text input 1"'),
    ).toBeVisible();
    await toggle.click();
  });

  test('should render decoded stack trace', async ({ page }) => {
    await page.getByText('e2e-workflow-2').click({ position: { x: 0, y: 0 } });

    await page.getByText('Stack Trace').click();

    await expect(
      page.getByRole('code').filter({
        hasText: 'temporal/workflows.ts',
      }),
    ).toBeVisible();
  });

  test('should render decoded query results', async ({ page }) => {
    await page.getByText('e2e-workflow-2').click({ position: { x: 0, y: 0 } });

    await page.getByText('Queries').click();
    await page.getByLabel('Query Type').selectOption('is-blocked');

    await expect(
      page.getByRole('code').filter({ hasText: 'true' }),
    ).toBeVisible();
  });
});
