import { expect, type Page, test } from '@playwright/test';

import {
  MOCK_NEXUS_OPERATION,
  mockActivitiesApis,
  mockClusterApi,
  mockNexusOperationsApis,
  mockRunningActivityExecution,
  mockSchedulesApis,
  mockWorkersPageApis,
  mockWorkflowsApis,
  NEXUS_OPERATIONS_API,
  STANDALONE_ACTIVITIES_LIST_API,
  WORKERS_API,
  WORKFLOWS_API,
} from '~/test-utilities/mock-apis';
import {
  mockListSchedule,
  SCHEDULES_API,
} from '~/test-utilities/mocks/schedules';

const tables = [
  {
    name: 'Workflows',
    path: 'workflows',
    column: 'Workflow ID',
    mock: mockWorkflowsApis,
    api: WORKFLOWS_API,
    response: (names: string[]) => ({
      executions: names.map((name) => ({
        execution: { workflowId: name, runId: `${name}-run` },
        type: { name: 'RefreshTest' },
        status: 'Running',
        startTime: '2026-01-01T00:00:00Z',
        searchAttributes: { indexedFields: {} },
      })),
      nextPageToken: '',
    }),
  },
  {
    name: 'Schedules',
    path: 'schedules',
    column: 'Schedule ID',
    mock: mockSchedulesApis,
    api: SCHEDULES_API,
    response: (names: string[]) => ({
      schedules: names.map((name) => ({
        ...mockListSchedule,
        scheduleId: name,
      })),
      nextPageToken: '',
    }),
  },
  {
    name: 'Standalone Activities',
    path: 'activities',
    column: 'Activity ID',
    mock: async (page: Page) => {
      await mockActivitiesApis(page);
      await mockClusterApi(page, {
        serverVersion: '1.32.0',
        visibilityStore: 'elasticsearch',
        persistenceStore: 'postgres,elasticsearch',
      });
    },
    api: STANDALONE_ACTIVITIES_LIST_API,
    response: (names: string[]) => ({
      executions: names.map((name) => ({
        ...mockRunningActivityExecution.info,
        activityId: name,
        runId: `${name}-run`,
      })),
      nextPageToken: '',
    }),
  },
  {
    name: 'Standalone Nexus Operations',
    path: 'nexus-operations',
    column: 'Operation ID',
    mock: mockNexusOperationsApis,
    api: NEXUS_OPERATIONS_API,
    response: (names: string[]) => ({
      operations: names.map((name) => ({
        ...MOCK_NEXUS_OPERATION.info,
        operationId: name,
        runId: `${name}-run`,
      })),
      nextPageToken: '',
    }),
  },
  {
    name: 'Workers',
    path: 'workers',
    column: 'Instance',
    mock: mockWorkersPageApis,
    api: WORKERS_API,
    response: (names: string[]) => ({
      workersInfo: names.map((name) => ({
        workerHeartbeat: {
          workerInstanceKey: name,
          workerIdentity: `${name}-identity`,
          status: 'WORKER_STATUS_ALIVE',
          taskQueue: 'refresh-test',
          sdkName: 'temporal-go',
          sdkVersion: '1.41.0',
        },
      })),
      nextPageToken: '',
    }),
  },
  {
    name: 'Worker Deployments',
    path: 'workers/deployments',
    column: 'Deployment',
    mock: mockWorkersPageApis,
    api: /\/api\/v1\/namespaces\/[^/]+\/worker-deployments(\?.*)?$/,
    response: (names: string[]) => ({
      workerDeployments: names.map((name) => ({
        name,
        createTime: '2026-01-01T00:00:00Z',
        routingConfig: {},
      })),
      nextPageToken: '',
    }),
  },
];

for (const table of tables) {
  test(`${table.name} preserves sorting on Refresh, clears it explicitly, and resets on browser reload`, async ({
    page,
  }) => {
    await table.mock(page);
    let names = ['Charlie', 'Alpha', 'Bravo'];
    await page.route(table.api, (route) =>
      route.fulfill({ json: table.response(names) }),
    );
    await page.goto(`/namespaces/default/${table.path}`);

    const rowNames = page.locator('tbody').getByRole('link', {
      name: /^(Alpha|Bravo|Charlie|Delta|Echo|Foxtrot|Golf|Hotel|India)$/,
    });
    const sortButton = page.getByRole('button', {
      name: table.column,
      exact: true,
    });
    const header = page.getByRole('columnheader').filter({ has: sortButton });
    const refreshButton = page.getByRole('button', { name: /^Refresh/ });
    const banner = page.getByTestId('table-sort-banner');

    await expect(rowNames).toHaveText(names);
    await sortButton.click();
    await expect(rowNames).toHaveText(['Alpha', 'Bravo', 'Charlie']);

    names = ['Foxtrot', 'Delta', 'Echo'];
    await Promise.all([page.waitForResponse(table.api), refreshButton.click()]);
    await expect(rowNames).toHaveText(['Delta', 'Echo', 'Foxtrot']);
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await expect(banner).toContainText(`Sorted by ${table.column}`);

    await sortButton.click();
    await expect(rowNames).toHaveText(['Foxtrot', 'Echo', 'Delta']);
    names = ['Hotel', 'Golf', 'India'];
    await Promise.all([page.waitForResponse(table.api), refreshButton.click()]);
    await expect(rowNames).toHaveText(['India', 'Hotel', 'Golf']);
    await expect(header).toHaveAttribute('aria-sort', 'descending');

    await page.getByRole('button', { name: 'Clear sort', exact: true }).click();
    await expect(rowNames).toHaveText(names);
    await expect(banner).toHaveCount(0);
    await Promise.all([page.waitForResponse(table.api), refreshButton.click()]);
    await expect(rowNames).toHaveText(names);
    await expect(header).not.toHaveAttribute('aria-sort');

    await sortButton.click();
    await expect(rowNames).toHaveText(['Golf', 'Hotel', 'India']);
    await page.reload();
    await expect(rowNames).toHaveText(names);
    await expect(header).not.toHaveAttribute('aria-sort');
    await expect(banner).toHaveCount(0);
  });
}
