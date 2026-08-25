import { expect, type Page, test } from '@playwright/test';

import {
  mockClusterApi,
  mockWorkflowsApis,
  waitForWorkflowsApis,
} from '~/test-utilities/mock-apis';

const getQueryParam = (url: string) =>
  new URL(url, 'http://localhost').searchParams.get('query') || '';

const openCustomViews = (page: Page) =>
  page.getByTestId('saved-views-button').click();

const expectSelectedView = (page: Page, name: string) =>
  expect(page.getByTestId('saved-views-button')).toContainText(name);

const selectCustomView = async (page: Page, testId: string) => {
  await openCustomViews(page);
  await page.getByTestId(testId).click();
};

test.describe('Saved Query Views', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowsApis(page);
    await mockClusterApi(page, {
      visibilityStore: 'elasticsearch',
      persistenceStore: 'postgres,elasticsearch',
    });

    await page.goto('/namespaces/default/workflows');
    await waitForWorkflowsApis(page);
    await page.getByTestId('workflow-count').waitFor();
  });

  test('System saved queries', async ({ page }) => {
    await page.getByTestId('running').click();
    await expect
      .poll(() => getQueryParam(page.url()))
      .toBe('`ExecutionStatus`="Running"');

    await page.getByTestId('child-workflows').click();
    await expect
      .poll(() => getQueryParam(page.url()))
      .toBe('`ParentWorkflowId` is null');

    await page.getByTestId('today').click();
    await expect
      .poll(() => getQueryParam(page.url()))
      .toMatch(/^StartTime >= "\d{4}-\d{2}-\d{2}T/);

    await page.getByTestId('last-hour').click();
    await expect
      .poll(() => getQueryParam(page.url()))
      .toMatch(/^StartTime >= "\d{4}-\d{2}-\d{2}T/);

    await page.getByTestId('all').click();
    await expect.poll(() => getQueryParam(page.url())).toBe('');
  });

  test('User saved queries: create new, edit view, then delete', async ({
    page,
  }) => {
    await page.locator('#workflow-search-attribute-filter-button').click();
    await page.locator('#workflow-filter-search').fill('WorkflowId');
    await page.getByRole('menuitem', { name: 'WorkflowId Keyword' }).click();
    await page
      .getByTestId('dropdown-filter-chip-WorkflowId-0-text')
      .fill('user-view-1');

    await page.getByTestId('apply-filter-button').click();
    await expect
      .poll(() => getQueryParam(page.url()))
      .toBe('`WorkflowId`="user-view-1"');

    await page.getByTestId('create-view-button').click();
    await page.getByTestId('workflow-save-view-modal-input').fill('My View');
    await page
      .getByLabel('Save as New View')
      .getByTestId('confirm-modal-button')
      .click();

    await expect
      .poll(() => getQueryParam(page.url()))
      .toBe('`WorkflowId`="user-view-1"');
    await expectSelectedView(page, 'My View');

    await page.locator('#workflow-search-attribute-filter-button').click();
    await page.locator('#workflow-filter-search').fill('TaskQueue');
    await page.getByRole('menuitem', { name: 'TaskQueue Keyword' }).click();
    await page
      .getByTestId('dropdown-filter-chip-TaskQueue-1-text')
      .fill('queue-z');

    await page.getByRole('button', { name: 'Apply' }).click();

    await expect
      .poll(() => getQueryParam(page.url()))
      .toContain('`WorkflowId`="user-view-1" AND `TaskQueue`="queue-z"');

    await expectSelectedView(page, 'My View');
    await page.getByTestId('edit-view-button').click();

    await page.getByTestId('workflow-edit-view-modal-input').fill('My View 2');
    await page
      .getByLabel('Edit View')
      .getByTestId('confirm-modal-button')
      .click();

    await expectSelectedView(page, 'My View 2');
    await expect
      .poll(() => getQueryParam(page.url()))
      .toContain('`WorkflowId`="user-view-1" AND `TaskQueue`="queue-z"');

    await selectCustomView(page, 'my-view-2');
    await page.getByTestId('edit-view-button').click();
    await page.getByRole('button', { name: 'Delete View' }).click();

    await expect(page.getByTestId('my-view-2')).toHaveCount(0);
    await expect.poll(() => getQueryParam(page.url())).toBe('');
  });

  test('User saved queries: create new, create copied view and delete', async ({
    page,
  }) => {
    await page.locator('#workflow-search-attribute-filter-button').click();
    await page.locator('#workflow-filter-search').fill('WorkflowId');
    await page.getByRole('menuitem', { name: 'WorkflowId Keyword' }).click();
    await page
      .getByTestId('dropdown-filter-chip-WorkflowId-0-text')
      .fill('user-view-1');

    await page.getByTestId('apply-filter-button').click();
    await expect
      .poll(() => getQueryParam(page.url()))
      .toBe('`WorkflowId`="user-view-1"');

    await page.getByTestId('create-view-button').click();
    await page
      .getByTestId('workflow-save-view-modal-input')
      .fill('Original view');
    await page
      .getByLabel('Save as New View')
      .getByTestId('confirm-modal-button')
      .click();

    await expect
      .poll(() => getQueryParam(page.url()))
      .toBe('`WorkflowId`="user-view-1"');
    await expectSelectedView(page, 'Original view');

    await page.locator('#workflow-search-attribute-filter-button').click();
    await page.locator('#workflow-filter-search').fill('TaskQueue');
    await page.getByRole('menuitem', { name: 'TaskQueue Keyword' }).click();
    await page
      .getByTestId('dropdown-filter-chip-TaskQueue-1-text')
      .fill('queue-z');

    await page.getByRole('button', { name: 'Apply' }).click();

    await expect
      .poll(() => getQueryParam(page.url()))
      .toContain('`WorkflowId`="user-view-1" AND `TaskQueue`="queue-z"');

    await expectSelectedView(page, 'Original view');
    await page.getByTestId('duplicate-view-button').click();

    await expectSelectedView(page, 'Original view-copy');
    await expect
      .poll(() => getQueryParam(page.url()))
      .toContain('`WorkflowId`="user-view-1" AND `TaskQueue`="queue-z"');

    await selectCustomView(page, 'original-view-copy');
    await page.getByTestId('edit-view-button').click();
    await page.getByRole('button', { name: 'Delete View' }).click();

    await expect(page.getByTestId('original-view-copy')).toHaveCount(0);
    await expect.poll(() => getQueryParam(page.url())).toBe('');
  });

  test('User saved queries: create view from shared view query', async ({
    page,
  }) => {
    await page.goto(
      '/namespaces/default/workflows?query=%60WorkflowId%60+STARTS_WITH+%22cats%22&savedQuery=Cats',
    );

    await expect
      .poll(() => getQueryParam(page.url()))
      .toBe('`WorkflowId` STARTS_WITH "cats"');

    await expectSelectedView(page, 'Cats');
  });
});
