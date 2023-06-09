import { test, expect } from '@playwright/test';

const initialHeaders = [
  'Status',
  'Workflow ID',
  'Run ID',
  'Type',
  'Start',
  'End',
];

const reorderedHeaders = [
  'Status',
  'Workflow ID',
  'Type',
  'Start',
  'End',
  'Run ID',
];

const headersToAdd = ['History Size', 'History Length', 'Execution Time'];
const headersToRemove = ['Type', 'Start', 'End'];

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(baseURL);
});

test.describe('Workflows Table Configuration', () => {
  test('allows adding columns to the table', async ({ page }) => {
    for (const header of initialHeaders) {
      await expect(
        page.getByTestId(`workflows-summary-table-header-cell-${header}`),
      ).toBeVisible();
    }

    for (const header of headersToAdd) {
      await expect(
        page.getByTestId(`workflows-summary-table-header-cell-${header}`),
      ).toBeHidden();
    }

    await page
      .getByTestId('workflows-summary-table-configuration-button')
      .click();

    for (const header of headersToAdd) {
      await page
        .getByTestId(`orderable-list-item-${header}-add-button`)
        .click();
    }

    await page.getByTestId('drawer-close-button').click();
    await page
      .getByTestId('unpinned-table-columns-wrapper')
      .scrollIntoViewIfNeeded();

    for (const header of headersToAdd) {
      await expect(
        page.getByTestId(`workflows-summary-table-header-cell-${header}`),
      ).toBeVisible();
    }
  });

  test('allows removing columns from the table', async ({ page }) => {
    for (const header of initialHeaders) {
      await expect(
        page.getByTestId(`workflows-summary-table-header-cell-${header}`),
      ).toBeVisible();
    }

    await page
      .getByTestId('workflows-summary-table-configuration-button')
      .click();

    for (const header of headersToRemove) {
      await page
        .getByTestId(`orderable-list-item-${header}-remove-button`)
        .click();
    }

    await page.getByTestId('drawer-close-button').click();

    for (const header of headersToRemove) {
      await expect(
        page.getByTestId(`workflows-summary-table-header-cell-${header}`),
      ).toBeHidden();
    }
  });

  test('allows reordering columns in the table via buttons', async ({
    page,
  }) => {
    const initialThs = await page
      .locator('.workflows-summary-table-header-cell')
      .all();

    initialThs.forEach(async (th, idx) => {
      await expect(th).toHaveAttribute(
        'data-testid',
        `workflows-summary-table-header-cell-${initialHeaders[idx]}`,
      );
    });

    await page
      .getByTestId('workflows-summary-table-configuration-button')
      .click();

    await expect(
      page.locator('#workflows-summary-table-configuration-drawer'),
    ).toBeVisible();

    for (let i = 0; i < 3; i++) {
      await page
        .getByTestId('orderable-list-item-Run ID-move-down-button')
        .click();
    }

    const reorderedThs = await page
      .locator('.workflows-summary-table-header-cell')
      .all();

    await Promise.allSettled(
      reorderedThs.map((th, idx) => {
        return expect(th).toHaveAttribute(
          'data-testid',
          `workflows-summary-table-header-cell-${reorderedHeaders[idx]}`,
        );
      }),
    );
  });

  test('allows reordering columns in the table via drag and drop', async ({
    page,
  }) => {
    const initialThs = await page
      .locator('.workflows-summary-table-header-cell')
      .all();

    initialThs.forEach(async (th, idx) => {
      await expect(th).toHaveAttribute(
        'data-testid',
        `workflows-summary-table-header-cell-${initialHeaders[idx]}`,
      );
    });

    await page
      .getByTestId('workflows-summary-table-configuration-button')
      .click();

    await expect(
      page.locator('#workflows-summary-table-configuration-drawer'),
    ).toBeVisible();

    const sourceElement = page.getByTestId('orderable-list-item-Run ID');
    const targetElement = page.getByTestId('orderable-list-item-End');
    const sourceBox = await sourceElement.boundingBox();
    const targetBox = await targetElement.boundingBox();

    if (sourceBox && targetBox) {
      await page.mouse.move(
        sourceBox.x + sourceBox.width / 2,
        sourceBox.y + sourceBox.height / 2,
      );
      await page.mouse.down();
      await page.mouse.move(
        targetBox.x + targetBox.width / 2,
        targetBox.y + targetBox.height / 2,
      );
      await page.mouse.up();
    }

    const items = page.locator('li.orderable-item[draggable="true"]');
    expect(await items.count()).toBe(6);
    const locator = items.nth(5);
    const innerText = await locator.innerText();
    expect(innerText).toBe('Run ID');

    await page.getByTestId('drawer-close-button').click();

    const reorderedThs = await page
      .locator('.workflows-summary-table-header-cell')
      .all();

    await Promise.allSettled(
      reorderedThs.map((th, idx) => {
        return expect(th).toHaveAttribute(
          'data-testid',
          `workflows-summary-table-header-cell-${reorderedHeaders[idx]}`,
        );
      }),
    );
  });
});
