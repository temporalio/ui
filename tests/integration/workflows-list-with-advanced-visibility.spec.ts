import { test, expect } from '@playwright/test';
import {
  mockClusterApi,
  mockWorkflowApis,
  mockWorkflowsApis,
  waitForWorkflowsApis,
  waitForWorkflowApis,
  WORKFLOWS_COUNT_API,
  WORKFLOWS_API,
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

      const result = encodeURIComponent('WorkflowType="ImportantWorkflowType"');
      expect(page.url()).toContain(result);

      await page.click('[data-testid="workflow-type-filter-button"]');
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

        await page.waitForURL(`**/namespaces/default/workflows?query=*`);

        expect(page.url()).toContain(encodedQuery);
        expect(await page.inputValue('#manual-search')).toBe(query);

        await page.getByRole('search').getByTestId('clear-input').click();

        expect(page.url()).not.toContain(encodedQuery);
        expect(await page.inputValue('#manual-search')).toBe('');
      });
    }

    test('Execution Status filter sets the correct query', async ({ page }) => {
      await page.getByTestId('execution-status-filter-button').click();
      await page.getByTestId('Running').click();

      await page.waitForURL('**/namespaces/default/workflows?query=*');

      const query = 'ExecutionStatus="Running"';
      const urlEncodedQuery = 'ExecutionStatus%3D%22Running%22';

      expect(page.url()).toContain(urlEncodedQuery);
      expect(await page.inputValue('#manual-search')).toBe(query);

      await page.getByRole('search').getByTestId('clear-input').click();

      expect(page.url()).not.toContain(urlEncodedQuery);
      expect(await page.inputValue('#manual-search')).toBe('');
    });

    test('Execution Status filter sets the correct query for multiple values', async ({
      page,
    }) => {
      await page.getByTestId('execution-status-filter-button').click();
      await page.getByTestId('Running').click();
      await page.getByTestId('Failed').click();

      await page.waitForURL('**/namespaces/default/workflows?query=*');

      const query = '(ExecutionStatus="Running" OR ExecutionStatus="Failed")';
      const urlEncodedQuery =
        '%28ExecutionStatus%3D%22Running%22+OR+ExecutionStatus%3D%22Failed%22%29';

      expect(page.url()).toContain(urlEncodedQuery);
      expect(await page.inputValue('#manual-search')).toBe(query);

      await page.getByTestId('All').click();

      await page.waitForURL(`**/namespaces/default/workflows`);

      expect(page.url()).not.toContain(urlEncodedQuery);
      expect(await page.inputValue('#manual-search')).toBe('');
    });

    test('should combine all three filters', async ({ page }) => {
      await page.click('[data-testid="execution-status-filter-button"]');
      await page.click('[data-testid="Running"]');

      await page.click('[data-testid="workflow-id-filter-button"]');
      await page.fill('#workflow-id', '002c98_Running');

      await page.click('[data-testid="workflow-type-filter-button"]');
      await page.fill('#workflow-type', 'ImportantWorkflowType');

      await page.waitForURL(
        '**/namespaces/default/workflows?query=ExecutionStatus*+AND+WorkflowId*+AND+WorkflowType*',
      );

      expect(page.url()).toContain(
        'ExecutionStatus%3D%22Running%22+AND+WorkflowId%3D%22002c98_Running%22+AND+WorkflowType%3D%22ImportantWorkflowType%22',
      );
    });

    test('should send the correct query for StartTime', async ({ page }) => {
      await page.click('#time-range-filter');
      await page.click(':text("15 minutes")');
      await page.waitForURL('**/namespaces/default/workflows?query=*');
      expect(page.url()).toContain('StartTime+%3E');
    });

    test('should send the correct query for CloseTime', async ({ page }) => {
      await page.click('#time-range-filter');
      await page.click(':text("3 hours")');
      await page.click(':text("End Time")');
      await page.waitForURL('**/namespaces/default/workflows?query=*');
      expect(page.url()).toContain('CloseTime+%3E');
    });
  });

  test.describe('Navigation with Filters', () => {
    test('keeps a single workflow filter after navigating to workflow history and back to workflow list', async ({
      page,
    }) => {
      await page.click('[data-testid="execution-status-filter-button"]');
      await page.click('[data-testid="Running"]');
      await page.click('body'); // close the Workflow Status filter dropdown
      await page.waitForURL('**/namespaces/default/workflows?query=*');
      expect(page.url()).toContain(
        encodeURIComponent(`ExecutionStatus="Running"`),
      );

      await page
        .locator('.workflows-summary-configurable-table-row')
        .first()
        .click();

      await waitForWorkflowApis(page);
      expect(page.url()).toContain('/history');
      await page.click('[data-testid="back-to-workflows"]');
      await page.waitForURL('**/namespaces/default/workflows?query=*');

      expect(page.url()).toContain(
        encodeURIComponent(`ExecutionStatus="Running"`),
      );

      await page.waitForSelector(
        '[data-testid="workflow-count"][data-loaded="true"]',
      );

      await expect(page.getByTestId('workflow-count')).toHaveText(
        'Results 15 of 15 workflows',
      );
    });

    test('should keep workflow datetime filter after navigating away and back to workflow list', async ({
      page,
    }) => {
      await page.click('#time-range-filter');
      await page.getByText('3 hours').click();
      await page.getByText('End Time').click();
      await page.waitForURL('**/namespaces/default/workflows?query=*');
      expect(page.url()).toContain('CloseTime+%3E');
      await expect(page.locator('#time-range-filter')).toHaveText('3 hours');
      expect(await page.inputValue('#manual-search')).toContain('CloseTime > ');
      await page.getByTestId('namespaces-button').click();
      await page.waitForURL('**/namespaces');
      await page.getByTestId('workflows-button').click();
      await page.waitForURL('**/namespaces/default/workflows?query=*');
      expect(page.url()).toContain('CloseTime+%3E');
      await expect(page.locator('#time-range-filter')).toHaveText('3 hours');
      expect(await page.inputValue('#manual-search')).toContain('CloseTime > ');
    });

    test('keeps only the workflow datetime filter after navigating away and back to workflow list', async ({
      page,
    }) => {
      await page.click('#time-range-filter');
      await page.getByText('3 hours').click();
      await page.getByText('End Time').click();
      await page.getByTestId('execution-status-filter-button').click();
      await page.getByTestId('Running').click();
      await page.waitForURL('**/namespaces/default/workflows?query=*');
      expect(page.url()).toContain('ExecutionStatus%3D%22Running%22');
      expect(page.url()).toContain('CloseTime+%3E');
      await page.getByTestId('namespaces-button').click();
      await page.waitForURL('**/namespaces');
      await page.getByTestId('workflows-button').click();
      await page.waitForURL('**/namespaces/default/workflows?query=*');
      expect(page.url()).toContain('CloseTime+%3E');
      expect(page.url()).not.toContain('ExecutionStatus%3D%22Running%22');
    });

    test("doesn't keep workflow datetime filter after navigating to a workflow url with a query", async ({
      page,
    }) => {
      await page.click('#time-range-filter');
      await page.getByText('3 hours').click();
      await page.getByText('End Time').click();
      await page.waitForURL('**/namespaces/default/workflows?query=*');
      expect(page.url()).toContain('CloseTime+%3E');
      await expect(page.locator('#time-range-filter')).toHaveText('3 hours');
      expect(await page.inputValue('#manual-search')).toContain('CloseTime > ');

      page.goto(
        '/namespaces/default/workflows?query=ExecutionStatus%3D%22Running%22',
      );

      await waitForWorkflowsApis(page);
      expect(page.url()).toContain('Running');
      expect(page.url()).not.toContain('CloseTime+%3E');
      await expect(page.locator('#time-range-filter')).toHaveText('All Time');
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
      await page.waitForURL('**/namespaces/default/workflows?query=*');
      expect(page.url()).toContain('CloseTime+%3E');
      await expect(page.locator('#time-range-filter')).toHaveText('3 hours');
      expect(await page.inputValue('#manual-search')).toContain('CloseTime > ');

      await page.getByRole('search').getByTestId('clear-input').click();
      await page.type('#manual-search', 'ExecutionStatus="Running"');
      await page.getByTestId('manual-search-button').click();
      await page.waitForURL('**/namespaces/*/workflows?query=*');
      expect(page.url()).toContain('Running');
      expect(page.url()).not.toContain('CloseTime+%3E');
      await expect(page.locator('#time-range-filter')).toHaveText('All Time');
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
      await page.getByTestId('Running').click();
      await page.waitForURL('**/namespaces/default/workflows?query=*');
      expect(page.url()).toContain('ExecutionStatus%3D%22Running%22');
      expect(page.url()).toContain('CloseTime+%3E');
      await expect(page.locator('#time-range-filter')).toHaveText('1 hour');
      expect(await page.inputValue('#manual-search')).toContain('CloseTime > ');

      const namespaces = ['default', 'some-other-namespace'];
      await page.getByTestId('namespace-select-button').click();
      await expect(page.getByTestId('namespace-select-list')).toContainText(
        namespaces[0],
      );
      await page.click('[data-test="namespace-list"] > :nth-child(2)');
      await page.waitForURL(`**/namespaces/${namespaces[1]}/workflows?query=*`);
      await expect(page.getByTestId('namespace-select-button')).toHaveText(
        namespaces[1],
      );
      expect(page.url()).not.toContain('ExecutionStatus%3D%22Running%22');
      expect(page.url()).toContain('CloseTime+%3E');
      await expect(page.locator('#time-range-filter')).toHaveText('1 hour');
      expect(await page.inputValue('#manual-search')).toContain('CloseTime > ');
      await page.getByTestId('namespace-select-button').click();
      await page.getByTestId('namespace-list-item').first().click();
      await page.waitForURL(`**/namespaces/${namespaces[0]}/workflows?query=*`);
      await expect(page.getByTestId('namespace-select-button')).toHaveText(
        namespaces[0],
      );
      expect(page.url()).not.toContain('ExecutionStatus%3D%22Running%22');
      expect(page.url()).toContain('CloseTime+%3E');
      await expect(page.locator('#time-range-filter')).toHaveText('1 hour');
      expect(await page.inputValue('#manual-search')).toContain('CloseTime > ');
    });
  });
});
