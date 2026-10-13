<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import type { ComponentProps } from 'svelte';

  import type {
    ComputeConfig,
    DescribeWorkerDeployment,
    VersionTaskQueue,
    WorkerDeploymentVersionInfo,
  } from '$lib/types/deployments';
  import type { NamespaceRegion } from '$lib/utilities/compute-regions';

  import VersionDetailsDrawer from './version-details-drawer.svelte';

  /**
   * What the stubbed version endpoint answers. `pending` never resolves, and
   * `error` answers with a server error.
   */
  type VersionMock =
    | {
        kind: 'ok';
        info: WorkerDeploymentVersionInfo;
        taskQueues?: VersionTaskQueue[];
      }
    | { kind: 'pending' }
    | { kind: 'error'; message: string }
    | { kind: 'not-found' };

  const NAMESPACE = 'payments';
  const DEPLOYMENT = 'orders-worker';
  const EAST = 'aws-us-east-1';
  const WEST = 'aws-us-west-2';

  const encode = (value: unknown): string => btoa(JSON.stringify(value));
  const json = (value: unknown) => ({
    metadata: { encoding: btoa('json/plain') },
    data: encode(value),
  });

  const lambdaGroup = (
    region: string,
    scaling: { cooloff?: number; threshold?: number } = {},
  ) => ({
    taskQueueTypes: ['TASK_QUEUE_TYPE_WORKFLOW', 'TASK_QUEUE_TYPE_ACTIVITY'],
    provider: {
      type: 'aws-lambda',
      details: json({
        arn: `arn:aws:lambda:${region}:123456789012:function:${DEPLOYMENT}`,
        role: 'arn:aws:iam::123456789012:role/Temporal-Cloud-Serverless-Worker',
        role_external_id: 'tmprl-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      }),
    },
    scaler: {
      type: 'no-sync',
      details: json({
        scale_up_cooloff_ms: scaling.cooloff ?? 5000,
        scale_up_backlog_threshold: scaling.threshold ?? 10,
        max_worker_lifetime_ms: 900000,
        metrics_poll_interval_ms: 30000,
      }),
    },
  });

  const configs = {
    single: {
      scalingGroups: { default: lambdaGroup('us-east-1') },
    },
    inherits: {
      scalingGroups: {
        default: lambdaGroup('us-east-1'),
        secondary: { ...lambdaGroup('us-west-2'), regionIds: [WEST] },
      },
    },
    customized: {
      scalingGroups: {
        default: lambdaGroup('us-east-1'),
        secondary: {
          ...lambdaGroup('us-west-2', { cooloff: 10000, threshold: 25 }),
          regionIds: [WEST],
        },
      },
    },
    missingReplica: {
      scalingGroups: {
        'orders-east': { ...lambdaGroup('us-east-1'), regionIds: [EAST] },
      },
    },
  } satisfies Record<string, ComputeConfig>;

  const singleRegion: NamespaceRegion[] = [{ regionId: EAST, role: 'primary' }];
  const multiRegion: NamespaceRegion[] = [
    { regionId: EAST, role: 'primary' },
    { regionId: WEST, role: 'replica' },
  ];

  const BUILD_ID = '2.4.0';

  const versionInfo = (
    overrides: Partial<WorkerDeploymentVersionInfo> = {},
  ): WorkerDeploymentVersionInfo => ({
    version: `${DEPLOYMENT}:${BUILD_ID}`,
    deploymentVersion: { deploymentName: DEPLOYMENT, buildId: BUILD_ID },
    deploymentName: DEPLOYMENT,
    status: 'WORKER_DEPLOYMENT_VERSION_STATUS_CURRENT',
    createTime: '2026-09-21T16:04:00Z',
    routingChangedTime: '2026-09-22T09:12:00Z',
    currentSinceTime: '2026-09-22T09:12:00Z',
    firstActivationTime: '2026-09-22T09:12:00Z',
    computeConfig: configs.inherits,
    taskQueueInfos: [
      { name: 'orders', type: 'TASK_QUEUE_TYPE_WORKFLOW' },
      { name: 'orders', type: 'TASK_QUEUE_TYPE_ACTIVITY' },
    ],
    metadata: {
      entries: {
        commit: json('a1b2c3d'),
        release: json('2026.10.12'),
        owner: json('payments-team'),
      },
    },
    lastModifierIdentity: 'deploy-bot@payments',
    ...overrides,
  });

  const taskQueuesWithStats: VersionTaskQueue[] = [
    {
      name: 'orders',
      type: 'TASK_QUEUE_TYPE_WORKFLOW',
      stats: {
        approximateBacklogCount: '12',
        approximateBacklogAge: '4.2s',
        tasksAddRate: 3.4,
        tasksDispatchRate: 3.1,
      },
    },
    {
      name: 'orders',
      type: 'TASK_QUEUE_TYPE_ACTIVITY',
      stats: {
        approximateBacklogCount: '0',
        approximateBacklogAge: '0s',
        tasksAddRate: 8.9,
        tasksDispatchRate: 8.9,
      },
    },
  ];

  /** The Deployment the page already loaded. The drawer finds its Version here. */
  const deploymentFor = (
    info: WorkerDeploymentVersionInfo | undefined,
    routing: 'current' | 'ramping' | 'inactive' = 'current',
  ): DescribeWorkerDeployment => {
    const deploymentVersion = { deploymentName: DEPLOYMENT, buildId: BUILD_ID };
    return {
      name: DEPLOYMENT,
      createTime: '2026-08-30T12:00:00Z',
      routingConfig: {
        ...(routing === 'current'
          ? { currentDeploymentVersion: deploymentVersion }
          : {}),
        ...(routing === 'ramping'
          ? {
              currentDeploymentVersion: {
                deploymentName: DEPLOYMENT,
                buildId: '2.3.1',
              },
              rampingDeploymentVersion: deploymentVersion,
              rampingVersionPercentage: 25,
            }
          : {}),
      },
      versionSummaries: info
        ? [
            {
              version: info.version,
              status: info.status,
              deploymentVersion,
              createTime: info.createTime,
              computeConfig: info.computeConfig,
            },
          ]
        : [],
    };
  };

  // The drawer reads `$app/state`; the API helpers still read `$app/stores`.
  const pageAt = (buildId: string) => {
    const page = {
      url: new URL(
        `http://localhost/namespaces/${NAMESPACE}/deployments/${DEPLOYMENT}?version=${encodeURIComponent(buildId)}`,
      ),
      params: { namespace: NAMESPACE, deployment: DEPLOYMENT },
      data: {},
    };
    return {
      sveltekit_experimental: { state: { page }, stores: { page } },
    };
  };

  const respond = (body: unknown, status = 200): Response =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  /** Answers the version endpoint from `parameters.versionMock`. */
  const mockVersionEndpoint = (mock: VersionMock): typeof fetch => {
    const original = globalThis.fetch;
    return async (input, init) => {
      const url = new URL(
        typeof input === 'string' || input instanceof URL ? input : input.url,
        location.href,
      );
      if (!url.pathname.includes('/worker-deployment-versions/')) {
        return original(input, init);
      }
      if (mock.kind === 'pending') return new Promise<Response>(() => {});
      if (mock.kind === 'error') {
        return respond({ code: 13, message: mock.message }, 500);
      }
      if (mock.kind === 'not-found') {
        return respond({ workerDeploymentVersionInfo: {} });
      }
      const withStats = url.searchParams.get('reportTaskQueueStats') === 'true';
      return respond({
        workerDeploymentVersionInfo: mock.info,
        ...(withStats ? { versionTaskQueues: mock.taskQueues ?? [] } : {}),
      });
    };
  };

  const { Story } = defineMeta({
    title: 'Deployments/Version Details Drawer',
    component: VersionDetailsDrawer,
    parameters: { layout: 'fullscreen' },
    args: {
      namespace: NAMESPACE,
      deploymentName: DEPLOYMENT,
      conflictToken: 'conflict-token',
    },
    beforeEach: ({ parameters }) => {
      const original = globalThis.fetch;
      const mock = parameters.versionMock as VersionMock | undefined;
      if (mock) globalThis.fetch = mockVersionEndpoint(mock);
      return () => {
        globalThis.fetch = original;
      };
    },
  });

  const okInfo = versionInfo();
</script>

{#snippet template(args: ComponentProps<typeof VersionDetailsDrawer>)}
  <VersionDetailsDrawer
    {...args}
    onChange={action('change')}
    onValidationComplete={action('validation-complete')}
  />
{/snippet}

<Story
  name="Multi-Region, Replica Inherits"
  args={{ info: deploymentFor(okInfo), namespaceRegions: multiRegion }}
  parameters={{
    ...pageAt(BUILD_ID),
    versionMock: {
      kind: 'ok',
      info: okInfo,
      taskQueues: taskQueuesWithStats,
    },
  }}
  {template}
/>

<Story
  name="Multi-Region, Replica Customized"
  args={{
    info: deploymentFor(versionInfo({ computeConfig: configs.customized })),
    namespaceRegions: multiRegion,
  }}
  parameters={{
    ...pageAt(BUILD_ID),
    versionMock: {
      kind: 'ok',
      info: versionInfo({ computeConfig: configs.customized }),
      taskQueues: taskQueuesWithStats,
    },
  }}
  {template}
/>

<Story
  name="Multi-Region, Replica Missing"
  args={{
    info: deploymentFor(versionInfo({ computeConfig: configs.missingReplica })),
    namespaceRegions: multiRegion,
  }}
  parameters={{
    ...pageAt(BUILD_ID),
    versionMock: {
      kind: 'ok',
      info: versionInfo({ computeConfig: configs.missingReplica }),
      taskQueues: taskQueuesWithStats,
    },
  }}
  {template}
/>

<Story
  name="Single Region, Ramping"
  args={{
    info: deploymentFor(
      versionInfo({
        computeConfig: configs.single,
        status: 'WORKER_DEPLOYMENT_VERSION_STATUS_RAMPING',
        currentSinceTime: undefined,
        rampingSinceTime: '2026-10-12T15:30:00Z',
      }),
      'ramping',
    ),
    namespaceRegions: singleRegion,
  }}
  parameters={{
    ...pageAt(BUILD_ID),
    versionMock: {
      kind: 'ok',
      info: versionInfo({
        computeConfig: configs.single,
        status: 'WORKER_DEPLOYMENT_VERSION_STATUS_RAMPING',
        currentSinceTime: undefined,
        rampingSinceTime: '2026-10-12T15:30:00Z',
      }),
      taskQueues: taskQueuesWithStats,
    },
  }}
  {template}
/>

<Story
  name="Self-Managed Workers"
  args={{
    info: deploymentFor(
      versionInfo({
        computeConfig: undefined,
        status: 'WORKER_DEPLOYMENT_VERSION_STATUS_DRAINED',
        currentSinceTime: undefined,
        lastDeactivationTime: '2026-10-01T08:00:00Z',
        metadata: undefined,
        lastModifierIdentity: undefined,
      }),
      'inactive',
    ),
    namespaceRegions: singleRegion,
  }}
  parameters={{
    ...pageAt(BUILD_ID),
    versionMock: {
      kind: 'ok',
      info: versionInfo({
        computeConfig: undefined,
        status: 'WORKER_DEPLOYMENT_VERSION_STATUS_DRAINED',
        currentSinceTime: undefined,
        lastDeactivationTime: '2026-10-01T08:00:00Z',
        metadata: undefined,
        lastModifierIdentity: undefined,
      }),
      taskQueues: [],
    },
  }}
  {template}
/>

<Story
  name="Loading"
  args={{ info: deploymentFor(okInfo), namespaceRegions: multiRegion }}
  parameters={{ ...pageAt(BUILD_ID), versionMock: { kind: 'pending' } }}
  {template}
/>

<Story
  name="Not Found"
  args={{ info: deploymentFor(undefined), namespaceRegions: multiRegion }}
  parameters={{ ...pageAt('9.9.9'), versionMock: { kind: 'not-found' } }}
  {template}
/>

<Story
  name="Load Error"
  args={{ info: deploymentFor(okInfo), namespaceRegions: multiRegion }}
  parameters={{
    ...pageAt(BUILD_ID),
    versionMock: { kind: 'error', message: 'Namespace payments is not found.' },
  }}
  {template}
/>
