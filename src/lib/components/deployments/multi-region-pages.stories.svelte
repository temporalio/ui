<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import Card from '$lib/holocene/card.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { IconChevronDown, IconChevronRight } from '$lib/io/icon';
  import type {
    ComputeConfig,
    ComputeStatus,
    DeploymentStatus as VersionStatus,
  } from '$lib/types/deployments';

  import DeploymentStatus from './deployment-status.svelte';
  import VersionComputeDetails from './version-compute-details.svelte';
  import VersionRegions from './version-regions.svelte';

  type Topology = 'single' | 'multi';
  type StoryArgs = { namespace: Topology };

  const { Story } = defineMeta({
    title: 'Workers/Multi-Region/Pages',
    args: { namespace: 'multi' },
    argTypes: {
      namespace: {
        name: 'Namespace',
        control: {
          type: 'inline-radio',
          labels: { single: 'Single region', multi: 'Multi-region' },
        },
        options: ['single', 'multi'],
      },
    },
  });

  const encode = (value: object): string => btoa(JSON.stringify(value));

  const lambdaGroup = (region: string, fn: string) => ({
    provider: {
      type: 'aws-lambda',
      details: {
        metadata: { encoding: btoa('json/plain') },
        data: encode({
          arn: `arn:aws:lambda:${region}:123456789012:function:${fn}`,
          role: 'arn:aws:iam::123456789012:role/Temporal-Cloud-Serverless-Worker',
          role_external_id: 'tmprl-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        }),
      },
    },
    scaler: {
      type: 'no-sync',
      details: {
        metadata: { encoding: btoa('json/plain') },
        data: encode({
          scale_up_cooloff_ms: 5000,
          scale_up_backlog_threshold: 10,
          max_worker_lifetime_ms: 900000,
          metrics_poll_interval_ms: 30000,
        }),
      },
    },
  });

  const EAST = 'aws-us-east-1';
  const WEST = 'aws-us-west-2';

  /** Today's configs: one group with no regionId, a catch-all for any Region. */
  const legacyDefault = (fn: string): ComputeConfig => ({
    scalingGroups: { default: lambdaGroup('us-east-1', fn) },
  });

  /** One group per Region. Group names are arbitrary. */
  const perRegion = (fn: string): ComputeConfig => ({
    scalingGroups: {
      'orders-east': { ...lambdaGroup('us-east-1', fn), regionId: EAST },
      'orders-west': { ...lambdaGroup('us-west-2', fn), regionId: WEST },
    },
  });

  /** The PRD upgrade path: keep `default`, append a replica group. */
  const upgraded = (fn: string): ComputeConfig => ({
    scalingGroups: {
      default: lambdaGroup('us-east-1', fn),
      secondary: { ...lambdaGroup('us-west-2', fn), regionId: WEST },
    },
  });

  /** Configured before the replica was added; nothing runs after failover. */
  const primaryOnly = (fn: string): ComputeConfig => ({
    scalingGroups: {
      'orders-east': { ...lambdaGroup('us-east-1', fn), regionId: EAST },
    },
  });

  const connected: ComputeStatus = {
    providerValidation: { lastCheckTime: '2026-09-22T10:00:00Z' },
  };
  const failed: ComputeStatus = {
    providerValidation: {
      lastCheckTime: '2026-09-22T10:00:00Z',
      errorMessage: 'Access denied: Temporal could not assume the IAM role',
    },
  };
  const pending: ComputeStatus = { providerValidation: {} };

  const namespaceRegionsFor = (namespace: Topology): string[] =>
    namespace === 'multi' ? [EAST, WEST] : [EAST];

  const deploymentsFor = (namespace: Topology) =>
    [
      {
        name: 'orders-worker',
        current: '2.4.0',
        created: 'Sep 21, 2026',
        multi: perRegion,
      },
      {
        name: 'billing-worker',
        current: '1.0.3',
        created: 'Sep 12, 2026',
        multi: upgraded,
      },
      {
        name: 'notifications-worker',
        current: '3.1.0',
        created: 'Aug 30, 2026',
        multi: primaryOnly,
      },
    ].map((d) => ({
      ...d,
      config: namespace === 'multi' ? d.multi(d.name) : legacyDefault(d.name),
      computeStatus: connected,
    }));

  const versionsFor = (
    namespace: Topology,
  ): {
    buildId: string;
    status: VersionStatus;
    deployed: string;
    config: ComputeConfig;
    computeStatus: ComputeStatus;
    expanded: boolean;
  }[] => {
    const multi = namespace === 'multi';
    const config = (multiConfig: (fn: string) => ComputeConfig) =>
      multi ? multiConfig('orders-worker') : legacyDefault('orders-worker');
    return [
      {
        buildId: '2.4.0',
        status: 'Current',
        deployed: 'Sep 21, 2026',
        config: config(perRegion),
        computeStatus: connected,
        expanded: true,
      },
      {
        buildId: '2.3.1',
        status: 'Draining',
        deployed: 'Sep 14, 2026',
        config: config(upgraded),
        computeStatus: failed,
        expanded: false,
      },
      {
        buildId: '2.2.0',
        status: 'Drained',
        deployed: 'Aug 28, 2026',
        config: config(primaryOnly),
        computeStatus: connected,
        expanded: false,
      },
      {
        buildId: '2.1.0',
        status: 'Drained',
        deployed: 'Aug 12, 2026',
        config: config(legacyDefault),
        computeStatus: pending,
        expanded: false,
      },
    ];
  };
</script>

<Story name="Deployments List">
  {#snippet template(args: StoryArgs)}
    <div class="max-w-[62rem] p-4">
      <h1 class="mb-4 text-2xl font-semibold">Worker Deployments</h1>
      <Card class="p-0">
        <table class="w-full text-sm">
          <thead class="border-b border-primary">
            <tr class="text-left">
              <th class="px-4 py-2 font-medium">Deployment</th>
              <th class="px-4 py-2 font-medium">Current Version</th>
              <th class="px-4 py-2 font-medium">Created At</th>
            </tr>
          </thead>
          <tbody>
            {#each deploymentsFor(args.namespace) as d (d.name)}
              <tr class="border-b border-primary">
                <td class="px-4 py-2">{d.name}</td>
                <td class="px-4 py-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <Link href="/">{d.current}</Link>
                    <VersionRegions
                      computeConfig={d.config}
                      namespaceRegions={namespaceRegionsFor(args.namespace)}
                      computeStatus={d.computeStatus}
                      showConnectionStatus
                    />
                  </div>
                </td>
                <td class="px-4 py-2 text-secondary">{d.created}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </Card>
    </div>
  {/snippet}
</Story>

<Story name="Deployment Detail">
  {#snippet template(args: StoryArgs)}
    <div class="max-w-[62rem] p-4">
      <h1 class="mb-4 text-2xl font-semibold">orders-worker</h1>
      <Card class="p-0">
        <table class="w-full text-sm">
          <thead class="border-b border-primary">
            <tr class="text-left align-bottom">
              <th class="px-3 py-2 font-medium">Build ID</th>
              <th class="px-3 py-2 font-medium">Lifecycle</th>
              <th class="whitespace-nowrap px-3 py-2 font-medium">
                Region
                <span class="font-normal text-secondary"
                  >(Primary, Replica)</span
                >
              </th>
              <th class="px-3 py-2 font-medium">Deployed At</th>
            </tr>
          </thead>
          <tbody>
            {#each versionsFor(args.namespace) as v (v.buildId)}
              <tr class="border-b border-primary">
                <td class="px-3 py-2 align-middle">
                  <span class="flex items-center gap-2">
                    {#if v.expanded}
                      <IconChevronDown
                        width={14}
                        height={14}
                        class="text-secondary"
                      />
                    {:else}
                      <IconChevronRight
                        width={14}
                        height={14}
                        class="text-secondary"
                      />
                    {/if}
                    <span>{v.buildId}</span>
                  </span>
                </td>
                <td class="px-3 py-2 align-middle">
                  <DeploymentStatus
                    status={v.status}
                    label={v.status}
                    appearance="badge"
                  />
                </td>
                <td class="px-3 py-2 align-middle">
                  <VersionRegions
                    computeConfig={v.config}
                    namespaceRegions={namespaceRegionsFor(args.namespace)}
                    computeStatus={v.computeStatus}
                    showConnectionStatus
                  />
                </td>
                <td class="px-3 py-2 align-middle text-secondary"
                  >{v.deployed}</td
                >
              </tr>
              {#if v.expanded}
                <tr class="border-b border-primary">
                  <td colspan="4" class="p-0">
                    <VersionComputeDetails computeConfig={v.config} />
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </Card>
    </div>
  {/snippet}
</Story>
