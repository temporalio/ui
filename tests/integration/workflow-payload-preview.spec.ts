import { expect, test } from '@playwright/test';

import {
  mockEventHistoryApi,
  mockWorkflowApis,
} from '../test-utilities/mock-apis';
import { mockWorkflow } from '../test-utilities/mocks/workflow';

const execution = mockWorkflow.workflowExecutionInfo.execution;
const workflowUrl = `/namespaces/default/workflows/${execution.workflowId}/${execution.runId}/history`;

test.beforeEach(async ({ page }) => {
  await mockWorkflowApis(page);
  await page.goto(workflowUrl);
});

test('hover previews preserve payload copying and fit the viewport', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const input = page
    .getByTestId('input-and-result')
    .getByRole('button', { name: 'Preview Input', exact: true });
  const preview = page.getByRole('dialog', { name: 'Input', exact: true });
  await expect(preview).toBeHidden();
  await page.getByTestId('input-and-result').locator('code').first().hover();
  await expect(preview).toBeHidden();
  await page.getByRole('heading', { name: 'Input', exact: true }).hover();
  await expect(preview).toBeHidden();
  await input.hover();
  await expect(preview.locator('.cm-content')).toHaveText('1');
  await preview.hover();
  await expect(preview).toBeVisible();
  const bounds = await preview.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(
    page.viewportSize().width,
  );
  await preview.getByRole('button', { name: 'Click to copy content' }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe('1');
  await expect(preview).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(preview).toBeHidden();
  await expect(input).toBeFocused();
});

test('keyboard users can open, interact with, and dismiss the preview', async ({
  page,
}) => {
  const input = page
    .getByTestId('input-and-result')
    .getByRole('button', { name: 'Preview Input', exact: true });
  const preview = page.getByRole('dialog', { name: 'Input', exact: true });
  await input.focus();
  await expect(preview).toBeVisible();
  await input.press('Tab');
  await expect(preview.locator('.cm-content')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(input).toBeFocused();
  await input.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(
    page
      .getByTestId('input-and-result')
      .getByRole('button', { name: 'Maximize Input', exact: true }),
  ).toBeFocused();
  await input.focus();
  await input.press('Tab');
  await page.keyboard.press('Tab');
  await expect(
    preview.getByRole('button', { name: 'Click to copy content' }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(preview).toBeHidden();
  await expect(input).toBeFocused();
});

test('click expands the pending result and Escape restores focus', async ({
  page,
}) => {
  const result = page
    .getByTestId('input-and-result')
    .getByRole('button', { name: 'Maximize Result', exact: true });
  const preview = page.getByRole('dialog', { name: 'Result', exact: true });
  await result.click();
  await expect(preview).toContainText('Results will appear upon completion.');
  await expect(preview).toHaveJSProperty('tagName', 'DIALOG');
  await page.keyboard.press('Escape');
  await expect(preview).toBeHidden();
  await expect(result).toBeFocused();
});

test('large payloads can be expanded and restored', async ({
  page,
}, testInfo) => {
  const payload = Array.from({ length: 50 }, (_, index) => ({
    step: index,
    message: 'Workflow payload preview',
  }));
  await mockEventHistoryApi(page, {
    history: {
      events: [
        {
          eventId: '1',
          eventType: 'WorkflowExecutionStarted',
          eventTime: '2022-04-28T05:30:19.427247101Z',
          workflowExecutionStartedEventAttributes: {
            input: {
              payloads: [
                {
                  metadata: { encoding: 'anNvbi9wbGFpbg==' },
                  data: Buffer.from(JSON.stringify(payload)).toString('base64'),
                },
              ],
            },
          },
        },
      ],
    },
  });
  await page.reload();
  await expect(page.getByTestId('input-and-result')).toContainText(
    'Workflow payload preview',
  );
  await page.screenshot({
    path: testInfo.outputPath('inline-preview.png'),
    animations: 'disabled',
  });
  await page
    .getByTestId('input-and-result')
    .getByRole('button', { name: 'Preview Input', exact: true })
    .hover();
  const preview = page.getByRole('dialog', { name: 'Input', exact: true });
  await expect(preview.locator('.cm-content')).toContainText(
    'Workflow payload preview',
  );
  await page.screenshot({
    path: testInfo.outputPath('open-preview.png'),
    animations: 'disabled',
  });
  await expect(
    preview.getByRole('button', { name: 'Maximize', exact: true }),
  ).toHaveCount(0);
  const expand = page
    .getByTestId('input-and-result')
    .getByRole('button', { name: 'Maximize Input', exact: true });
  await expand.click();
  await expect(preview).toHaveJSProperty('tagName', 'DIALOG');
  await expect(preview.locator('.cm-content')).toContainText(
    'Workflow payload preview',
  );
  await page.screenshot({
    path: testInfo.outputPath('expanded-payload.png'),
    animations: 'disabled',
  });
  await page.keyboard.press('Escape');
  await expect(preview).toBeHidden();
  await expect(expand).toBeFocused();
});

test('the inline arrow opens the full view directly and the close button restores focus', async ({
  page,
}) => {
  const input = page
    .getByTestId('input-and-result')
    .getByRole('button', { name: 'Maximize Input', exact: true });
  await input.hover();
  await expect(
    page.getByRole('dialog', { name: 'Input', exact: true }),
  ).toBeHidden();
  await input.click();
  const expanded = page.getByRole('dialog', { name: 'Input', exact: true });
  await expect(expanded).toHaveJSProperty('tagName', 'DIALOG');
  await expect(expanded.locator('.cm-content')).toHaveText('1');
  await expanded.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(expanded).toBeHidden();
  await expect(input).toBeFocused();
});

test('the chevron toggles the mini preview and outside clicks dismiss it', async ({
  page,
}) => {
  const trigger = page
    .getByTestId('input-and-result')
    .getByRole('button', { name: 'Preview Result', exact: true });
  const preview = page.getByRole('dialog', { name: 'Result', exact: true });
  await trigger.click();
  await expect(preview).toHaveJSProperty('tagName', 'DIV');
  await expect(preview).toContainText('Results will appear upon completion.');
  await trigger.click();
  await expect(preview).toBeHidden();
  await trigger.click();
  await expect(preview).toBeVisible();
  await page.getByTestId('workflow-id-heading').click();
  await expect(preview).toBeHidden();
});
