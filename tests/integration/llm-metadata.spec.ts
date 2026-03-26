import { expect, test } from '@playwright/test';

import {
  mockGlobalApis,
  mockNamespaceApi,
  mockSearchAttributesApi,
  mockTaskQueuesApi,
} from '~/test-utilities/mock-apis';
import {
  mockLLMEventHistoryApi,
  mockLLMWorkflow,
} from '~/test-utilities/mocks/llm-event-history';
import { mockWorkflowApi } from '~/test-utilities/mocks/workflow';

const workflowUrl = `/namespaces/default/workflows/${mockLLMWorkflow.workflowExecutionInfo.execution.workflowId}/${mockLLMWorkflow.workflowExecutionInfo.execution.runId}/history`;

const setupMocks = (page) => {
  return Promise.all([
    mockGlobalApis(page),
    mockNamespaceApi(page),
    mockSearchAttributesApi(page),
    mockWorkflowApi(page, mockLLMWorkflow),
    mockLLMEventHistoryApi(page),
    mockTaskQueuesApi(page),
  ]);
};

test.describe('LLM Metadata Badges', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(workflowUrl);
  });

  test('displays model and token badges for each LLM activity', async ({
    page,
  }) => {
    await setupMocks(page);

    await expect(page.getByTestId('event-summary-table')).toBeVisible();

    // Verify all 3 model badges are visible
    await expect(page.locator('text=gpt-4o').first()).toBeVisible();
    await expect(page.locator('text=claude-3-5-sonnet').first()).toBeVisible();
    await expect(page.locator('text=gemini-1.5-pro').first()).toBeVisible();

    // Verify token badges for each activity
    await expect(page.locator('text=80 tokens').first()).toBeVisible();
    await expect(page.locator('text=200 tokens').first()).toBeVisible();
    await expect(page.locator('text=120 tokens').first()).toBeVisible();
  });

  test('displays group-level LLM Details when activity row is expanded', async ({
    page,
  }) => {
    await setupMocks(page);

    await expect(page.getByTestId('event-summary-table')).toBeVisible();

    // Expand the first activity (callLLM / gpt-4o)
    const firstActivity = page.locator('tr').filter({ hasText: 'callLLM' });
    await firstActivity.first().click();

    const expandedRow = page.getByTestId('event-summary-row-expanded').first();
    await expect(expandedRow).toBeVisible();

    // Verify group-level LLM Details section
    const groupLLM = expandedRow.getByTestId('group-llm-details');
    await expect(groupLLM).toBeVisible();
    await expect(groupLLM.getByText('LLM Details')).toBeVisible();
    await expect(groupLLM.getByText('Prompt tokens')).toBeVisible();
    await expect(groupLLM.getByText('Completion tokens')).toBeVisible();
    await expect(groupLLM.getByText('Total tokens')).toBeVisible();
  });

  test('each expanded activity shows its own per-activity LLM details', async ({
    page,
  }) => {
    await setupMocks(page);

    await expect(page.getByTestId('event-summary-table')).toBeVisible();

    // Expand callLLMClaude activity
    const claudeRow = page.locator('tr').filter({ hasText: 'callLLMClaude' });
    await claudeRow.first().click();

    const expandedClaude = page
      .getByTestId('event-summary-row-expanded')
      .first();
    await expect(expandedClaude).toBeVisible();

    // Verify claude-specific details in the group LLM section
    const claudeLLM = expandedClaude.getByTestId('group-llm-details');
    await expect(claudeLLM).toBeVisible();
    await expect(claudeLLM.locator('text=claude-3-5-sonnet')).toBeVisible();
    await expect(claudeLLM.locator('text=120')).toBeVisible(); // prompt tokens
    await expect(claudeLLM.locator('text=80')).toBeVisible(); // completion tokens
    await expect(claudeLLM.locator('text=200')).toBeVisible(); // total tokens
  });
});
