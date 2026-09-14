import { expect, type Page, test } from '@playwright/test';

import {
  mockClusterApi,
  mockWorkflowsApis,
  waitForWorkflowsApis,
} from '~/test-utilities/mock-apis';

const maximizeButton = (page: Page) =>
  page.getByTestId('table-maximize-button');

const tableView = (page: Page) => page.getByTestId('maximizable-table-view');

const expectMaximized = async (page: Page) => {
  await expect(tableView(page)).toHaveCSS('position', 'fixed');
  await expect(maximizeButton(page)).toHaveAccessibleName('Minimize');
};

const expectRestored = async (page: Page) => {
  await expect(maximizeButton(page)).toHaveAccessibleName('Maximize');
};

test.describe('Maximize Table', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowsApis(page);
    await mockClusterApi(page, {
      visibilityStore: 'elasticsearch',
      persistenceStore: 'postgres,elasticsearch',
    });

    await page.goto('/namespaces/default/workflows');
    await waitForWorkflowsApis(page);
    await page.getByTestId('workflow-count').waitFor();
    await maximizeButton(page).waitFor();
  });

  test('toggles the table between maximized and restored', async ({ page }) => {
    await expectRestored(page);

    await maximizeButton(page).click();
    await expectMaximized(page);

    const box = await tableView(page).boundingBox();
    const viewport = page.viewportSize();
    expect(box?.width).toBe(viewport?.width);
    expect(box?.height).toBe(viewport?.height);

    await maximizeButton(page).click();
    await expectRestored(page);
  });

  test('Escape restores a maximized table', async ({ page }) => {
    await maximizeButton(page).click();
    await expect(tableView(page)).toHaveCSS('position', 'fixed');

    await page.keyboard.press('Escape');

    await expect(maximizeButton(page)).toHaveAccessibleName('Maximize');
  });

  test('Escape dismisses an open modal without restoring the table', async ({
    page,
  }) => {
    await maximizeButton(page).click();
    await expectMaximized(page);

    await page.locator('#workflow-search-attribute-filter-button').click();
    await page.locator('#workflow-filter-search').fill('WorkflowId');
    await page.getByRole('menuitem', { name: 'WorkflowId Keyword' }).click();
    await page
      .getByTestId('dropdown-filter-chip-WorkflowId-0-text')
      .fill('maximized-view');
    await page.getByTestId('apply-filter-button').click();

    await page.getByTestId('create-view-button').click();
    const modal = page.getByLabel('Save as New View');
    await expect(modal).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(modal).toBeHidden();
    await expect(tableView(page)).toHaveCSS('position', 'fixed');
  });
});
