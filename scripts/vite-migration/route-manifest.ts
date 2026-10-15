export const migrationRouteFamilies = [
  'application',
  'authentication',
  'namespaces',
  'nexus-endpoints',
  'workflows',
  'workflow-details',
  'worker-deployments',
  'workers',
  'task-queues',
  'schedules',
  'nexus-operations',
  'catalog',
  'batch-operations',
  'archival',
  'agents',
  'activities',
  'event-import',
  'system',
] as const;

export const migrationRouteSetups = [
  'none',
  'global',
  'namespace',
  'workflow-list',
  'workflow-detail',
  'workflow-latest',
  'workflow-start',
  'worker-list',
  'worker-deployment',
  'task-queue',
  'schedule-list',
  'schedule-detail',
  'activity-list',
  'activity-detail',
  'nexus-operation-list',
  'nexus-operation-detail',
  'batch-operation',
  'archival',
  'nexus-endpoint',
] as const;

export type MigrationRouteFamily = (typeof migrationRouteFamilies)[number];
export type MigrationRouteSetup = (typeof migrationRouteSetups)[number];
export const evidenceCatchAllApis = [
  'nexus-endpoints-list',
  'nexus-endpoint-detail',
  'worker-detail',
  'worker-deployments-list',
  'worker-deployment-detail',
  'worker-deployment-version',
  'batch-operations-list',
  'archived-workflows-list',
  'archival-history',
  'raw-history',
  'unmatched',
] as const;
export type EvidenceCatchAllApi = (typeof evidenceCatchAllApis)[number];
export const evidenceKnownConsoleErrors = [
  'sandboxed-render-script',
  'error-status-json-parse',
  'http-not-found-resource',
  'svelte-not-found-navigation',
] as const;
export type EvidenceKnownConsoleError =
  (typeof evidenceKnownConsoleErrors)[number];
export const evidenceKnownPageErrors = [
  'detached-resize-observer-element',
] as const;
export type EvidenceKnownPageError = (typeof evidenceKnownPageErrors)[number];
export type MigrationRouteBehavior =
  | {
      kind: 'render';
      finalPath: string;
      httpStatus: 200;
    }
  | {
      kind: 'redirect';
      finalPath: string;
      httpStatus: 200;
      mechanism: 'client';
    }
  | {
      kind: 'not-found';
      finalPath: string;
      httpStatus: 200 | 404;
      appStatus: 404;
    }
  | {
      kind: 'server-response';
      finalPath: string;
      httpStatus: 200;
    };

export type MigrationRoute = {
  id: string;
  source: string;
  routePattern: string;
  url: string;
  family: MigrationRouteFamily;
  setup: MigrationRouteSetup;
  expected: MigrationRouteBehavior;
  availability: 'production' | 'development-only';
  approvedCatchAllApis: readonly EvidenceCatchAllApi[];
  approvedConsoleErrors: readonly EvidenceKnownConsoleError[];
  approvedPageErrors: readonly EvidenceKnownPageError[];
};

type MigrationRouteInput = Omit<
  MigrationRoute,
  | 'availability'
  | 'approvedCatchAllApis'
  | 'approvedConsoleErrors'
  | 'approvedPageErrors'
> & {
  availability?: MigrationRoute['availability'];
  approvedCatchAllApis?: readonly EvidenceCatchAllApi[];
  approvedConsoleErrors?: readonly EvidenceKnownConsoleError[];
  approvedPageErrors?: readonly EvidenceKnownPageError[];
};

const namespace = 'default';
const workflowId = '09db15_Running';
const runId = '4284ef9a-947f-4db2-bf15-dbc377e71fa6';
const workflow = `/namespaces/${namespace}/workflows/${workflowId}/${runId}`;
const activityId = 'greet-activity';
const activityRunId = '2d2e1234-5678-90ab-cdef-1234567890ab';
const activity = `/namespaces/${namespace}/activities/${activityId}/${activityRunId}`;
const operationId = 'op-abc-123';
const operationRunId = 'run-abc-123';
const operation = `/namespaces/${namespace}/nexus-operations/${operationId}/${operationRunId}`;
const deployment = 'my-deployment';

const render = (finalPath: string): MigrationRouteBehavior => ({
  kind: 'render',
  finalPath,
  httpStatus: 200,
});

const redirect = (finalPath: string): MigrationRouteBehavior => ({
  kind: 'redirect',
  finalPath,
  httpStatus: 200,
  mechanism: 'client',
});

const notFound = (
  finalPath: string,
  httpStatus: 200 | 404 = 200,
): MigrationRouteBehavior => ({
  kind: 'not-found',
  finalPath,
  httpStatus,
  appStatus: 404,
});

const migrationRouteInputs: readonly MigrationRouteInput[] = [
  {
    id: 'application-home',
    source: 'src/routes/(app)/+page.svelte',
    routePattern: '/',
    url: '/',
    family: 'application',
    setup: 'workflow-list',
    expected: redirect(`/namespaces/${namespace}/workflows`),
  },
  {
    id: 'authentication-login',
    source: 'src/routes/(login)/login/+page.svelte',
    routePattern: '/login',
    url: '/login',
    family: 'authentication',
    setup: 'global',
    expected: notFound('/login'),
  },
  {
    id: 'authentication-signin',
    source: 'src/routes/(login)/signin/+page.svelte',
    routePattern: '/signin',
    url: '/signin',
    family: 'authentication',
    setup: 'global',
    expected: notFound('/signin'),
  },
  {
    id: 'namespace-selector',
    source: 'src/routes/(app)/select-namespace/+page.svelte',
    routePattern: '/select-namespace',
    url: '/select-namespace',
    family: 'namespaces',
    setup: 'global',
    expected: render('/select-namespace'),
  },
  {
    id: 'namespaces-list',
    source: 'src/routes/(app)/namespaces/+page.svelte',
    routePattern: '/namespaces',
    url: '/namespaces',
    family: 'namespaces',
    setup: 'global',
    expected: render('/namespaces'),
  },
  {
    id: 'namespace-details',
    source: 'src/routes/(app)/namespaces/[namespace]/+page.svelte',
    routePattern: '/namespaces/[namespace]',
    url: `/namespaces/${namespace}`,
    family: 'namespaces',
    setup: 'namespace',
    expected: render(`/namespaces/${namespace}`),
  },
  {
    id: 'nexus-endpoints-list',
    source: 'src/routes/(app)/nexus/+page.svelte',
    routePattern: '/nexus',
    url: '/nexus',
    family: 'nexus-endpoints',
    setup: 'nexus-endpoint',
    expected: render('/nexus'),
  },
  {
    id: 'nexus-endpoint-create',
    source: 'src/routes/(app)/nexus/create/+page.svelte',
    routePattern: '/nexus/create',
    url: '/nexus/create',
    family: 'nexus-endpoints',
    setup: 'nexus-endpoint',
    expected: render('/nexus/create'),
  },
  {
    id: 'nexus-endpoint-details',
    source: 'src/routes/(app)/nexus/[id]/+page.svelte',
    routePattern: '/nexus/[id]',
    url: `/nexus/${operationId}`,
    family: 'nexus-endpoints',
    setup: 'nexus-endpoint',
    expected: render(`/nexus/${operationId}`),
  },
  {
    id: 'nexus-endpoint-edit',
    source: 'src/routes/(app)/nexus/[id]/edit/+page.svelte',
    routePattern: '/nexus/[id]/edit',
    url: `/nexus/${operationId}/edit`,
    family: 'nexus-endpoints',
    setup: 'nexus-endpoint',
    expected: render(`/nexus/${operationId}/edit`),
  },
  {
    id: 'workflows-list',
    source: 'src/routes/(app)/namespaces/[namespace]/workflows/+page.svelte',
    routePattern: '/namespaces/[namespace]/workflows',
    url: `/namespaces/${namespace}/workflows`,
    family: 'workflows',
    setup: 'workflow-list',
    expected: render(`/namespaces/${namespace}/workflows`),
  },
  {
    id: 'workflow-start',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/start-workflow/+page.svelte',
    routePattern: '/namespaces/[namespace]/workflows/start-workflow',
    url: `/namespaces/${namespace}/workflows/start-workflow`,
    family: 'workflows',
    setup: 'workflow-start',
    expected: render(`/namespaces/${namespace}/workflows/start-workflow`),
  },
  {
    id: 'workflow-latest-run',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/+page.ts',
    routePattern: '/namespaces/[namespace]/workflows/[workflow]',
    url: `/namespaces/${namespace}/workflows/${workflowId}`,
    family: 'workflow-details',
    setup: 'workflow-latest',
    expected: redirect(`${workflow}/timeline`),
  },
  {
    id: 'workflow-details',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/+page.svelte',
    routePattern: '/namespaces/[namespace]/workflows/[workflow]/[run]',
    url: workflow,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: redirect(`${workflow}/timeline`),
  },
  {
    id: 'workflow-timeline',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/timeline/+page.svelte',
    routePattern: '/namespaces/[namespace]/workflows/[workflow]/[run]/timeline',
    url: `${workflow}/timeline`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: render(`${workflow}/timeline`),
  },
  {
    id: 'workflow-history',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/history/+page.svelte',
    routePattern: '/namespaces/[namespace]/workflows/[workflow]/[run]/history',
    url: `${workflow}/history`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: render(`${workflow}/history`),
  },
  {
    id: 'workflow-history-event',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/history/events/[eventId]/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/workflows/[workflow]/[run]/history/events/[eventId]',
    url: `${workflow}/history/events/1`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: render(`${workflow}/history/events/1`),
  },
  {
    id: 'workflow-history-json-redirect',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/history/json/+page.ts',
    routePattern:
      '/namespaces/[namespace]/workflows/[workflow]/[run]/history/json',
    url: `${workflow}/history/json`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: redirect(`${workflow}/history`),
  },
  {
    id: 'workflow-history-feed-redirect',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/history/feed/+page.ts',
    routePattern:
      '/namespaces/[namespace]/workflows/[workflow]/[run]/history/feed',
    url: `${workflow}/history/feed`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: redirect(`${workflow}/history`),
  },
  {
    id: 'workflow-history-compact-redirect',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/history/compact/+page.ts',
    routePattern:
      '/namespaces/[namespace]/workflows/[workflow]/[run]/history/compact',
    url: `${workflow}/history/compact`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: redirect(`${workflow}/history`),
  },
  {
    id: 'workflow-history-raw-redirect',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/history.json/+page.ts',
    routePattern:
      '/namespaces/[namespace]/workflows/[workflow]/[run]/history.json',
    url: `${workflow}/history.json`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: redirect(
      `/api/v1/namespaces/${namespace}/workflows/${workflowId}/run/${runId}/history.json`,
    ),
  },
  {
    id: 'workflow-call-stack',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/call-stack/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/workflows/[workflow]/[run]/call-stack',
    url: `${workflow}/call-stack`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: render(`${workflow}/call-stack`),
  },
  {
    id: 'workflow-stack-trace-redirect',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/stack-trace/+page.ts',
    routePattern:
      '/namespaces/[namespace]/workflows/[workflow]/[run]/stack-trace',
    url: `${workflow}/stack-trace`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: redirect(`${workflow}/call-stack`),
  },
  {
    id: 'workflow-query',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/query/+page.svelte',
    routePattern: '/namespaces/[namespace]/workflows/[workflow]/[run]/query',
    url: `${workflow}/query`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: render(`${workflow}/query`),
  },
  {
    id: 'workflow-pending-activities',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/pending-activities/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/workflows/[workflow]/[run]/pending-activities',
    url: `${workflow}/pending-activities`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: render(`${workflow}/pending-activities`),
  },
  {
    id: 'workflow-workers',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/workers/+page.svelte',
    routePattern: '/namespaces/[namespace]/workflows/[workflow]/[run]/workers',
    url: `${workflow}/workers`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: render(`${workflow}/workers`),
  },
  {
    id: 'workflow-metadata',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/metadata/+page.svelte',
    routePattern: '/namespaces/[namespace]/workflows/[workflow]/[run]/metadata',
    url: `${workflow}/metadata`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: render(`${workflow}/metadata`),
  },
  {
    id: 'workflow-user-metadata',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/user-metadata/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/workflows/[workflow]/[run]/user-metadata',
    url: `${workflow}/user-metadata`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: render(`${workflow}/user-metadata`),
  },
  {
    id: 'workflow-memo',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/memo/+page.svelte',
    routePattern: '/namespaces/[namespace]/workflows/[workflow]/[run]/memo',
    url: `${workflow}/memo`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: render(`${workflow}/memo`),
  },
  {
    id: 'workflow-search-attributes',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/search-attributes/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/workflows/[workflow]/[run]/search-attributes',
    url: `${workflow}/search-attributes`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: render(`${workflow}/search-attributes`),
  },
  {
    id: 'workflow-relationships',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/relationships/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/workflows/[workflow]/[run]/relationships',
    url: `${workflow}/relationships`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: render(`${workflow}/relationships`),
  },
  {
    id: 'workflow-nexus-links',
    source:
      'src/routes/(app)/namespaces/[namespace]/workflows/[workflow]/[run]/nexus-links/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/workflows/[workflow]/[run]/nexus-links',
    url: `${workflow}/nexus-links`,
    family: 'workflow-details',
    setup: 'workflow-detail',
    expected: render(`${workflow}/nexus-links`),
  },
  {
    id: 'workers-list',
    source: 'src/routes/(app)/namespaces/[namespace]/workers/+page.svelte',
    routePattern: '/namespaces/[namespace]/workers',
    url: `/namespaces/${namespace}/workers`,
    family: 'workers',
    setup: 'worker-list',
    expected: render(`/namespaces/${namespace}/workers`),
  },
  {
    id: 'worker-details',
    source:
      'src/routes/(app)/namespaces/[namespace]/workers/[workerInstanceKey]/+page.svelte',
    routePattern: '/namespaces/[namespace]/workers/[workerInstanceKey]',
    url: `/namespaces/${namespace}/workers/worker-instance-1`,
    family: 'workers',
    setup: 'worker-list',
    expected: render(`/namespaces/${namespace}/workers/worker-instance-1`),
  },
  {
    id: 'worker-deployments-list',
    source:
      'src/routes/(app)/namespaces/[namespace]/workers/deployments/+page.svelte',
    routePattern: '/namespaces/[namespace]/workers/deployments',
    url: `/namespaces/${namespace}/workers/deployments`,
    family: 'worker-deployments',
    setup: 'worker-deployment',
    expected: render(`/namespaces/${namespace}/workers/deployments`),
  },
  {
    id: 'worker-deployment-create',
    source:
      'src/routes/(app)/namespaces/[namespace]/workers/deployments/create/+page.svelte',
    routePattern: '/namespaces/[namespace]/workers/deployments/create',
    url: `/namespaces/${namespace}/workers/deployments/create`,
    family: 'worker-deployments',
    setup: 'worker-deployment',
    expected: render(`/namespaces/${namespace}/workers/deployments/create`),
  },
  {
    id: 'worker-deployment-details',
    source:
      'src/routes/(app)/namespaces/[namespace]/workers/deployments/[deployment]/+page.svelte',
    routePattern: '/namespaces/[namespace]/workers/deployments/[deployment]',
    url: `/namespaces/${namespace}/workers/deployments/${deployment}`,
    family: 'worker-deployments',
    setup: 'worker-deployment',
    expected: render(
      `/namespaces/${namespace}/workers/deployments/${deployment}`,
    ),
  },
  {
    id: 'worker-deployment-version-create',
    source:
      'src/routes/(app)/namespaces/[namespace]/workers/deployments/[deployment]/versions/create/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/workers/deployments/[deployment]/versions/create',
    url: `/namespaces/${namespace}/workers/deployments/${deployment}/versions/create`,
    family: 'worker-deployments',
    setup: 'worker-deployment',
    expected: render(
      `/namespaces/${namespace}/workers/deployments/${deployment}/versions/create`,
    ),
  },
  {
    id: 'worker-deployment-version-edit',
    source:
      'src/routes/(app)/namespaces/[namespace]/workers/deployments/[deployment]/versions/[buildId]/edit/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/workers/deployments/[deployment]/versions/[buildId]/edit',
    url: `/namespaces/${namespace}/workers/deployments/${deployment}/versions/build-abc123/edit`,
    family: 'worker-deployments',
    setup: 'worker-deployment',
    expected: render(
      `/namespaces/${namespace}/workers/deployments/${deployment}/versions/build-abc123/edit`,
    ),
  },
  {
    id: 'legacy-worker-deployments-redirect',
    source:
      'src/routes/(app)/namespaces/[namespace]/worker-deployments/+page.ts',
    routePattern: '/namespaces/[namespace]/worker-deployments',
    url: `/namespaces/${namespace}/worker-deployments`,
    family: 'worker-deployments',
    setup: 'worker-deployment',
    expected: redirect(`/namespaces/${namespace}/workers/deployments`),
  },
  {
    id: 'legacy-worker-deployment-redirect',
    source:
      'src/routes/(app)/namespaces/[namespace]/worker-deployments/[deployment]/+page.ts',
    routePattern: '/namespaces/[namespace]/worker-deployments/[deployment]',
    url: `/namespaces/${namespace}/worker-deployments/${deployment}`,
    family: 'worker-deployments',
    setup: 'worker-deployment',
    expected: redirect(
      `/namespaces/${namespace}/workers/deployments/${deployment}`,
    ),
  },
  {
    id: 'task-queues-list',
    source: 'src/routes/(app)/namespaces/[namespace]/task-queues/+page.svelte',
    routePattern: '/namespaces/[namespace]/task-queues',
    url: `/namespaces/${namespace}/task-queues`,
    family: 'task-queues',
    setup: 'namespace',
    expected: render(`/namespaces/${namespace}/task-queues`),
  },
  {
    id: 'task-queue-details',
    source:
      'src/routes/(app)/namespaces/[namespace]/task-queues/[queue]/+page.svelte',
    routePattern: '/namespaces/[namespace]/task-queues/[queue]',
    url: `/namespaces/${namespace}/task-queues/my-task-queue`,
    family: 'task-queues',
    setup: 'task-queue',
    expected: render(`/namespaces/${namespace}/task-queues/my-task-queue`),
  },
  {
    id: 'schedules-list',
    source: 'src/routes/(app)/namespaces/[namespace]/schedules/+page.svelte',
    routePattern: '/namespaces/[namespace]/schedules',
    url: `/namespaces/${namespace}/schedules`,
    family: 'schedules',
    setup: 'schedule-list',
    expected: render(`/namespaces/${namespace}/schedules`),
  },
  {
    id: 'schedule-create',
    source:
      'src/routes/(app)/namespaces/[namespace]/schedules/create/+page.svelte',
    routePattern: '/namespaces/[namespace]/schedules/create',
    url: `/namespaces/${namespace}/schedules/create`,
    family: 'schedules',
    setup: 'schedule-list',
    expected: render(`/namespaces/${namespace}/schedules/create`),
  },
  {
    id: 'schedule-details',
    source:
      'src/routes/(app)/namespaces/[namespace]/schedules/[schedule]/+page.svelte',
    routePattern: '/namespaces/[namespace]/schedules/[schedule]',
    url: `/namespaces/${namespace}/schedules/test-schedule`,
    family: 'schedules',
    setup: 'schedule-detail',
    expected: render(`/namespaces/${namespace}/schedules/test-schedule`),
  },
  {
    id: 'schedule-edit',
    source:
      'src/routes/(app)/namespaces/[namespace]/schedules/[schedule]/edit/+page.svelte',
    routePattern: '/namespaces/[namespace]/schedules/[schedule]/edit',
    url: `/namespaces/${namespace}/schedules/test-schedule/edit`,
    family: 'schedules',
    setup: 'schedule-detail',
    expected: render(`/namespaces/${namespace}/schedules/test-schedule/edit`),
  },
  {
    id: 'nexus-operations-list',
    source:
      'src/routes/(app)/namespaces/[namespace]/nexus-operations/+page.svelte',
    routePattern: '/namespaces/[namespace]/nexus-operations',
    url: `/namespaces/${namespace}/nexus-operations`,
    family: 'nexus-operations',
    setup: 'nexus-operation-list',
    expected: render(`/namespaces/${namespace}/nexus-operations`),
  },
  {
    id: 'nexus-operation-start',
    source:
      'src/routes/(app)/namespaces/[namespace]/nexus-operations/start/+page.svelte',
    routePattern: '/namespaces/[namespace]/nexus-operations/start',
    url: `/namespaces/${namespace}/nexus-operations/start`,
    family: 'nexus-operations',
    setup: 'nexus-operation-list',
    expected: render(`/namespaces/${namespace}/nexus-operations/start`),
  },
  {
    id: 'nexus-operation-redirect',
    source:
      'src/routes/(app)/namespaces/[namespace]/nexus-operations/[operationId]/[runId]/+page.ts',
    routePattern:
      '/namespaces/[namespace]/nexus-operations/[operationId]/[runId]',
    url: operation,
    family: 'nexus-operations',
    setup: 'nexus-operation-detail',
    expected: redirect(`${operation}/details`),
  },
  {
    id: 'nexus-operation-details',
    source:
      'src/routes/(app)/namespaces/[namespace]/nexus-operations/[operationId]/[runId]/details/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/nexus-operations/[operationId]/[runId]/details',
    url: `${operation}/details`,
    family: 'nexus-operations',
    setup: 'nexus-operation-detail',
    expected: render(`${operation}/details`),
  },
  {
    id: 'nexus-operation-metadata',
    source:
      'src/routes/(app)/namespaces/[namespace]/nexus-operations/[operationId]/[runId]/metadata/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/nexus-operations/[operationId]/[runId]/metadata',
    url: `${operation}/metadata`,
    family: 'nexus-operations',
    setup: 'nexus-operation-detail',
    expected: render(`${operation}/metadata`),
  },
  {
    id: 'nexus-operation-search-attributes',
    source:
      'src/routes/(app)/namespaces/[namespace]/nexus-operations/[operationId]/[runId]/search-attributes/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/nexus-operations/[operationId]/[runId]/search-attributes',
    url: `${operation}/search-attributes`,
    family: 'nexus-operations',
    setup: 'nexus-operation-detail',
    expected: render(`${operation}/search-attributes`),
  },
  {
    id: 'catalog-list',
    source: 'src/routes/(app)/namespaces/[namespace]/catalog/+page.svelte',
    routePattern: '/namespaces/[namespace]/catalog',
    url: `/namespaces/${namespace}/catalog`,
    family: 'catalog',
    setup: 'namespace',
    expected: notFound(`/namespaces/${namespace}/catalog`),
    availability: 'development-only',
  },
  {
    id: 'catalog-example',
    source:
      'src/routes/(app)/namespaces/[namespace]/catalog/[exampleId]/+page.svelte',
    routePattern: '/namespaces/[namespace]/catalog/[exampleId]',
    url: `/namespaces/${namespace}/catalog/hello`,
    family: 'catalog',
    setup: 'namespace',
    expected: notFound(`/namespaces/${namespace}/catalog/hello`),
    availability: 'development-only',
  },
  {
    id: 'batch-operations-list',
    source:
      'src/routes/(app)/namespaces/[namespace]/batch-operations/+page.svelte',
    routePattern: '/namespaces/[namespace]/batch-operations',
    url: `/namespaces/${namespace}/batch-operations`,
    family: 'batch-operations',
    setup: 'batch-operation',
    expected: render(`/namespaces/${namespace}/batch-operations`),
  },
  {
    id: 'batch-operation-details',
    source:
      'src/routes/(app)/namespaces/[namespace]/batch-operations/[jobId]/+page.svelte',
    routePattern: '/namespaces/[namespace]/batch-operations/[jobId]',
    url: `/namespaces/${namespace}/batch-operations/xxx`,
    family: 'batch-operations',
    setup: 'batch-operation',
    expected: render(`/namespaces/${namespace}/batch-operations/xxx`),
  },
  {
    id: 'archival-list',
    source: 'src/routes/(app)/namespaces/[namespace]/archival/+page.svelte',
    routePattern: '/namespaces/[namespace]/archival',
    url: `/namespaces/${namespace}/archival`,
    family: 'archival',
    setup: 'archival',
    expected: render(`/namespaces/${namespace}/archival`),
  },
  {
    id: 'archival-history',
    source:
      'src/routes/(app)/namespaces/[namespace]/archival/[workflow]/[run]/history/+page.svelte',
    routePattern: '/namespaces/[namespace]/archival/[workflow]/[run]/history',
    url: `/namespaces/${namespace}/archival/${workflowId}/${runId}/history`,
    family: 'archival',
    setup: 'archival',
    expected: render(
      `/namespaces/${namespace}/archival/${workflowId}/${runId}/history`,
    ),
  },
  {
    id: 'agents-list',
    source: 'src/routes/(app)/namespaces/[namespace]/agents/+page.svelte',
    routePattern: '/namespaces/[namespace]/agents',
    url: `/namespaces/${namespace}/agents`,
    family: 'agents',
    setup: 'namespace',
    expected: render(`/namespaces/${namespace}/agents`),
  },
  {
    id: 'activities-list',
    source: 'src/routes/(app)/namespaces/[namespace]/activities/+page.svelte',
    routePattern: '/namespaces/[namespace]/activities',
    url: `/namespaces/${namespace}/activities`,
    family: 'activities',
    setup: 'activity-list',
    expected: render(`/namespaces/${namespace}/activities`),
  },
  {
    id: 'activity-start',
    source:
      'src/routes/(app)/namespaces/[namespace]/activities/start/+page.svelte',
    routePattern: '/namespaces/[namespace]/activities/start',
    url: `/namespaces/${namespace}/activities/start`,
    family: 'activities',
    setup: 'activity-list',
    expected: render(`/namespaces/${namespace}/activities/start`),
  },
  {
    id: 'activity-redirect',
    source:
      'src/routes/(app)/namespaces/[namespace]/activities/[activityId]/[runId]/+page.ts',
    routePattern: '/namespaces/[namespace]/activities/[activityId]/[runId]',
    url: activity,
    family: 'activities',
    setup: 'activity-detail',
    expected: redirect(`${activity}/details`),
  },
  {
    id: 'activity-details',
    source:
      'src/routes/(app)/namespaces/[namespace]/activities/[activityId]/[runId]/details/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/activities/[activityId]/[runId]/details',
    url: `${activity}/details`,
    family: 'activities',
    setup: 'activity-detail',
    expected: render(`${activity}/details`),
  },
  {
    id: 'activity-workers',
    source:
      'src/routes/(app)/namespaces/[namespace]/activities/[activityId]/[runId]/workers/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/activities/[activityId]/[runId]/workers',
    url: `${activity}/workers`,
    family: 'activities',
    setup: 'activity-detail',
    expected: render(`${activity}/workers`),
  },
  {
    id: 'activity-metadata',
    source:
      'src/routes/(app)/namespaces/[namespace]/activities/[activityId]/[runId]/metadata/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/activities/[activityId]/[runId]/metadata',
    url: `${activity}/metadata`,
    family: 'activities',
    setup: 'activity-detail',
    expected: render(`${activity}/metadata`),
  },
  {
    id: 'activity-search-attributes',
    source:
      'src/routes/(app)/namespaces/[namespace]/activities/[activityId]/[runId]/search-attributes/+page.svelte',
    routePattern:
      '/namespaces/[namespace]/activities/[activityId]/[runId]/search-attributes',
    url: `${activity}/search-attributes`,
    family: 'activities',
    setup: 'activity-detail',
    expected: render(`${activity}/search-attributes`),
  },
  {
    id: 'event-import-root-redirect',
    source: 'src/routes/(app)/import/+page.ts',
    routePattern: '/import',
    url: '/import',
    family: 'event-import',
    setup: 'global',
    expected: redirect('/import/events'),
  },
  {
    id: 'event-import',
    source: 'src/routes/(app)/import/events/+page.svelte',
    routePattern: '/import/events',
    url: '/import/events',
    family: 'event-import',
    setup: 'global',
    expected: render('/import/events'),
  },
  {
    id: 'event-import-history-redirect',
    source:
      'src/routes/(app)/import/events/[namespace]/[workflow]/[run]/history/+page.ts',
    routePattern: '/import/events/[namespace]/[workflow]/[run]/history',
    url: `/import/events/${namespace}/${workflowId}/${runId}/history`,
    family: 'event-import',
    setup: 'global',
    expected: redirect('/import/events'),
  },
  {
    id: 'event-import-history-compact',
    source:
      'src/routes/(app)/import/events/[namespace]/[workflow]/[run]/history/compact/+page.svelte',
    routePattern: '/import/events/[namespace]/[workflow]/[run]/history/compact',
    url: `/import/events/${namespace}/${workflowId}/${runId}/history/compact`,
    family: 'event-import',
    setup: 'global',
    expected: render(
      `/import/events/${namespace}/${workflowId}/${runId}/history/compact`,
    ),
  },
  {
    id: 'event-import-history-feed',
    source:
      'src/routes/(app)/import/events/[namespace]/[workflow]/[run]/history/feed/+page.svelte',
    routePattern: '/import/events/[namespace]/[workflow]/[run]/history/feed',
    url: `/import/events/${namespace}/${workflowId}/${runId}/history/feed`,
    family: 'event-import',
    setup: 'global',
    expected: render(
      `/import/events/${namespace}/${workflowId}/${runId}/history/feed`,
    ),
  },
  {
    id: 'event-import-history-json',
    source:
      'src/routes/(app)/import/events/[namespace]/[workflow]/[run]/history/json/+page.svelte',
    routePattern: '/import/events/[namespace]/[workflow]/[run]/history/json',
    url: `/import/events/${namespace}/${workflowId}/${runId}/history/json`,
    family: 'event-import',
    setup: 'global',
    expected: render(
      `/import/events/${namespace}/${workflowId}/${runId}/history/json`,
    ),
  },
  {
    id: 'error-boundary',
    source: 'src/routes/+error.svelte',
    routePattern: '/[...missing]',
    url: '/migration-evidence-not-found',
    family: 'system',
    setup: 'global',
    expected: notFound('/migration-evidence-not-found', 404),
  },
  {
    id: 'render-markdown',
    source: 'src/routes/(app)/render/+server.ts',
    routePattern: '/render',
    url: '/render?content=%23%20Migration%20evidence&compact=true',
    family: 'system',
    setup: 'none',
    expected: {
      kind: 'server-response',
      finalPath: '/render',
      httpStatus: 200,
    },
  },
];

const catchAllApprovalsByRoute: Partial<
  Record<string, readonly EvidenceCatchAllApi[]>
> = {
  'nexus-endpoints-list': ['nexus-endpoints-list'],
  'nexus-endpoint-details': ['nexus-endpoint-detail'],
  'nexus-endpoint-edit': ['nexus-endpoint-detail'],
  'worker-details': ['worker-detail'],
  'worker-deployments-list': ['worker-deployments-list'],
  'worker-deployment-details': ['worker-deployment-detail'],
  'worker-deployment-version-create': ['worker-deployment-detail'],
  'worker-deployment-version-edit': [
    'worker-deployment-detail',
    'worker-deployment-version',
  ],
  'legacy-worker-deployments-redirect': ['worker-deployments-list'],
  'legacy-worker-deployment-redirect': ['worker-deployment-detail'],
  'batch-operations-list': ['batch-operations-list'],
  'archival-list': ['archived-workflows-list'],
  'archival-history': ['archival-history'],
  'workflow-history-raw-redirect': ['raw-history'],
};

const pageErrorApprovalsByRoute: Partial<
  Record<string, readonly EvidenceKnownPageError[]>
> = {
  'workflow-user-metadata': ['detached-resize-observer-element'],
};

export const migrationRouteManifest: readonly MigrationRoute[] =
  migrationRouteInputs.map((route) => ({
    ...route,
    availability: route.availability ?? 'production',
    approvedCatchAllApis:
      route.approvedCatchAllApis ?? catchAllApprovalsByRoute[route.id] ?? [],
    approvedConsoleErrors: route.approvedConsoleErrors ?? [
      ...(route.source.startsWith('src/routes/(app)/')
        ? (['sandboxed-render-script'] as const)
        : []),
      ...(route.expected.kind === 'not-found'
        ? (['error-status-json-parse'] as const)
        : []),
      ...(route.expected.httpStatus === 404
        ? (['http-not-found-resource', 'svelte-not-found-navigation'] as const)
        : []),
    ],
    approvedPageErrors:
      route.approvedPageErrors ?? pageErrorApprovalsByRoute[route.id] ?? [],
  }));

type FamilyNavigationScenario = {
  routeId: string;
  navigation: {
    control: {
      testId: string;
      role: 'link';
      accessibleName: string;
    };
    interaction: 'focus';
    targetPath: string;
  };
};

type NonNavigableFamilyScenario = {
  nonNavigableReason: string;
};

export const migrationRouteFamilyScenarios: Record<
  MigrationRouteFamily,
  FamilyNavigationScenario | NonNavigableFamilyScenario
> = {
  application: {
    routeId: 'application-home',
    navigation: {
      control: {
        testId: 'namespace-button',
        role: 'link',
        accessibleName: 'Namespaces',
      },
      interaction: 'focus',
      targetPath: '/namespaces',
    },
  },
  authentication: {
    nonNavigableReason: 'Authentication is disabled in production parity mode',
  },
  namespaces: {
    routeId: 'namespaces-list',
    navigation: {
      control: {
        testId: 'workflow-button',
        role: 'link',
        accessibleName: 'Workflows',
      },
      interaction: 'focus',
      targetPath: `/namespaces/${namespace}/workflows`,
    },
  },
  'nexus-endpoints': {
    routeId: 'nexus-endpoints-list',
    navigation: {
      control: {
        testId: 'workflow-button',
        role: 'link',
        accessibleName: 'Workflows',
      },
      interaction: 'focus',
      targetPath: `/namespaces/${namespace}/workflows`,
    },
  },
  workflows: {
    routeId: 'workflows-list',
    navigation: {
      control: {
        testId: 'namespace-button',
        role: 'link',
        accessibleName: 'Namespaces',
      },
      interaction: 'focus',
      targetPath: '/namespaces',
    },
  },
  'workflow-details': {
    routeId: 'workflow-timeline',
    navigation: {
      control: {
        testId: 'namespace-button',
        role: 'link',
        accessibleName: 'Namespaces',
      },
      interaction: 'focus',
      targetPath: '/namespaces',
    },
  },
  'worker-deployments': {
    routeId: 'worker-deployments-list',
    navigation: {
      control: {
        testId: 'workflow-button',
        role: 'link',
        accessibleName: 'Workflows',
      },
      interaction: 'focus',
      targetPath: `/namespaces/${namespace}/workflows`,
    },
  },
  workers: {
    routeId: 'workers-list',
    navigation: {
      control: {
        testId: 'workflow-button',
        role: 'link',
        accessibleName: 'Workflows',
      },
      interaction: 'focus',
      targetPath: `/namespaces/${namespace}/workflows`,
    },
  },
  'task-queues': {
    routeId: 'task-queues-list',
    navigation: {
      control: {
        testId: 'workflow-button',
        role: 'link',
        accessibleName: 'Workflows',
      },
      interaction: 'focus',
      targetPath: `/namespaces/${namespace}/workflows`,
    },
  },
  schedules: {
    routeId: 'schedules-list',
    navigation: {
      control: {
        testId: 'workflow-button',
        role: 'link',
        accessibleName: 'Workflows',
      },
      interaction: 'focus',
      targetPath: `/namespaces/${namespace}/workflows`,
    },
  },
  'nexus-operations': {
    routeId: 'nexus-operations-list',
    navigation: {
      control: {
        testId: 'workflow-button',
        role: 'link',
        accessibleName: 'Workflows',
      },
      interaction: 'focus',
      targetPath: `/namespaces/${namespace}/workflows`,
    },
  },
  catalog: {
    nonNavigableReason:
      'Catalog routes are development-only and return 404 in production parity mode',
  },
  'batch-operations': {
    routeId: 'batch-operations-list',
    navigation: {
      control: {
        testId: 'workflow-button',
        role: 'link',
        accessibleName: 'Workflows',
      },
      interaction: 'focus',
      targetPath: `/namespaces/${namespace}/workflows`,
    },
  },
  archival: {
    routeId: 'archival-list',
    navigation: {
      control: {
        testId: 'workflow-button',
        role: 'link',
        accessibleName: 'Workflows',
      },
      interaction: 'focus',
      targetPath: `/namespaces/${namespace}/workflows`,
    },
  },
  agents: {
    routeId: 'agents-list',
    navigation: {
      control: {
        testId: 'workflow-button',
        role: 'link',
        accessibleName: 'Workflows',
      },
      interaction: 'focus',
      targetPath: `/namespaces/${namespace}/workflows`,
    },
  },
  activities: {
    routeId: 'activities-list',
    navigation: {
      control: {
        testId: 'workflow-button',
        role: 'link',
        accessibleName: 'Workflows',
      },
      interaction: 'focus',
      targetPath: `/namespaces/${namespace}/workflows`,
    },
  },
  'event-import': {
    routeId: 'event-import',
    navigation: {
      control: {
        testId: 'workflow-button',
        role: 'link',
        accessibleName: 'Workflows',
      },
      interaction: 'focus',
      targetPath: `/namespaces/${namespace}/workflows`,
    },
  },
  system: {
    nonNavigableReason:
      'Error and render responses do not expose application navigation',
  },
};
