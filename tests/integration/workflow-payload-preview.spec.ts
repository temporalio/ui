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
    .getByRole('button', { name: 'Input', exact: true });
  const preview = page.getByRole('dialog', { name: 'Input', exact: true });
  await expect(preview).toBeHidden();
  await page.getByTestId('input-and-result').locator('code').first().hover();
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
    .getByRole('button', { name: 'Input', exact: true });
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
      .getByRole('button', { name: 'Result', exact: true }),
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

test('click opens the pending result and clicking outside dismisses it', async ({
  page,
}) => {
  const result = page
    .getByTestId('input-and-result')
    .getByRole('button', { name: 'Result', exact: true });
  const preview = page.getByRole('dialog', { name: 'Result', exact: true });
  await result.click();
  await expect(preview).toContainText('Results will appear upon completion.');
  await page.getByTestId('workflow-id-heading').click();
  await expect(preview).toBeHidden();
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
    .getByRole('button', { name: 'Input', exact: true })
    .hover();
  const preview = page.getByRole('dialog', { name: 'Input', exact: true });
  await expect(preview.locator('.cm-content')).toContainText(
    'Workflow payload preview',
  );
  await page.screenshot({
    path: testInfo.outputPath('open-preview.png'),
    animations: 'disabled',
  });
  await preview.getByRole('button', { name: 'Maximize', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Minimize', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    preview.getByRole('button', { name: 'Maximize', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(preview).toBeHidden();
});
