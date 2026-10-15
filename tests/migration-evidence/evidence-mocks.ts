import type { Page, Route } from '@playwright/test';

import type {
  EvidenceCatchAllApi,
  MigrationRouteSetup,
} from '../../scripts/vite-migration/route-manifest';

type MockInstaller = (...arguments_: unknown[]) => Promise<void>;
type MockExecution = Record<string, unknown> & {
  info: Record<string, unknown>;
};

const mockApisModulePath = '../test-utilities/mock-apis.ts';
const {
  MOCK_NEXUS_OPERATION,
  mockActivitiesApis,
  mockBatchOperationApis,
  mockGlobalApis,
  mockNamespaceApi,
  mockNamespaceApis,
  mockNamespaceWithNexusOperations,
  mockNexusOperationApi,
  mockNexusOperationsApis,
  mockRunningActivityExecution,
  mockScheduleApi,
  mockSchedulesApis,
  mockSearchAttributesApi,
  mockSettingsApi,
  mockStandaloneActivityApi,
  mockTaskQueuesApi,
  mockWorkersApi,
  mockWorkersPageApis,
  mockWorkflowApis,
  mockWorkflowsApis,
  WORKFLOWS_API,
} = (await import(mockApisModulePath)) as {
  MOCK_NEXUS_OPERATION: MockExecution;
  mockActivitiesApis: MockInstaller;
  mockBatchOperationApis: MockInstaller;
  mockGlobalApis: MockInstaller;
  mockNamespaceApi: MockInstaller;
  mockNamespaceApis: MockInstaller;
  mockNamespaceWithNexusOperations: MockInstaller;
  mockNexusOperationApi: MockInstaller;
  mockNexusOperationsApis: MockInstaller;
  mockRunningActivityExecution: MockExecution;
  mockScheduleApi: MockInstaller;
  mockSchedulesApis: MockInstaller;
  mockSearchAttributesApi: MockInstaller;
  mockSettingsApi: MockInstaller;
  mockStandaloneActivityApi: MockInstaller;
  mockTaskQueuesApi: MockInstaller;
  mockWorkersApi: MockInstaller;
  mockWorkersPageApis: MockInstaller;
  mockWorkflowApis: MockInstaller;
  mockWorkflowsApis: MockInstaller;
  WORKFLOWS_API: string;
};

const mockWorkflowModulePath = '../test-utilities/mocks/workflow.ts';
const { mockWorkflow } = (await import(mockWorkflowModulePath)) as {
  mockWorkflow: {
    workflowExecutionInfo: Record<string, unknown>;
  };
};

const NEWS_FEED_URL = 'https://newsfeed.temporal.io/feed_en.json';
const NEWS_FEED_RESPONSE = {
  server_time: '2025-01-15T12:00:00Z',
  items: [
    {
      id: 1,
      title: 'Deterministic migration evidence news',
      content: 'Deterministic migration evidence news item.',
      priority: 1,
      tags: ['migration-evidence'],
      published_at: '2025-01-10T12:00:00Z',
      expires_at: '2025-12-31T12:00:00Z',
    },
  ],
};

type CatchAllResponse = {
  key: EvidenceCatchAllApi;
  status: number;
  json: Record<string, unknown>;
};

const catchAllResponse = (route: Route): CatchAllResponse => {
  const { pathname } = new URL(route.request().url());

  if (/\/nexus\/endpoints\/[^/]+$/.test(pathname)) {
    return {
      key: 'nexus-endpoint-detail',
      status: 200,
      json: {
        endpoint: {
          id: 'op-abc-123',
          version: '1',
          spec: {
            name: 'my-endpoint',
            target: {
              worker: {
                namespace: 'default',
                taskQueue: 'my-task-queue',
              },
            },
          },
        },
      },
    };
  }

  if (pathname.endsWith('/nexus/endpoints')) {
    return {
      key: 'nexus-endpoints-list',
      status: 200,
      json: {
        endpoints: [
          {
            id: 'op-abc-123',
            version: '1',
            spec: {
              name: 'my-endpoint',
              target: {
                worker: {
                  namespace: 'default',
                  taskQueue: 'my-task-queue',
                },
              },
            },
          },
        ],
      },
    };
  }

  if (/\/worker-deployments\/[^/]+$/.test(pathname)) {
    return {
      key: 'worker-deployment-detail',
      status: 200,
      json: {
        conflictToken: '',
        workerDeploymentInfo: {
          name: 'my-deployment',
          createTime: {},
          routingConfig: {},
          lastModifierIdentity: '',
          versionSummaries: [],
        },
      },
    };
  }

  if (pathname.endsWith('/worker-deployments')) {
    return {
      key: 'worker-deployments-list',
      status: 200,
      json: { nextPageToken: '', workerDeployments: [] },
    };
  }

  if (pathname.includes('/worker-deployment-versions/')) {
    return {
      key: 'worker-deployment-version',
      status: 200,
      json: {
        workerDeploymentVersionInfo: {
          version: 'my-deployment.build-abc123',
          deploymentName: 'my-deployment',
          createTime: {},
          routingChangedTime: {},
          currentSinceTime: {},
          rampingSinceTime: {},
          rampPercentage: 0,
          taskQueueInfos: [],
          drainageInfo: {},
          metadata: { entries: {} },
        },
      },
    };
  }

  if (pathname.includes('/workers/describe/worker-instance-1')) {
    return {
      key: 'worker-detail',
      status: 200,
      json: {
        workerInfo: {
          workerHeartbeat: {
            workerInstanceKey: 'worker-instance-1',
            status: 'WORKER_STATUS_ALIVE',
            deploymentVersion: {
              deploymentName: 'my-deployment',
              buildId: 'build-abc123',
            },
            taskQueue: 'my-task-queue',
            workerIdentity: 'worker-1@host-1',
            hostInfo: { hostName: 'host-1.example.com' },
            startTime: { seconds: '1711500000', nanos: 0 },
            sdkName: 'temporal-go',
            sdkVersion: '1.41.0',
          },
        },
      },
    };
  }

  if (pathname.endsWith('/batch-operations')) {
    return {
      key: 'batch-operations-list',
      status: 200,
      json: { nextPageToken: null, operationInfo: [] },
    };
  }

  if (pathname.includes('/archived-workflows')) {
    return {
      key: 'archived-workflows-list',
      status: 200,
      json: { executions: [], nextPageToken: '' },
    };
  }

  if (pathname.endsWith('/history.json')) {
    return {
      key: 'raw-history',
      status: 200,
      json: { history: { events: [] } },
    };
  }

  if (/\/workflows\/[^/]+\/history(?:-reverse)?$/.test(pathname)) {
    return {
      key: 'archival-history',
      status: 200,
      json: { history: { events: [] }, nextPageToken: null, archived: true },
    };
  }

  return {
    key: 'unmatched',
    status: 501,
    json: {
      message: 'No deterministic migration evidence fixture',
      request: {
        method: route.request().method(),
        path: pathname,
      },
    },
  };
};

const installCatchAllApi = async (page: Page): Promise<void> => {
  await page.route('**/api/**', (route) => {
    const response = catchAllResponse(route);
    return route.fulfill({
      headers: { 'x-migration-evidence-mock': response.key },
      json: response.json,
      status: response.status,
    });
  });
};

const installNewsFeed = async (page: Page): Promise<void> => {
  await page.route(`${NEWS_FEED_URL}*`, (route) =>
    route.fulfill({
      json: NEWS_FEED_RESPONSE,
    }),
  );
};

const escapeHtml = (value: string): string => {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

const installRenderFrame = async (page: Page): Promise<void> => {
  await page.route('**/render?**', (route) => {
    if (route.request().frame() === page.mainFrame()) return route.fallback();

    const content =
      new URL(route.request().url()).searchParams.get('content') ?? '';
    return route.fulfill({
      body: `<html><body><main>${escapeHtml(content)}</main></body></html>`,
      contentType: 'text/html',
    });
  });
};

const installDeterministicWorkflows = async (page: Page): Promise<void> => {
  await page.route(WORKFLOWS_API, (route) =>
    route.fulfill({
      json: {
        executions: [mockWorkflow.workflowExecutionInfo],
        nextPageToken: null,
      },
    }),
  );
};

const installWorkflowQueries = async (page: Page): Promise<void> => {
  await page.route(
    /\/api\/v1\/namespaces\/[^/]+\/workflows\/[^/]+\/query\/__(?:stack_trace|temporal_workflow_metadata)/,
    (route) =>
      route.fulfill({
        json: {
          queryRejected: null,
          queryResult: { payloads: [] },
        },
      }),
  );
};

export const installNavigationEvidenceMocks = async (
  page: Page,
  targetPath: string,
): Promise<void> => {
  if (!/\/namespaces\/[^/]+\/workflows$/.test(targetPath)) return;

  await mockWorkflowsApis(page);
  await installDeterministicWorkflows(page);
};

const installBaseEvidenceMocks = async (page: Page): Promise<void> => {
  await installCatchAllApi(page);
  await installNewsFeed(page);
  await installRenderFrame(page);
};

const installSetupEvidenceMocks = async (
  page: Page,
  setup: MigrationRouteSetup,
): Promise<void> => {
  if (setup === 'none') return;
  if (setup === 'global') {
    await mockGlobalApis(page);
    return;
  }
  if (setup === 'namespace' || setup === 'nexus-endpoint') {
    await mockNamespaceApis(page);
    return;
  }
  if (setup === 'workflow-list') {
    await mockWorkflowsApis(page);
    await installDeterministicWorkflows(page);
    return;
  }
  if (setup === 'workflow-latest') {
    await installDeterministicWorkflows(page);
    await Promise.all([
      mockWorkflowApis(page),
      installWorkflowQueries(page),
      mockWorkersApi(page),
    ]);
    return;
  }
  if (setup === 'workflow-detail') {
    await Promise.all([
      mockWorkflowApis(page),
      installWorkflowQueries(page),
      mockWorkersApi(page),
    ]);
    return;
  }
  if (setup === 'workflow-start') {
    await Promise.all([
      mockNamespaceApis(page),
      mockSettingsApi(page, { StartWorkflowDisabled: false }),
      mockTaskQueuesApi(page),
    ]);
    return;
  }
  if (setup === 'worker-list') {
    await mockWorkersPageApis(page);
    return;
  }
  if (setup === 'worker-deployment') {
    await mockNamespaceApis(page);
    return;
  }
  if (setup === 'schedule-list') {
    await mockSchedulesApis(page);
    return;
  }
  if (setup === 'schedule-detail') {
    await Promise.all([
      mockSchedulesApis(page),
      mockScheduleApi(page),
      mockWorkflowsApis(page),
    ]);
    await installDeterministicWorkflows(page);
    return;
  }
  if (setup === 'activity-list') {
    await mockActivitiesApis(page);
    return;
  }
  if (setup === 'activity-detail') {
    const completedActivity = {
      ...mockRunningActivityExecution,
      info: {
        ...mockRunningActivityExecution.info,
        status: 'ACTIVITY_EXECUTION_STATUS_COMPLETED',
        runState: 'PENDING_ACTIVITY_STATE_UNSPECIFIED',
        closeTime: '2025-01-01T00:01:00Z',
      },
    } as typeof mockRunningActivityExecution;
    await Promise.all([
      mockNamespaceApis(page),
      mockStandaloneActivityApi(page, () => completedActivity),
    ]);
    return;
  }
  if (setup === 'nexus-operation-list') {
    await mockNexusOperationsApis(page);
    return;
  }
  if (setup === 'nexus-operation-detail') {
    await Promise.all([
      mockGlobalApis(page),
      mockNamespaceWithNexusOperations(page),
      mockNexusOperationApi(page, {
        ...MOCK_NEXUS_OPERATION,
        info: {
          ...MOCK_NEXUS_OPERATION.info,
          status: 'NEXUS_OPERATION_EXECUTION_STATUS_SUCCEEDED',
        },
      }),
      mockSearchAttributesApi(page),
    ]);
    return;
  }
  if (setup === 'batch-operation') {
    await Promise.all([mockNamespaceApis(page), mockBatchOperationApis(page)]);
    return;
  }
  if (setup === 'archival') {
    await Promise.all([
      mockGlobalApis(page),
      mockNamespaceApi(page, true),
      mockSearchAttributesApi(page),
    ]);
    return;
  }
  if (setup === 'task-queue') {
    await Promise.all([
      mockWorkflowsApis(page),
      mockTaskQueuesApi(page),
      mockWorkersApi(page),
    ]);
    await installDeterministicWorkflows(page);
  }
};

export const installEvidenceMocks = async (
  page: Page,
  setup: MigrationRouteSetup,
): Promise<void> => {
  await installBaseEvidenceMocks(page);
  await installSetupEvidenceMocks(page, setup);
};

export const installClientNavigationEvidenceMocks = async (
  page: Page,
  targetSetup: MigrationRouteSetup,
): Promise<void> => {
  await installBaseEvidenceMocks(page);
  await installSetupEvidenceMocks(page, 'global');
  if (targetSetup !== 'global') {
    await installSetupEvidenceMocks(page, targetSetup);
  }
};
