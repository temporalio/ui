import { expect, test } from '@playwright/test';

import { SEARCH_ATTRIBUTE_TYPE } from '$src/lib/types/workflows';
import {
  mockGlobalApis,
  mockNamespaceApi,
  mockSearchAttributesApi,
  mockSettingsApi,
  mockTaskQueuesApi,
} from '~/test-utilities/mock-apis';

test.describe('Start a Workflow', () => {
  const startWorkflowUrl = '/namespaces/default/workflows/start-workflow';

  test.beforeEach(async ({ page }) => {
    await mockGlobalApis(page);
    await mockNamespaceApi(page);
  });

  test.describe('Start a Workflow - Disabled', () => {
    test('redirects to Workflow list page when start workflow is disabled via Settings API', async ({
      page,
    }) => {
      await page.goto(startWorkflowUrl);
      await expect(page).toHaveURL(
        '/namespaces/default/workflows/start-workflow',
      );
      const navigationPromise = page.waitForURL('namespaces/default/workflows');
      await navigationPromise;
      await expect(page).toHaveURL('/namespaces/default/workflows');
    });
  });

  test.describe('Start a Workflow - Enabled', () => {
    test('Shows blank Start a Workflow form', async ({ page }) => {
      await mockSettingsApi(page, { StartWorkflowDisabled: false });
      await mockSearchAttributesApi(page);
      await page.goto(startWorkflowUrl);
      await expect(page).toHaveURL(
        '/namespaces/default/workflows/start-workflow',
      );
      await expect(page.getByTestId('start-workflow')).toHaveText(
        'Start Workflow',
      );
      await expect(page.getByTestId('start-workflow-button')).toBeDisabled();
      await expect(page.locator('#workflowId')).toBeEnabled();
      await expect(page.locator('#taskQueue')).toBeEnabled();
      await expect(page.locator('#workflowType')).toBeEnabled();
      await page.locator('#workflowId').type('test-workflow-id');
      await page.locator('#taskQueue').type('task-queue');
      await mockTaskQueuesApi(page);
      await page.locator('#workflowType').type('test-workflow-type');
      await expect(page.getByRole('status')).toContainText(
        'Task Queue is Active',
      );
      await expect(page.getByTestId('start-workflow-button')).toBeEnabled();
    });
  });

  test.describe('Custom Search Attributes', () => {
    test.beforeEach(async ({ page }) => {
      await mockSettingsApi(page, { StartWorkflowDisabled: false });
      await mockSearchAttributesApi(page, {
        customAttributes: {
          CustomBool: SEARCH_ATTRIBUTE_TYPE.BOOL,
          CustomKeyword: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
        },
      });
      await page.goto(startWorkflowUrl);
      await page.getByText('More options').click();
    });

    test('adds a search attribute and shows correct input for Bool type', async ({
      page,
    }) => {
      await page.getByTestId('add-search-attribute-button').click();

      const attributeSelect = page.getByTestId(
        'search-attribute-select-button',
      );
      await attributeSelect.click();
      await page.getByRole('option', { name: 'CustomBool' }).click();

      await expect(page.getByTestId('attribute-value-0-button')).toBeVisible();
    });

    test('updates value for Bool attribute', async ({ page }) => {
      await page.getByTestId('add-search-attribute-button').click();

      const attributeSelect = page.getByTestId(
        'search-attribute-select-button',
      );
      await attributeSelect.click();
      await page.getByRole('option', { name: 'CustomBool' }).click();

      const valueSelect = page.getByTestId('attribute-value-0-button');
      await valueSelect.click();
      await page.getByRole('option', { name: 'True' }).click();

      await expect(page.locator('#attribute-value-0')).toHaveValue('True');
    });

    test('switches input type when changing attribute selection', async ({
      page,
    }) => {
      await page.getByTestId('add-search-attribute-button').click();

      const attributeSelect = page.getByTestId(
        'search-attribute-select-button',
      );
      await attributeSelect.click();
      await page.getByRole('option', { name: 'CustomKeyword' }).click();

      await expect(
        page.getByTestId('custom-search-attribute-value'),
      ).toBeVisible();

      await attributeSelect.click();
      await page.getByRole('option', { name: 'CustomBool' }).click();

      await expect(
        page.getByTestId('custom-search-attribute-value'),
      ).toBeHidden();
      await expect(page.getByTestId('attribute-value-0-button')).toBeVisible();
    });

    test('disables already selected attributes in other rows', async ({
      page,
    }) => {
      await page.getByTestId('add-search-attribute-button').click();

      const firstSelect = page
        .getByTestId('search-attribute-select-button')
        .first();
      await firstSelect.click();
      await page.getByRole('option', { name: 'CustomBool' }).click();

      await page.getByTestId('add-search-attribute-button').click();

      const secondSelect = page
        .getByTestId('search-attribute-select-button')
        .nth(1);
      await secondSelect.click();

      const customBoolOption = page.locator(
        '#search-attribute-1-select > li[role="option"]',
        { hasText: 'CustomBool' },
      );
      await expect(customBoolOption).toHaveAttribute('aria-disabled', 'true');
    });

    test('removes a search attribute row', async ({ page }) => {
      await page.getByTestId('add-search-attribute-button').click();
      await expect(
        page.getByTestId('search-attribute-select-button'),
      ).toBeVisible();

      await page
        .getByTestId('search-attribute-close-button')
        .and(page.locator(':visible'))
        .click();
      await expect(
        page.getByTestId('search-attribute-select-button'),
      ).toBeHidden();
    });
  });
});
