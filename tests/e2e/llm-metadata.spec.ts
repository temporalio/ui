import { expect, test } from '@playwright/test';

test.describe('LLM Metadata E2E', () => {
  test('displays LLM badges for multiple activities with different models', async ({
    page,
  }) => {
    await page.goto('/namespaces/default/workflows/llm-workflow');

    await expect(page.getByTestId('workflow-id-heading')).toContainText(
      'llm-workflow',
    );

    const historyTab = page.getByTestId('history-tab');
    await historyTab.click();

    await expect(page.getByTestId('event-summary-table')).toBeVisible();

    // Verify all 3 model badges are visible
    await expect(page.locator('text=gpt-4o').first()).toBeVisible();
    await expect(page.locator('text=claude-3-5-sonnet').first()).toBeVisible();
    await expect(page.locator('text=gemini-1.5-pro').first()).toBeVisible();

    // Verify token badges
    await expect(page.locator('text=80 tokens').first()).toBeVisible();
    await expect(page.locator('text=200 tokens').first()).toBeVisible();
    await expect(page.locator('text=120 tokens').first()).toBeVisible();
  });

  test('expanded activity shows group-level LLM details', async ({ page }) => {
    await page.goto('/namespaces/default/workflows/llm-workflow');

    await expect(page.getByTestId('workflow-id-heading')).toContainText(
      'llm-workflow',
    );

    const historyTab = page.getByTestId('history-tab');
    await historyTab.click();

    await expect(page.getByTestId('event-summary-table')).toBeVisible();

    // Expand the callLLM activity
    const activityRow = page.locator('tr').filter({ hasText: 'callLLM' });
    await activityRow.first().click();

    // Verify group-level LLM Details section
    const groupLLM = page.getByTestId('group-llm-details').first();
    await expect(groupLLM).toBeVisible();
    await expect(groupLLM.locator('text=LLM Details')).toBeVisible();
    await expect(groupLLM.getByText('Prompt tokens')).toBeVisible();
    await expect(groupLLM.getByText('Completion tokens')).toBeVisible();
    await expect(groupLLM.getByText('Total tokens')).toBeVisible();
  });
});
