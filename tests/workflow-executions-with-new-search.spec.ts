import { test, expect } from '@playwright/test';
import {
  evetHistoryApi,
  workflowsApi,
  workflowApi,
  mockClusterApiWithElasticsearch,
  mockClusterApiWithMysql,
} from '$utilities/mock-apis.js';

const workflowsUrl = '/namespaces/default/workflows';

test.describe('Workflow Executions List With Search', () => {
  test.beforeEach(async ({ page }) => {
    await mockClusterApiWithElasticsearch(page);
    await page.goto(workflowsUrl);
    await page.waitForRequest(workflowsApi);
  });

  test('should default to All for the time range', async ({ page }) => {
    expect(await page.locator('#time-range-filter').innerText().valueOf()).toBe(
      'All Time',
    );
  });

  test.describe('Workflow Manual Search', () => {
    test('should change url on manual search and update filters and show results count', async ({
      page,
    }) => {
      await page
        .locator('#manual-search')
        .fill('WorkflowType="ImportantWorkflowType"');
      await page.locator('[data-testid="manual-search-button"]').click();

      const result = encodeURIComponent('WorkflowType="ImportantWorkflowType"');
      expect(page.url()).toContain(result);

      await page.locator('[data-testid="workflow-type-filter-button"]').click();
      expect(await page.locator('#workflowType').inputValue()).toBe(
        'ImportantWorkflowType',
      );

      // expect(await page.locator('[data-testid="workflow-count"]').innerText().valueOf()).toBe('Results 15 of 15 workflows');
    });
  });

  test.describe('Workflow Filters', () => {
    test('should send the correct query for Workflow Type, autocomplete manual search and be clearable', async ({
      page,
    }) => {
      await page.locator('[data-testid="workflow-type-filter-button"]').click();

      await page.locator('#workflowType').fill('ImportantWorkflowType');
      await page.waitForResponse(workflowsApi);

      const result = encodeURIComponent('WorkflowType="ImportantWorkflowType"');
      expect(page.url()).toContain(result);
      expect(await page.locator('#manual-search').inputValue()).toBe(
        'WorkflowType="ImportantWorkflowType"',
      );

      // expect(await page.locator('[data-testid="workflow-count"]').innerText()).toBe(
      //   'Results 15 of 15 workflows',
      // );

      await page
        .locator(
          '.px-2 > .input-container > [data-testid="clear-input"] > .icon-button',
        )
        .click();
      await page.waitForResponse(workflowsApi);

      expect(page.url()).not.toContain(result);
    });

    test('should send the correct query for Workflow ID, autocomplete manual search and be clearable', async ({
      page,
    }) => {
      await page.locator('[data-testid="workflow-id-filter-button"]').click();

      await page.locator('#workflowId').fill('002c98_Running');
      await page.waitForResponse(workflowsApi);

      const result = encodeURIComponent('WorkflowId="002c98_Running"');
      expect(page.url()).toContain(result);
      expect(await page.locator('#manual-search').inputValue()).toBe(
        'WorkflowId="002c98_Running"',
      );
      // expect(await page.locator('[data-testid="workflow-count"]').innerText()).toBe(
      //   'Results 15 of 15 workflows'
      // );

      await page
        .locator(
          '.px-2 > .input-container > [data-testid="clear-input"] > .icon-button',
        )
        .click();
      await page.waitForResponse(workflowsApi);

      expect(page.url()).not.toContain(result);
    });

    test('should change url on single Execution Status change', async ({
      page,
    }) => {
      await page
        .locator('[data-testid="execution-status-filter-button"]')
        .click();
      await page.locator('[data-testid="Running"]').click();
      await page.waitForResponse(workflowsApi);

      const result = encodeURIComponent('ExecutionStatus="Running"');
      expect(page.url()).toContain(result);
      expect(await page.locator('#manual-search').inputValue()).toBe(
        'ExecutionStatus="Running"',
      );
      // expect(await page.locator('[data-testid="workflow-count"]').innerText()).toBe(
      //   'Results 15 of 15 workflows'
      // );
    });

    test('should change url on multiple Execution Status change', async ({
      page,
    }) => {
      await page
        .locator('[data-testid="execution-status-filter-button"]')
        .click();
      await page.locator('[data-testid="Running"]').click();
      await page.waitForResponse(workflowsApi);
      await page.locator('[data-testid="Failed"]').click();
      await page.waitForResponse(workflowsApi);

      const result =
        '%28ExecutionStatus%3D%22Running%22+OR+ExecutionStatus%3D%22Failed%22%29';
      expect(page.url()).toContain(result);
      expect(await page.locator('#manual-search').inputValue()).toBe(
        '(ExecutionStatus="Running" OR ExecutionStatus="Failed")',
      );
    });

    test('should clear Execution Status on All', async ({ page }) => {
      await page
        .locator('[data-testid="execution-status-filter-button"]')
        .click();
      await page.locator('[data-testid="Running"]').click();
      await page.waitForResponse(workflowsApi);
      await page.locator('[data-testid="Failed"]').click();
      await page.waitForResponse(workflowsApi);

      const result =
        '%28ExecutionStatus%3D%22Running%22+OR+ExecutionStatus%3D%22Failed%22%29';
      expect(page.url()).toContain(result);

      await page.locator('[data-testid="All"]').click();
      await page.waitForResponse(workflowsApi);

      expect(page.url()).not.toContain(result);
    });

    test('should combine all three filters', async ({ page }) => {
      await page
        .locator('[data-testid="execution-status-filter-button"]')
        .click();
      await page.locator('[data-testid="Running"]').click();
      await page.waitForResponse(workflowsApi);

      await page.locator('[data-testid="workflow-id-filter-button"]').click();
      await page.locator('#workflowId').fill('002c98_Running');
      await page.waitForResponse(workflowsApi);

      await page.locator('[data-testid="workflow-type-filter-button"]').click();
      await page.locator('#workflowType').fill('ImportantWorkflowType');
      await page.waitForResponse(workflowsApi);

      const result =
        'ExecutionStatus%3D%22Running%22+AND+WorkflowId%3D%22002c98_Running%22+AND+WorkflowType%3D%22ImportantWorkflowType%22';
      expect(page.url()).toContain(result);
      expect(await page.locator('#manual-search').inputValue()).toBe(
        'ExecutionStatus="Running" AND WorkflowId="002c98_Running" AND WorkflowType="ImportantWorkflowType"',
      );
    });

    test('should send the correct query for StartTime', async ({ page }) => {
      await page.locator('#time-range-filter').click();
      page.click('text=15 minutes');
      await page.waitForResponse(workflowsApi);

      expect(page.url()).toContain('StartTime+%3E');

      // expect(await page.locator('[data-testid="workflow-count"]').innerText()).toBe(
      //   'Results 15 of 15 workflows',
      // );
    });

    test('should send the correct query for CloseTime', async ({ page }) => {
      await page.locator('#time-range-filter').click();
      page.click('text=3 hours');
      await page.waitForResponse(workflowsApi);
      page.click('text=End Time');
      await page.waitForResponse(workflowsApi);

      expect(page.url()).toContain('CloseTime+%3E');

      // expect(await page.locator('[data-testid="workflow-count"]').innerText()).toBe(
      //   'Results 15 of 15 workflows',
      // );
    });

    test.describe('Workflow Filters with Navigation ', () => {
      test.skip('should keep single workflow filter after navigating away and back to workflow list', async ({
        page,
      }) => {
        await page
          .locator('[data-testid="execution-status-filter-button"]')
          .click();
        await page.locator('[data-testid="Running"]').click();
        await page.waitForResponse(workflowsApi);

        expect(page.url()).toContain(
          encodeURIComponent(`ExecutionStatus="Running"`),
        );

        await page
          .locator('.workflow-summary-row > .time-cell')
          .first()
          .click();

        await page.waitForResponse(workflowApi);
        await page.waitForResponse(evetHistoryApi);

        expect(page.url()).toContain(encodeURIComponent('/history'));
        await page.locator('[data-testid="back-to-workflows"]').click();

        expect(page.url()).toContain(
          encodeURIComponent(encodeURIComponent(`ExecutionStatus="Running"`)),
        );

        // expect(await page.locator('[data-testid="workflow-count"]').innerText()).toBe(
        //   'Results 15 of 15 workflows',
        // );
      });
    });
  });
});

test.describe('Workflow Executions List With Search using only MySql on 1.20', () => {
  test.beforeEach(async ({ page }) => {
    await mockClusterApiWithMysql(page);
    await page.goto(workflowsUrl);
    await page.waitForRequest(workflowsApi);
  });

  test('should default to All for the time range', async ({ page }) => {
    expect(await page.locator('#time-range-filter').innerText().valueOf()).toBe(
      'All Time',
    );
  });

  test.describe('Workflow Manual Search', () => {
    test('should change url on manual search and update filters and show results count', async ({
      page,
    }) => {
      await page
        .locator('#manual-search')
        .fill('WorkflowType="ImportantWorkflowType"');
      await page.locator('[data-testid="manual-search-button"]').click();
      const result = encodeURIComponent('WorkflowType="ImportantWorkflowType"');
      expect(page.url()).toContain(result);
      await page.locator('[data-testid="workflow-type-filter-button"]').click();
      expect(await page.locator('#workflowType').inputValue()).toBe(
        'ImportantWorkflowType',
      );
      // expect(await page.locator('[data-testid="workflow-count"]').innerText().valueOf()).toBe('Results 15 of 15 workflows');
    });
  });

  test.describe('Workflow Filters', () => {
    test('should send the correct query for Workflow Type, autocomplete manual search and be clearable', async ({
      page,
    }) => {
      await page.locator('[data-testid="workflow-type-filter-button"]').click();
      page.locator('#workflowType').fill('ImportantWorkflowType');
      await page.waitForResponse(workflowsApi);
      const result = encodeURIComponent('WorkflowType="ImportantWorkflowType"');
      expect(page.url()).toContain(result);
      expect(await page.locator('#manual-search').inputValue()).toBe(
        'WorkflowType="ImportantWorkflowType"',
      );
      // expect(await page.locator('[data-testid="workflow-count"]').innerText().valueOf()).toBe('Results 15 of 15 workflows');
      await page
        .locator(
          '.px-2 > .input-container > [data-testid="clear-input"] > .icon-button',
        )
        .click();
      await page.waitForResponse(workflowsApi);
      expect(page.url()).not.toContain(result);
    });

    test('should send the correct query for Workflow ID, autocomplete manual search and be clearable', async ({
      page,
    }) => {
      await page.locator('[data-testid="workflow-id-filter-button"]').click();
      await page.locator('#workflowId').fill('002c98_Running');
      await page.waitForResponse(workflowsApi);
      const result = encodeURIComponent('WorkflowId="002c98_Running"');
      expect(page.url()).toContain(result);
      expect(await page.locator('#manual-search').inputValue()).toBe(
        'WorkflowId="002c98_Running"',
      );
      // expect(await page.locator('[data-testid="workflow-count"]').innerText()).toBe(
      //   'Results 15 of 15 workflows'
      // );
      await page
        .locator(
          '.px-2 > .input-container > [data-testid="clear-input"] > .icon-button',
        )
        .click();
      await page.waitForResponse(workflowsApi);
      expect(page.url()).not.toContain(result);
    });
    test('should change url on single Execution Status change', async ({
      page,
    }) => {
      await page
        .locator('[data-testid="execution-status-filter-button"]')
        .click();
      await page.locator('[data-testid="Running"]').click();
      await page.waitForResponse(workflowsApi);
      const result = encodeURIComponent('ExecutionStatus="Running"');
      expect(page.url()).toContain(result);
      expect(await page.locator('#manual-search').inputValue()).toBe(
        'ExecutionStatus="Running"',
      );
      // expect(await page.locator('[data-testid="workflow-count"]').innerText()).toBe(
      //   'Results 15 of 15 workflows'
      // );
    });

    test('should change url on multiple Execution Status change', async ({
      page,
    }) => {
      await page
        .locator('[data-testid="execution-status-filter-button"]')
        .click();
      await page.locator('[data-testid="Running"]').click();
      await page.waitForResponse(workflowsApi);
      await page.locator('[data-testid="Failed"]').click();
      await page.waitForResponse(workflowsApi);
      const result =
        '%28ExecutionStatus%3D%22Running%22+OR+ExecutionStatus%3D%22Failed%22%29';
      expect(page.url()).toContain(result);
      expect(await page.locator('#manual-search').inputValue()).toBe(
        '(ExecutionStatus="Running" OR ExecutionStatus="Failed")',
      );
    });

    test('should clear Execution Status on All', async ({ page }) => {
      await page
        .locator('[data-testid="execution-status-filter-button"]')
        .click();
      await page.locator('[data-testid="Running"]').click();
      await page.waitForResponse(workflowsApi);
      await page.locator('[data-testid="Failed"]').click();
      await page.waitForResponse(workflowsApi);
      const result =
        '%28ExecutionStatus%3D%22Running%22+OR+ExecutionStatus%3D%22Failed%22%29';
      expect(page.url()).toContain(result);
      await page.locator('[data-testid="All"]').click();
      await page.waitForResponse(workflowsApi);
      expect(page.url()).not.toContain(result);
    });

    test('should combine all three filters', async ({ page }) => {
      await page
        .locator('[data-testid="execution-status-filter-button"]')
        .click();
      await page.locator('[data-testid="Running"]').click();
      await page.waitForResponse(workflowsApi);
      await page.locator('[data-testid="workflow-id-filter-button"]').click();
      await page.locator('#workflowId').fill('002c98_Running');
      await page.waitForResponse(workflowsApi);
      await page.locator('[data-testid="workflow-type-filter-button"]').click();
      await page.locator('#workflowType').fill('ImportantWorkflowType');
      await page.waitForResponse(workflowsApi);
      const result =
        'ExecutionStatus%3D%22Running%22+AND+WorkflowId%3D%22002c98_Running%22+AND+WorkflowType%3D%22ImportantWorkflowType%22';
      expect(page.url()).toContain(result);
      expect(await page.locator('#manual-search').inputValue()).toBe(
        'ExecutionStatus="Running" AND WorkflowId="002c98_Running" AND WorkflowType="ImportantWorkflowType"',
      );
    });

    test('should send the correct query for StartTime', async ({ page }) => {
      await page.locator('#time-range-filter').click();
      page.click('text=15 minutes');
      await page.waitForResponse(workflowsApi);
      expect(page.url()).toContain('StartTime+%3E');
      // expect(await page.locator('[data-testid="workflow-count"]').innerText()).toBe(
      //   'Results 15 of 15 workflows',
      // );
    });

    test('should send the correct query for CloseTime', async ({ page }) => {
      await page.locator('#time-range-filter').click();
      page.click('text=3 hours');
      await page.waitForResponse(workflowsApi);
      page.click('text=End Time');
      await page.waitForResponse(workflowsApi);
      expect(page.url()).toContain('CloseTime+%3E');
      // expect(await page.locator('[data-testid="workflow-count"]').innerText()).toBe(
      //   'Results 15 of 15 workflows',
      // );
    });

    test.describe('Workflow Filters with Navigation ', () => {
      test.skip('should keep single workflow filter after navigating away and back to workflow list', async ({
        page,
      }) => {
        await page
          .locator('[data-testid="execution-status-filter-button"]')
          .click();
        await page.locator('[data-testid="Running"]').click();
        await page.waitForResponse(workflowsApi);
        expect(page.url()).toContain(
          encodeURIComponent(`ExecutionStatus="Running"`),
        );
        await page
          .locator('.workflow-summary-row > .time-cell')
          .first()
          .click();
        await page.waitForResponse(workflowApi);
        await page.waitForResponse(evetHistoryApi);
        expect(page.url()).toContain(encodeURIComponent('/history'));
        await page.locator('[data-testid="back-to-workflows"]').click();
        expect(page.url()).toContain(
          encodeURIComponent(encodeURIComponent(`ExecutionStatus="Running"`)),
        );
        // expect(await page.locator('[data-testid="workflow-count"]').innerText()).toBe(
        //   'Results 15 of 15 workflows',
        // );
      });
    });
  });
});
