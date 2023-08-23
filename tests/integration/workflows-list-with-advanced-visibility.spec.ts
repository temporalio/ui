import { expect, test } from '@playwright/test';

import {
  mockClusterApi,
  mockWorkflowApis,
  mockWorkflowsApis,
  waitForWorkflowsApis,
} from '~/test-utilities/mock-apis';

test.describe('Workflows List with Advanced Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowsApis(page);
    await mockWorkflowApis(page);

    await mockClusterApi(page, {
      visibilityStore: 'elasticsearch',
      persistenceStore: 'postgres,elasticsearch',
    });

    page.goto('/namespaces/default/workflows');

    await waitForWorkflowsApis(page);
  });

  test.describe('Manual Search', () => {
    test('Changes the url and updates filters on manual search', async ({
      page,
    }) => {
      await page.fill('#manual-search', 'WorkflowType="ImportantWorkflowType"');
      await page.click('[data-testid="manual-search-button"]');

      await expect(page).toHaveURL(
        /WorkflowType%3D%22ImportantWorkflowType%22/,
      );

      await page.getByTestId('workflow-type-filter-button').click();
      const workflowTypeValue = await page.inputValue('#workflow-type');
      expect(workflowTypeValue).toBe('ImportantWorkflowType');
      await page.waitForSelector(
        '[data-testid="workflow-count"][data-loaded="true"]',
      );

      await expect(page.getByTestId('workflow-count')).toHaveText(
        'Results 15 of 15 workflows',
      );
    });
  });

  test.describe('Workflow Filters', () => {
    for (const textFilter of [
      {
        name: 'WorkflowType',
        id: 'workflow-type',
        value: 'ImportantWorkflowType',
      },
      { name: 'WorkflowId', id: 'workflow-id', value: '002c98_Running' },
      { name: 'RunId', id: 'run-id', value: 'abc-123' },
    ]) {
      const { name, id, value } = textFilter;
      test(`${name} text filter sets the correct query and can be cleared`, async ({
        page,
      }) => {
        await page.getByTestId(`${id}-filter-button`).click();
        await page.locator(`#${id}`).type(value);

        const query = `${name}="${value}"`;
        const encodedQuery = encodeURIComponent(query);

        await expect(page).toHaveURL(new RegExp(encodedQuery));
        expect(await page.inputValue('#manual-search')).toBe(query);

        await page.getByRole('search').getByTestId('clear-input').click();

        await expect(page).not.toHaveURL(new RegExp(encodedQuery));
        expect(await page.inputValue('#manual-search')).toBe('');
      });
    }

    test('Execution Status filter sets the correct query', async ({ page }) => {
      await page.getByTestId('execution-status-filter-button').click();
      await page.getByRole('menuitem').filter({ hasText: 'Running' }).click();

      const query = 'ExecutionStatus="Running"';
      const urlEncodedQuery = /ExecutionStatus%3D%22Running%22/;

      await expect(page).toHaveURL(urlEncodedQuery);
      expect(await page.inputValue('#manual-search')).toBe(query);

      await page.getByRole('search').getByTestId('clear-input').click();

      await expect(page).not.toHaveURL(urlEncodedQuery);
      expect(await page.inputValue('#manual-search')).toBe('');
    });

    test('Execution Status filter sets the correct query for multiple values', async ({
      page,
    }) => {
      await page.getByTestId('execution-status-filter-button').click();
      await page.getByRole('menuitem').filter({ hasText: 'Running' }).click();
      await page.getByRole('menuitem').filter({ hasText: 'Failed' }).click();
      const query = '(ExecutionStatus="Running" OR ExecutionStatus="Failed")';
      const urlEncodedQuery =
        /%28ExecutionStatus%3D%22Running%22\+OR\+ExecutionStatus%3D%22Failed%22%29/;

      await expect(page).toHaveURL(urlEncodedQuery);
      expect(await page.inputValue('#manual-search')).toBe(query);

      await page.getByRole('menuitem').filter({ hasText: 'All' }).click();

      await expect(page).not.toHaveURL(urlEncodedQuery);
      expect(await page.inputValue('#manual-search')).toBe('');
    });

    test('should combine all three filters', async ({ page }) => {
      await page.getByTestId('execution-status-filter-button').click();
      await page.getByRole('menuitem').filter({ hasText: 'Running' }).click();

      await page.getByTestId('workflow-id-filter-button').click();
      await page.fill('#workflow-id', '002c98_Running');

      await page.getByTestId('workflow-type-filter-button').click();
      await page.fill('#workflow-type', 'ImportantWorkflowType');

      await expect(page).toHaveURL(
        /ExecutionStatus%3D%22Running%22\+AND\+WorkflowId%3D%22002c98_Running%22\+AND\+WorkflowType%3D%22ImportantWorkflowType%22/,
      );
    });

    test('should send the correct query for StartTime', async ({ page }) => {
      await page.click('#time-range-filter');
      await page.click(':text("15 minutes")');
      await expect(page).toHaveURL(/StartTime\+%3E/);
    });

    test('should send the correct query for CloseTime', async ({ page }) => {
      await page.click('#time-range-filter');
      await page.click(':text("3 hours")');
      await page.click(':text("End Time")');
      await expect(page).toHaveURL(/CloseTime\+%3E/);
    });
  });

  test.describe('Navigation with Filters', () => {
    test('keeps a single workflow filter after navigating to workflow history and back to workflow list', async ({
      page,
    }) => {
      await page.getByTestId('execution-status-filter-button').click();
      await page.getByRole('menuitem').filter({ hasText: 'Running' }).click();
      await page.click('body');
      await expect(page).toHaveURL(/ExecutionStatus%3D%22Running%22/);

      await page.getByRole('link', { name: '002c98_Running' }).first().click();

      await expect(page).toHaveURL(/\/history/);
      await page.getByTestId('back-to-workflows').click();
      await expect(page).toHaveURL(/ExecutionStatus%3D%22Running%22/);

      await page.waitForSelector(
        '[data-testid="workflow-count"][data-loaded="true"]',
      );

      await expect(page.getByTestId('workflow-count')).toHaveText(
        'Results 15 of 15 workflows',
      );
    });

    test('keeps workflow datetime filter after navigating away and back to workflow list', async ({
      page,
    }) => {
      await page.click('#time-range-filter');
      await page.getByText('3 hours').click();
      await page.getByText('End Time').click();
      await expect(page).toHaveURL(/CloseTime\+%3E/);
      await expect(page.locator('#time-range-filter')).toHaveText(
        ' 3 hours chevron-up  ',
      );
      expect(await page.inputValue('#manual-search')).toContain('CloseTime > ');
      await page.getByTestId('namespaces-button').click();
      await page.getByTestId('workflows-button').click();
      await expect(page).toHaveURL(/CloseTime\+%3E/);
      await expect(page.locator('#time-range-filter')).toHaveText(
        ' 3 hours chevron-down  ',
      );
      expect(await page.inputValue('#manual-search')).toContain('CloseTime > ');
    });

    test('keeps only the workflow datetime filter after navigating away and back to workflow list', async ({
      page,
    }) => {
      await page.click('#time-range-filter');
      await page.getByText('3 hours').click();
      await page.getByText('End Time').click();
      await page.getByTestId('execution-status-filter-button').click();
      await page.getByRole('menuitem').filter({ hasText: 'Running' }).click();
      await expect(page).toHaveURL(/ExecutionStatus%3D%22Running%22/);
      await expect(page).toHaveURL(/CloseTime\+%3E/);
      await page.getByTestId('namespaces-button').click();
      await page.getByTestId('workflows-button').click();
      await expect(page).toHaveURL(/CloseTime\+%3E/);
      await expect(page).not.toHaveURL(/ExecutionStatus%3D%22Running%22/);
    });

    test("doesn't keep workflow datetime filter after navigating to a workflow url with a query", async ({
      page,
    }) => {
      await page.click('#time-range-filter');
      await page.getByText('3 hours').click();
      await page.getByText('End Time').click();
      await expect(page).toHaveURL(/CloseTime\+%3E/);
      await expect(page.locator('#time-range-filter')).toHaveText(
        ' 3 hours chevron-up  ',
      );
      expect(await page.inputValue('#manual-search')).toContain('CloseTime > ');

      page.goto(
        '/namespaces/default/workflows?query=ExecutionStatus%3D%22Running%22',
      );

      await expect(page).toHaveURL(/ExecutionStatus%3D%22Running%22/);
      await expect(page).not.toHaveURL(/CloseTime\+%3E/);
      await expect(page.locator('#time-range-filter')).toHaveText(
        ' All Time chevron-down  ',
      );
      expect(await page.inputValue('#manual-search')).toBe(
        'ExecutionStatus="Running"',
      );
    });

    test("doesn't keep workflow datetime filter after clearing and entering a query into search", async ({
      page,
    }) => {
      await page.click('#time-range-filter');
      await page.getByText('3 hours').click();
      await page.getByText('End Time').click();
      await expect(page).toHaveURL(/CloseTime\+%3E/);
      await expect(page.locator('#time-range-filter')).toHaveText(
        ' 3 hours chevron-up  ',
      );
      expect(await page.inputValue('#manual-search')).toContain('CloseTime > ');

      await page.getByRole('search').getByTestId('clear-input').click();
      await page.type('#manual-search', 'ExecutionStatus="Running"');
      await page.getByTestId('manual-search-button').click();
      await expect(page).toHaveURL(/ExecutionStatus%3D%22Running%22/);
      await expect(page).not.toHaveURL(/CloseTime\+%3E/);
      await expect(page.locator('#time-range-filter')).toHaveText(
        ' All Time chevron-down  ',
      );
      expect(await page.inputValue('#manual-search')).toBe(
        'ExecutionStatus="Running"',
      );
    });

    test('keeps only the workflow datetime filter after navigating to a different namespace', async ({
      page,
    }) => {
      await page.click('#time-range-filter');
      await page.getByText('1 hour').click();
      await page.getByText('End Time').click();
      await page.getByTestId('execution-status-filter-button').click();
      await page.getByRole('menuitem').filter({ hasText: 'Running' }).click();
      await expect(page).toHaveURL(/ExecutionStatus%3D%22Running%22/);
      await expect(page).toHaveURL(/CloseTime\+%3E/);
      await expect(page.locator('#time-range-filter')).toHaveText(
        ' 1 hour chevron-down  ',
      );
      expect(await page.inputValue('#manual-search')).toContain('CloseTime > ');

      const namespaces = ['default', 'some-other-namespace'];
      await page.getByTestId('namespace-switcher').click();
      await expect(
        page.getByRole('option', { name: namespaces[0] }),
      ).toBeVisible();
      await page.getByRole('option', { name: namespaces[1] }).click();
      await expect(page.getByTestId('namespace-switcher')).toHaveValue(
        namespaces[1],
      );
      await expect(page).not.toHaveURL(/ExecutionStatus%3D%22Running%22/);
      await expect(page).toHaveURL(/CloseTime\+%3E/);
      await expect(page.locator('#time-range-filter')).toHaveText(
        ' 1 hour chevron-down  ',
      );
      expect(await page.inputValue('#manual-search')).toContain('CloseTime > ');
      await page.getByTestId('namespace-switcher').click();
      await page.getByRole('option', { name: namespaces[0] }).click();
      await expect(page.getByTestId('namespace-switcher')).toHaveValue(
        namespaces[0],
      );
      await expect(page).not.toHaveURL(/ExecutionStatus%3D%22Running%22/);
      await expect(page).toHaveURL(/CloseTime\+%3E/);
      await expect(page.locator('#time-range-filter')).toHaveText(
        ' 1 hour chevron-down  ',
      );
      expect(await page.inputValue('#manual-search')).toContain('CloseTime > ');
    });
  });
});
