import { expect, Page, test } from '@playwright/test';

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

const delayClick = (testId: string, page: Page, delayMs = 100) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      return page.getByTestId(testId).click().then(resolve).catch(reject);
    }, delayMs);
  });

test.describe('Workflows Table Configuration', () => {
  test('allows adding columns to the table', async ({ page }) => {
    await Promise.all(
      initialHeaders.map((header) =>
        expect(
          page.getByTestId(`workflows-summary-table-header-cell-${header}`),
        ).toBeAttached(),
      ),
    );

    await Promise.all(
      headersToAdd.map((header) =>
        expect(
          page.getByTestId(`workflows-summary-table-header-cell-${header}`),
        ).not.toBeAttached(),
      ),
    );

    await page.getByTestId('filter-configuration-menu-button').click();
    await page
      .getByTestId('workflows-summary-table-configuration-button')
      .click();

    for (const header of headersToAdd) {
      await delayClick(`orderable-list-item-${header}-add-button`, page);
    }

    await page.getByTestId('drawer-close-button').click();

    await Promise.all(
      headersToAdd.map((header) =>
        expect(
          page.getByTestId(`workflows-summary-table-header-cell-${header}`),
        ).toBeAttached(),
      ),
    );
  });

  test('allows removing columns from the table', async ({ page }) => {
    await Promise.all(
      initialHeaders.map((header) =>
        expect(
          page.getByTestId(`workflows-summary-table-header-cell-${header}`),
        ).toBeAttached(),
      ),
    );

    await page.getByTestId('filter-configuration-menu-button').click();
    await page
      .getByTestId('workflows-summary-table-configuration-button')
      .click();

    for (const header of headersToRemove) {
      await delayClick(`orderable-list-item-${header}-remove-button`, page);
    }

    await page.getByTestId('drawer-close-button').click();

    await Promise.all(
      headersToRemove.map((header) =>
        expect(
          page.getByTestId(`workflows-summary-table-header-cell-${header}`),
        ).not.toBeAttached(),
      ),
    );
  });

  test('allows reordering columns in the table via buttons', async ({
    page,
  }) => {
    const initialThs = await page
      .locator('.workflows-summary-table-header-cell')
      .all();

    await Promise.all(
      initialThs.map(async (th, idx) =>
        expect(th).toHaveAttribute(
          'data-testid',
          `workflows-summary-table-header-cell-${initialHeaders[idx]}`,
        ),
      ),
    );

    await page.getByTestId('filter-configuration-menu-button').click();
    await page
      .getByTestId('workflows-summary-table-configuration-button')
      .click();

    await expect(
      page.locator('#workflows-table-configuration-drawer'),
    ).toBeVisible();

    for (let i = 0; i < 3; i++) {
      await delayClick('orderable-list-item-Run ID-move-down-button', page);
    }

    const reorderedThs = await page
      .locator('.workflows-summary-table-header-cell')
      .all();

    await Promise.all(
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
  }, {
    project: {
      use: { isMobile },
    },
  }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(isMobile, 'This test is for Desktop only');

    const initialThs = await page
      .locator('.workflows-summary-table-header-cell')
      .all();

    await Promise.all(
      initialThs.map(async (th, idx) =>
        expect(th).toHaveAttribute(
          'data-testid',
          `workflows-summary-table-header-cell-${initialHeaders[idx]}`,
        ),
      ),
    );

    await page.getByTestId('filter-configuration-menu-button').click();
    await page
      .getByTestId('workflows-summary-table-configuration-button')
      .click();

    await expect(
      page.locator('#workflows-table-configuration-drawer'),
    ).toBeVisible();

    const sourceElement = page.getByTestId('orderable-list-item-Run ID');
    const targetElement = page.getByTestId('orderable-list-item-End');
    const sourceBox = await sourceElement.boundingBox();
    const targetBox = await targetElement.boundingBox();

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

    await page.getByTestId('drawer-close-button').click();

    const reorderedThs = await page
      .locator('.workflows-summary-table-header-cell')
      .all();

    await Promise.all(
      reorderedThs.map((th, idx) => {
        return expect(th).toHaveAttribute(
          'data-testid',
          `workflows-summary-table-header-cell-${reorderedHeaders[idx]}`,
        );
      }),
    );
  });
});
