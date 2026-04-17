import { expect, test } from '@playwright/test';

const WORKFLOW_ID = 'payload-coverage-workflow';

test.describe('Payload Decoder', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
    await page.getByRole('link', { name: WORKFLOW_ID, exact: true }).click();
  });

  test('workflow input is decoded', async ({ page }) => {
    test.slow();
    const inputAndResult = page.getByTestId('input-and-result');
    await expect(inputAndResult).toContainText('hello world');
    await expect(inputAndResult).toContainText('numberField');
    await expect(inputAndResult).toContainText('3.14159');
    await expect(inputAndResult).toContainText('arrayOfStrings');
  });

  test('memo payloads are decoded', async ({ page }) => {
    test.slow();
    await page.getByTestId('memo-tab').click();
    const main = page.locator('main');
    await expect(main).toContainText('Payload coverage test workflow');
    await expect(main).toContainText('e2e');
    await expect(main).toContainText('coverage');
    await expect(main).toContainText('testData');
  });

  test('search attributes are decoded', async ({ page }) => {
    await page.getByTestId('search-attributes-tab').click();
    const main = page.locator('main');
    await expect(main).toContainText('payload-coverage');
    await expect(main).toContainText('CustomKeywordField');
  });

  test('event history WorkflowExecutionStarted shows decoded input', async ({
    page,
  }) => {
    test.slow();
    await page.getByTestId('history-tab').click();
    await page.getByTestId('feed').click();
    const startedRow = page
      .getByTestId('event-summary-row')
      .filter({ hasText: 'Workflow Execution Started' })
      .first();
    await startedRow.click();
    const expandedRow = page.getByTestId('event-summary-row-expanded').first();
    const editor = expandedRow.getByRole('textbox').first();
    await expect(editor).toContainText('hello world');
    await expect(editor).toContainText('stringField');
    await expect(editor).toContainText('arrayOfStrings');
  });

  test('event history ActivityTaskCompleted shows decoded result', async ({
    page,
  }) => {
    test.slow();
    await page.getByTestId('history-tab').click();
    await page.getByTestId('feed').click();
    const completedRow = page
      .getByTestId('event-summary-row')
      .filter({ hasText: 'Activity Task Completed' })
      .first();
    await completedRow.click();
    const expandedRow = page.getByTestId('event-summary-row-expanded').first();

    const input = expandedRow.getByRole('textbox').first();
    await expect(input).toContainText('alpha');
    await expect(input).toContainText('beta');
    await expect(input).toContainText('gamma');

    const result = expandedRow.getByRole('textbox').nth(1);
    await expect(result).toContainText('processed');
  });

  test('event history ActivityTaskFailed shows expanded event details', async ({
    page,
  }) => {
    test.slow();
    await page.getByTestId('history-tab').click();
    await page.getByTestId('feed').click();
    const failedRow = page
      .getByTestId('event-summary-row')
      .filter({ hasText: 'Activity Task Failed' })
      .first();
    await failedRow.click();
    const expandedRow = page.getByTestId('event-summary-row-expanded').first();
    await expect(expandedRow).toBeVisible();
    await expect(expandedRow).toContainText('Activity Task Failed');
  });

  test('event history StartChildWorkflowExecutionInitiated shows decoded input', async ({
    page,
  }) => {
    test.slow();
    await page.getByTestId('history-tab').click();
    await page.getByTestId('feed').click();
    const childInitiatedRow = page
      .getByTestId('event-summary-row')
      .filter({ hasText: 'Start Child Workflow Execution Initiated' })
      .first();
    await childInitiatedRow.click();
    const expandedRow = page.getByTestId('event-summary-row-expanded').first();
    const editor = expandedRow.getByRole('textbox').first();
    await expect(editor).toContainText('hello from PayloadCoverageWorkflow');
  });

  test('event history ChildWorkflowExecutionCompleted shows decoded result', async ({
    page,
  }) => {
    test.slow();
    await page.getByTestId('history-tab').click();
    await page.getByTestId('feed').click();
    const childCompletedRow = page
      .getByTestId('event-summary-row')
      .filter({ hasText: 'Child Workflow Execution Completed' })
      .first();
    await childCompletedRow.click();
    const expandedRow = page.getByTestId('event-summary-row-expanded').first();
    const input = expandedRow.getByRole('textbox').first();
    await expect(input).toContainText('hello from PayloadCoverageWorkflow');
    const result = expandedRow.getByRole('textbox').nth(1);
    await expect(result).toContainText(
      'child echoed: hello from PayloadCoverageWorkflow',
    );
  });

  test('query get-status returns decoded result', async ({ page }) => {
    await page.getByTestId('queries-tab').click();
    await page.getByTestId('query-select-button').click();
    await page.getByRole('option', { name: 'get-status' }).click();
    await page.getByRole('button', { name: /query/i }).click();
    const result = page.getByTestId('query-result').getByRole('textbox');
    await expect(result).toContainText('status');
    await expect(result).toContainText('count');
    await expect(result).toContainText('data');
  });

  test('query get-field returns decoded field value', async ({ page }) => {
    await page.getByTestId('queries-tab').click();
    await page.getByTestId('query-select-button').click();
    await page.getByRole('option', { name: 'get-field' }).click();

    const payloadInput = page.getByTestId('query-input').getByRole('textbox');

    await payloadInput.focus();
    await payloadInput.fill('"stringField"');
    await page.getByRole('button', { name: /query/i }).click();
    const result = page.getByTestId('query-result').getByRole('textbox');
    await expect(result).toContainText('hello world');
  });

  test('send signal and verify decoded signal payload in history', async ({
    page,
  }) => {
    test.slow();
    await page.getByRole('button', { name: 'More Actions' }).click();
    await page.getByRole('menuitem', { name: 'Send a Signal' }).click();

    const modal = page.getByTestId('signal-confirmation-modal').nth(1);
    const modalSubmitBtn = modal.locator(
      '[data-testid="confirm-modal-button"]',
    );

    await expect(modal).toBeVisible();
    await modal.getByTestId('signal-select-button').click();
    await modal.getByRole('option', { name: 'add-data' }).click();
    await modal
      .getByRole('textbox')
      .nth(1)
      .fill('{"key":"testKey","value":{"nested":true}}');
    await modalSubmitBtn.focus();
    await modalSubmitBtn.click();
    await page.getByTestId('history-tab').click();
    await page.getByTestId('feed').click();
    const signaledRow = page
      .getByTestId('event-summary-row')
      .filter({ hasText: 'Workflow Execution Signaled' })
      .last();
    await signaledRow.click();
    const expandedRow = page.getByTestId('event-summary-row-expanded').last();
    const editor = expandedRow.getByRole('textbox').first();
    await expect(editor).toContainText('testKey');
    await expect(editor).toContainText('nested');
  });

  test('call stack shows stack trace', async ({ page }) => {
    await page.getByTestId('call-stack-tab').click();
    const codeBlock = page.getByRole('textbox');
    await expect(codeBlock).toContainText('at workflow');
  });
});
